"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { UserSidebar } from "@/components/user-sidebar"
import { Topbar } from "@/components/topbar"
import { Toaster } from "sonner"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [checkingToken, setCheckingToken] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") return

    const jwtToken = localStorage.getItem("jwtToken")
    const jwtRole = localStorage.getItem("userRole")

    if (!jwtToken) {
      router.replace("/login")
      return
    }

    if (jwtRole === "admin") {
      router.replace("/dashboard")
      return
    }

    setAuthorized(true)
    setCheckingToken(false)
  }, [router])

  if (checkingToken || !authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">

        <UserSidebar />

        <div className="flex flex-1 flex-col">
          <Topbar />

          <main className="flex-1 overflow-auto">
            <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>

      <Toaster position="bottom-right" richColors />
    </SidebarProvider>
  )
}