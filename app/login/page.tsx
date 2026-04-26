"use client"

import { useEffect } from "react"
import { signIn } from "next-auth/react"
export default function LoginPage() {

  // ✅ If already logged in → skip login page
useEffect(() => {
  const token = localStorage.getItem("jwtToken")
  const role = localStorage.getItem("userRole")

  // ✅ If already logged in locally → go dashboard
  if (token && role) {
    window.location.href = role === "admin" ? "/dashboard" : "/user"
    return
  }

  // ✅ If token missing → check Google session
  fetch("/api/auth/session")
    .then(res => res.json())
    .then(session => {
      if (session?.user?.email) {
        // 🔥 silently restore login
        window.location.href = "/authsuccess"
      }
    })
}, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full max-w-md p-10 border rounded-3xl shadow-xl text-center">

        <h1 className="text-3xl font-bold text-blue-600 mb-2">
          WattSense
        </h1>

        <p className="text-gray-500 mb-6">
          Sign in using Google
        </p>

        {/* ✅ SIMPLE GOOGLE LOGIN (NO LOOP) */}
       <button
  onClick={() =>
    signIn("google", {
      callbackUrl: "/authsuccess",
    })
  }
  className="w-full flex items-center justify-center gap-3 border rounded-xl py-3 hover:bg-gray-50"
>
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="h-5 w-5"
          />
          Continue with Google
        </button>

      </div>
    </div>
  )
}