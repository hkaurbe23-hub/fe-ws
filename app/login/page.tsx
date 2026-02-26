"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { LoginForm } from "@/components/login-form"

const ADMIN_EMAILS = [
  "mishkaautomator@gmail.com",
  "hkaur_be23@thapar.edu",
]

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    const email = session?.user?.email
    if (!email) return

    // Always go to user dashboard first
    router.replace("/user")
  }, [session, status, router])

  if (status === "loading") {
    return <div style={{ padding: 40 }}>Loading...</div>
  }

  return (
    <div className="flex flex-col items-center">
      <LoginForm />

      {/* ✅ NEW: Sign Up Option */}
      <div className="mt-4 text-sm text-center">
        Don’t have an account?{" "}
        <a
          href="/signup"
          className="text-primary font-medium hover:underline"
        >
          Sign Up
        </a>
      </div>
    </div>
  )
}