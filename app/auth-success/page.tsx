"use client"

import { useEffect, useState } from "react"

export default function AuthSuccess() {
  const [isLogout, setIsLogout] = useState(false)

  useEffect(() => {
    const params =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : null

    const logout = params?.get("logout") === "true"

    setIsLogout(logout)

    // 🔥 LOGOUT FLOW
    if (logout) {
      console.log("🚪 Logging out...")

      localStorage.removeItem("jwtToken")
      localStorage.removeItem("userRole")
      localStorage.removeItem("userEmail")

      setTimeout(() => {
        window.location.replace("/login")
      }, 1200)

      return
    }

    // 🔥 LOGIN FLOW (UNCHANGED)
    const handleLogin = async () => {
      try {
        let email = null

        // 🔁 RETRY SESSION
        for (let i = 0; i < 5; i++) {
          const res = await fetch("/api/auth/session")
          const session = await res.json()

          console.log("SESSION TRY:", i, session)

          if (session?.user?.email) {
            email = session.user.email
            break
          }

          await new Promise((res) => setTimeout(res, 300))
        }

        if (!email) {
          console.log("❌ Session never loaded")
          window.location.replace("/login")
          return
        }

        console.log("✅ GOOGLE EMAIL:", email)

        const backendRes = await fetch(
          "https://api.wattsense.in/api/auth/google-login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
            mode: "cors",
          }
        )

        let data = null

        try {
          data = await backendRes.json()
        } catch (err) {
          console.error("❌ JSON parse failed:", err)
        }

        console.log("✅ BACKEND STATUS:", backendRes.status)
        console.log("✅ BACKEND DATA:", data)

        if (!backendRes.ok || !data?.token) {
          console.error("❌ Backend failed")
          window.location.replace("/login")
          return
        }

        // ✅ SAVE
        localStorage.setItem("jwtToken", data.token)
        localStorage.setItem("userRole", data.role || "user")
        localStorage.setItem("userEmail", email)

        console.log("✅ TOKEN SAVED")

        // ✅ REDIRECT
        // ✅ REDIRECT (FIXED)
window.location.replace(
  (data.role || "user") === "admin"
    ? "/dashboard"
    : "/user"
)

      } catch (err) {
        console.error("❌ Auth error:", err)
        window.location.replace("/login")
      }
    }

    handleLogin()
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg font-medium">
        {isLogout ? "Logging you out..." : "Logging you in..."}
      </p>
    </div>
  )
}