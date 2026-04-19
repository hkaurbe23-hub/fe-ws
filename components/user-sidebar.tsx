"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CircuitBoard,
  BarChart3,
  Bell,
  FileText,
  Settings,
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

const navItems = [
  { title: "My Boards", icon: CircuitBoard, href: "/user" },
  { title: "Analytics", icon: BarChart3, href: "/user/analytics" },
  { title: "Alarms", icon: Bell, href: "/user/alarms" },
  { title: "Reports", icon: FileText, href: "/user/reports" },
  { title: "Settings", icon: Settings, href: "/user/settings" },
]

export function UserSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const collapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 py-4">
        <WattSenseLogo collapsed={collapsed} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/user" &&
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
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}