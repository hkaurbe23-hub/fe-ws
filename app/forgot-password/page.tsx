"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const API = process.env.NEXT_PUBLIC_API_URL

export default function ForgotPasswordPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSendOtp = async (e: any) => {
    e.preventDefault()

    try {
      setLoading(true)

      const res = await fetch(
        `${API}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Failed to send OTP")
        return
      }

      localStorage.setItem(
        "resetEmail",
        email
      )

      alert("OTP sent successfully")

      router.push("/verify-otp")

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
          Forgot Password
        </h1>

        <p className="text-gray-500 text-center mb-8">
          Enter your email to receive OTP
        </p>

        <form
          onSubmit={handleSendOtp}
          className="space-y-5"
        >
          <input
            type="email"
            placeholder="Enter email"
            required
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
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
              ? "Sending OTP..."
              : "Send OTP"}
          </button>
        </form>

        <button
          onClick={() =>
            router.push("/login")
          }
          className="
            mt-6
            w-full
            text-gray-500
            hover:text-black
            transition
          "
        >
          Back to Login
        </button>
      </div>
    </div>
  )
}