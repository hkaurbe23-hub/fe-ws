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
  { title: "Dashboard", icon: CircuitBoard, href: "/user" },
  { title: "My Boards", icon: CircuitBoard, href: "/user/my-boards" },
  { title: "Analytics", icon: BarChart3, href: "/user/analytics" },
  { title: "Alarms", icon: Bell, href: "/user/alarms" },
  { title: "Reports", icon: FileText, href: "/user/reports" },
  { title: "Settings", icon: Settings, href: "/user/settings" },
]

export function UserSidebar() {
  const pathname = usePathname()
  const { state, setOpenMobile } = useSidebar()
  const collapsed = state === "collapsed"

  const renderMenu = (items: typeof navItems) =>
  items.map((item) => {
    const isActive =
      item.href === "/user"
        ? pathname === "/user"
        : pathname.startsWith(item.href)

      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            asChild
            isActive={isActive}
            tooltip={item.title}
            className="
              h-auto
              p-0
              bg-transparent
              hover:bg-transparent
              border-none
              shadow-none
            "
          >
            <Link
             href={item.href}
  onClick={() => {
    setOpenMobile(false)
  }}
              className={`
                relative
                flex
                items-center
                gap-4
                transition-all
                duration-300

                ${
                  collapsed
                    ? `
                        justify-center
                        w-[60px]
                        h-[60px]
                        rounded-2xl
                        mx-auto
                        overflow-visible
                      `
                    : `
                        h-[62px]
                        px-5
                        rounded-r-full
                      `
                }

                ${
                  isActive
                    ? `
                        bg-white
                        text-[#1e293b]
                        shadow-none
                        ${collapsed ? "" : "pr-12 mr-[-25px]"}
                        relative
                        z-20
                      `
                    : `
                        text-white
                        hover:bg-white/18
                      `
                }
              `}
            >
              {/* ICON */}
              <div
                className={`
                  flex
                  items-center
                  justify-center

                  ${collapsed ? "w-[48px] h-[48px]" : "min-w-[42px] h-[42px]"}

                  rounded-xl
                  transition-all

                  ${
                    isActive
                      ? "bg-[#0d9488]/10 text-[#0d9488]"
                      : "bg-white/20 text-white"
                  }
                `}
              >
                <item.icon className="size-5" />
              </div>

              {/* TEXT */}
              {!collapsed && (
                <span
                  className={`
                    text-[18px]
                    font-semibold
                    tracking-[0.01em]
                    transition-all

                    ${
                      isActive
                        ? "text-[#1e293b]"
                        : "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.18)]"
                    }
                  `}
                >
                  {item.title}
                </span>
              )}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )
    })

  return (
    <Sidebar
      collapsible="icon"
      className="
        border-r-0
        bg-transparent
        w-[260px]
        data-[state=collapsed]:w-[75px]
        transition-all
        duration-300
      "
    >
      <div
        className="
          h-full
          px-0.8
          pt-4
          relative
          overflow-visible
        "
        style={{
          background: "linear-gradient(160deg, #0f766e 0%, #0d9488 50%, #0a7870 100%)",
        }}
      >
        {/* DECORATIVE CIRCLES */}
        <div
          className="absolute bottom-[-80px] left-[-60px] w-[180px] h-[180px] rounded-full"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
        <div
          className="absolute top-[120px] right-[-40px] w-[120px] h-[120px] rounded-full"
          style={{ background: "rgba(255,255,255,0.05)" }}
        />

        {/* LOGO */}
        <SidebarHeader className="mb-8">
          <div
            className={`
              border
              border-white/20
              backdrop-blur-xl
              transition-all
              duration-300

              ${
                collapsed
                  ? "rounded-2xl p-3 flex justify-center"
                  : "rounded-[30px] px-4 py-4"
              }
            `}
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            <WattSenseLogo collapsed={collapsed} />
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel
                className="
                  text-white/90
                  uppercase
                  tracking-[0.22em]
                  text-xs
                  font-bold
                  px-3
                  mb-4
                "
              >
                Navigation
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {renderMenu(navItems)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarRail />
      </div>
    </Sidebar>
  )
}