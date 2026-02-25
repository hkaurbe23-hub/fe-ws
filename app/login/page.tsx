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

    if (ADMIN_EMAILS.includes(email)) {
      router.replace("/dashboard")
    } else {
      router.replace("/user")
    }
  }, [session, status, router])

  if (status === "loading") {
    return <div style={{ padding: 40 }}>Loading...</div>
  }

  return <LoginForm />
}