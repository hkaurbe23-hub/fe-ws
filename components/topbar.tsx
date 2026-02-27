"use client"

import { LogOut, User } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function Topbar() {
  const { user } = useAuth()
  const { data: session } = useSession()

  // 🔥 Always prefer Google session email if exists
  const displayEmail =
    session?.user?.email || user?.email || "User"

  const initials = displayEmail
    .split("@")[0]
    .substring(0, 2)
    .toUpperCase()

  const handleLogout = async () => {
    localStorage.removeItem("jwtToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userEmail")

    await signOut({ callbackUrl: "/login" })
  }

  return (
    <header className="flex h-14 items-center gap-3 border-b border-border bg-card px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />
      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative flex items-center gap-2 rounded-full px-2"
          >
            <Avatar className="size-7">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium text-foreground sm:inline-block">
              {displayEmail}
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {displayEmail}
            </span>
            <span className="text-xs text-muted-foreground">
              {displayEmail}
            </span>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem className="gap-2">
            <User className="size-4" />
            Profile
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => (window.location.href = "/user")}
            className="gap-2"
          >
            <User className="size-4" />
            Login as User
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            className="gap-2 text-destructive"
          >
            <LogOut className="size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}