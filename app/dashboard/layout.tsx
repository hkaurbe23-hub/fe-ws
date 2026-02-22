"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useSession } from "next-auth/react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Topbar } from "@/components/topbar"
import { Toaster } from "sonner"
import { FloorsProvider } from "@/lib/floor-context" // ✅ ADD THIS

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (
      !isLoading &&
      status !== "loading" &&
      !isAuthenticated &&
      !session
    ) {
      router.replace("/")
    }
  }, [isAuthenticated, isLoading, session, status, router])

  if (isLoading || status === "loading") {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated && !session) return null

  return (
    <FloorsProvider> {/* ✅ WRAP EVERYTHING */}
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

