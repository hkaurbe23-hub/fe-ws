"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const API = process.env.NEXT_PUBLIC_API_URL

export default function VerifyOtpPage() {
  const router = useRouter()

  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)

  const email =
    typeof window !== "undefined"
      ? localStorage.getItem("resetEmail")
      : ""

  const handleVerifyOtp = async (e: any) => {
    e.preventDefault()

    try {
      setLoading(true)

      const res = await fetch(
        `${API}/api/auth/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
          }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Invalid OTP")
        return
      }

      router.push("/reset-password")

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
          Verify OTP
        </h1>

        <p className="text-gray-500 text-center mb-8">
          Enter the OTP sent to your email
        </p>

        <form
          onSubmit={handleVerifyOtp}
          className="space-y-5"
        >
          <input
            type="text"
            placeholder="Enter OTP"
            required
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value)
            }
            className="
              w-full
              bg-gray-100
              rounded-xl
              p-4
              outline-none
              text-center
              tracking-[10px]
              text-2xl
              font-bold
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
              ? "Verifying..."
              : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  )
}