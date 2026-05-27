"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const API = process.env.NEXT_PUBLIC_API_URL

export default function ResetPasswordPage() {
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] =
    useState("")

  const [loading, setLoading] = useState(false)

  const email =
    typeof window !== "undefined"
      ? localStorage.getItem("resetEmail")
      : ""

  const handleResetPassword = async (e: any) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      return alert("Passwords do not match")
    }

    try {
      setLoading(true)

      const res = await fetch(
        `${API}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        alert(
          data.error ||
            "Failed to reset password"
        )
        return
      }

      localStorage.removeItem("resetEmail")

      alert("Password reset successful")

      router.push("/login")

    } catch (err) {
      alert("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white rounded-[35px] shadow-2xl p-10">

        <h1 className="text-4xl font-bold text-center text-teal-500 mb-3">
          Reset Password
        </h1>

        <p className="text-gray-500 text-center mb-8">
          Enter your new password
        </p>

        <form
          onSubmit={handleResetPassword}
          className="space-y-5"
        >
          <input
            type="password"
            placeholder="New password"
            required
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="
              w-full
              bg-gray-100
              rounded-xl
              p-4
              outline-none
              focus:ring-2
              focus:ring-teal-400
            "
          />

          <input
            type="password"
            placeholder="Confirm password"
            required
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
            className="
              w-full
              bg-gray-100
              rounded-xl
              p-4
              outline-none
              focus:ring-2
              focus:ring-teal-400
            "
          />

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-teal-500
              hover:bg-teal-600
              transition
              text-white
              py-4
              rounded-xl
              font-semibold
            "
          >
            {loading
              ? "Resetting..."
              : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  )
}