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

    if (googleEmail) {
      localStorage.setItem("userEmail", googleEmail)
    }

    const setupAuth = async () => {
      try {
        if (googleEmail) {
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
            localStorage.setItem("userEmail", googleEmail)
          }
        }

        if (jwtRole === "admin") {
          setAuthorized(true)
          setCheckingToken(false)
          return
        }

        if (googleEmail && ADMIN_EMAILS.includes(googleEmail)) {
          setAuthorized(true)
          setCheckingToken(false)
          return
        }

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

          {/* ✅ FIXED WRAPPER */}
          <div className="flex-1 overflow-auto">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </div>

        </SidebarInset>
        <Toaster position="bottom-right" richColors />
      </SidebarProvider>
    </FloorsProvider>
  )
}