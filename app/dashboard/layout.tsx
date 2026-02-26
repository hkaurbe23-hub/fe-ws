"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Topbar } from "@/components/topbar"
import { Toaster } from "sonner"
import { FloorsProvider } from "@/lib/floor-context"

const ADMIN_EMAILS = [
  "mishkaautomator@gmail.com",
  "hkaur_be23@thapar.edu",
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [checkingToken, setCheckingToken] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    const googleEmail = session?.user?.email
    const jwtRole = localStorage.getItem("userRole")
    const existingToken = localStorage.getItem("jwtToken")

    const setupAuth = async () => {
      try {
        // 🔹 1. If Google login & no JWT → get JWT from backend
        if (googleEmail && !existingToken) {
          const res = await fetch(
            "https://api.wattsense.in/api/auth/google",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: googleEmail,
              }),
            }
          )

          const data = await res.json()

          if (data.token) {
            localStorage.setItem("jwtToken", data.token)

            // Optional: decode role if backend sends it separately
            // Otherwise role logic can rely on email list
          }
        }

        // 🔹 2. Admin check (Manual JWT role)
        if (jwtRole === "admin") {
          setAuthorized(true)
          setCheckingToken(false)
          return
        }

        // 🔹 3. Admin check (Google email whitelist)
        if (googleEmail && ADMIN_EMAILS.includes(googleEmail)) {
          setAuthorized(true)
          setCheckingToken(false)
          return
        }

        // 🔹 4. Not admin → redirect
        router.replace("/user")
      } catch (err) {
        console.error("Auth setup failed:", err)
        router.replace("/login")
      } finally {
        setCheckingToken(false)
      }
    }

    setupAuth()
  }, [session, status, router])

  if (status === "loading" || checkingToken || !authorized) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <FloorsProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Topbar />
          <div className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </div>
        </SidebarInset>
        <Toaster position="bottom-right" richColors />
      </SidebarProvider>
    </FloorsProvider>
  )
}