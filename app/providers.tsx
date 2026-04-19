"use client"

import { SessionProvider } from "next-auth/react"
import { FloorsProvider } from "@/lib/floor-context"

export function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <FloorsProvider>
        {children}
      </FloorsProvider>
    </SessionProvider>
  )
}