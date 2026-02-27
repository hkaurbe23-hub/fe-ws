"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { UserSidebar } from "@/components/user-sidebar"
import { Topbar } from "@/components/topbar"
import { Toaster } from "sonner"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">

        {/* User Sidebar */}
        <UserSidebar />

        {/* Main Content */}
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