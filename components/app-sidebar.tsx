"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CircuitBoard,
  BarChart3,
  Bell,
  FileText,
  Settings,
  Zap,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { WattSenseLogo } from "@/components/wattsense-logo"

// ✅ ADMIN NAV
const adminNav = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { title: "Boards", icon: CircuitBoard, href: "/dashboard/boards" },
]

// ✅ USER NAV (FIXED ORDER + ICON)
const userNav = [
  { title: "My Boards", icon: CircuitBoard, href: "/dashboard/my-boards" },
  { title: "Energy Dashboard", icon: Zap, href: "/dashboard/energy" },
  { title: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
  { title: "Alarms", icon: Bell, href: "/dashboard/alarms" },
  { title: "Reports", icon: FileText, href: "/dashboard/reports" },
  { title: "Settings", icon: Settings, href: "/dashboard/settings" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const collapsed = state === "collapsed"

  const renderMenu = (items: typeof adminNav) =>
    items.map((item) => {
      const isActive =
        pathname === item.href ||
        (item.href !== "/dashboard" &&
          pathname.startsWith(item.href))

      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            asChild
            isActive={isActive}
            tooltip={item.title}
          >
            <Link href={item.href}>
              <item.icon className="size-4" />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )
    })

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 py-4">
        <WattSenseLogo collapsed={collapsed} />
      </SidebarHeader>

      <SidebarContent>
        {/* 🔴 ADMIN */}
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderMenu(adminNav)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* 🟢 USER */}
        <SidebarGroup>
          <SidebarGroupLabel>User</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderMenu(userNav)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}