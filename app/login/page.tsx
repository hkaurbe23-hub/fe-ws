"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession, signIn } from "next-auth/react"

export default function LoginPage() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/user")
    }
  }, [status, router])

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white">

      {/* Background Glow */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl border border-blue-100 bg-white/80 backdrop-blur-xl p-10 shadow-2xl">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30">
            <span className="text-white text-2xl">⚡</span>
          </div>

          <h1 className="text-3xl font-bold text-blue-700 tracking-tight">
            WattSense
          </h1>
          <p className="text-sm text-blue-500 mt-1">
            Energy Monitoring Platform
          </p>
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-slate-800">
            Welcome Back
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Sign in securely using your Google account
          </p>
        </div>

        {/* Google Button */}
        <button
          onClick={() =>
            signIn("google", {
              callbackUrl: "/user",
              prompt: "select_account",
            })
          }
          className="group flex w-full items-center justify-center gap-3 rounded-xl border border-blue-200 bg-white py-3 text-sm font-medium text-slate-700 shadow-md transition-all duration-200 hover:shadow-lg hover:border-blue-400 active:scale-[0.98]"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="h-5 w-5 transition-transform group-hover:scale-110"
          />
          Continue with Google
        </button>

      </div>
    </div>
  )
}