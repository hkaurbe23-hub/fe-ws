"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useSession } from "next-auth/react"
import { LoginForm } from "@/components/login-form"

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Email/password login
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard")
    }

    // Google login
    if (session) {
      router.replace("/dashboard")
    }
  }, [isAuthenticated, isLoading, session, router])

  if (isLoading || status === "loading") {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (isAuthenticated || session) return null

  return <LoginForm />
}

