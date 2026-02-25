"use client"

import { useEffect } from "react"
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

  useEffect(() => {
    if (status === "loading") return

    if (!session?.user?.email) {
      router.replace("/login")
      return
    }

   if (!ADMIN_EMAILS.includes(session.user.email)) {
      router.replace("/user")
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  // Prevent flash before redirect
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
  return null
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