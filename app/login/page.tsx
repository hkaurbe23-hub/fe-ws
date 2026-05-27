"use client"

import { useEffect, useState } from "react"
import { signIn } from "next-auth/react"

const API = process.env.NEXT_PUBLIC_API_URL

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false)

  // LOGIN
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // SIGNUP
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("jwtToken")
    const role = localStorage.getItem("userRole")

    if (token && role) {
      window.location.href =
        role === "admin" ? "/dashboard" : "/user"
    }
  }, [])

  // LOGIN
  const handleLogin = async (e: any) => {
    e.preventDefault()

    try {
      setLoading(true)
      
      if (!loginEmail.trim() || !loginPassword.trim()) {
  alert("Email and password are required")
  return
}
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Login failed")
        return
      }

      localStorage.setItem("jwtToken", data.token)
      localStorage.setItem("userRole", data.role)
      localStorage.setItem("userEmail", data.user.email)

      window.location.href =
        data.role === "admin" ? "/dashboard" : "/user"
    } catch (err) {
      alert("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  // SIGNUP
  const handleSignup = async (e: any) => {
    e.preventDefault()
    
    if (!signupEmail.trim() || !signupPassword.trim()) {
  alert("All fields are required")
  return
}
    try {
      setLoading(true)

      const res = await fetch(`${API}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Signup failed")
        return
      }

      alert("Account created successfully!")

      localStorage.setItem("jwtToken", data.token)
      localStorage.setItem("userRole", data.user.role)
      localStorage.setItem("userEmail", data.user.email)

      window.location.href =
        data.user.role === "admin"
          ? "/dashboard"
          : "/user"
    } catch (err) {
      alert("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center overflow-hidden px-4">

      <div className="relative w-[900px] h-[550px] bg-white rounded-[40px] overflow-hidden shadow-2xl">

        {/* SIGN IN */}
<div
  className={`absolute top-0 left-0 h-full w-1/2 transition-all duration-700 ease-in-out
  ${
    isSignup
      ? "translate-x-full opacity-0 z-10"
      : "translate-x-0 opacity-100 z-30"
  }`}
>
          <div className="flex flex-col items-center justify-center h-full px-16">

            <h1 className="text-5xl font-bold mb-8">
              Sign In
            </h1>

            <button
              onClick={() =>
                signIn("google", {
  callbackUrl: "/authsuccess",
  redirect: false,
}).then((res) => {
  if (res?.url) {
    window.location.href = res.url
  }
})
              }
              className="border rounded-xl px-6 py-3 flex items-center gap-3 hover:bg-gray-100 transition mb-6"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                className="w-5 h-5"
              />
              Continue with Google
            </button>

            <form
              onSubmit={handleLogin}
              className="w-full flex flex-col gap-4"
            >
              <input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) =>
                  setLoginEmail(e.target.value)
                }
                className="bg-gray-100 rounded-xl p-4 outline-none"
              />

              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) =>
                  setLoginPassword(e.target.value)
                }
                className="bg-gray-100 rounded-xl p-4 outline-none"
              />

              <button
  type="button"
  onClick={() => window.location.href = "/forgot-password"}
  className="text-sm text-gray-500 hover:text-black"
>
  Forgot Password?
</button>

              <button
                type="submit"
                disabled={loading}
                className="bg-[#14b8a6] hover:bg-teal-600 text-white py-4 rounded-xl font-semibold transition"
              >
                {loading ? "Loading..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>

{/* SIGN UP */}
<div
  className={`absolute top-0 left-0 h-full w-1/2 transition-all duration-700 ease-in-out
  ${
    isSignup
      ? "translate-x-full opacity-100 z-30"
      : "translate-x-0 opacity-0 z-10"
  }`}
>
          <div className="flex flex-col items-center justify-center h-full px-16">

            <h1 className="text-5xl font-bold mb-8">
              Create Account
            </h1>

            <button
              onClick={() =>
                signIn("google", {
  callbackUrl: "/authsuccess",
  redirect: false,
}).then((res) => {
  if (res?.url) {
    window.location.href = res.url
  }
})
              }
              className="border rounded-xl px-6 py-3 flex items-center gap-3 hover:bg-gray-100 transition mb-6"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                className="w-5 h-5"
              />
              Continue with Google
            </button>

            <form
              onSubmit={handleSignup}
              className="w-full flex flex-col gap-4"
            >
              <input
                type="email"
                placeholder="Email"
                value={signupEmail}
                onChange={(e) =>
                  setSignupEmail(e.target.value)
                }
                className="bg-gray-100 rounded-xl p-4 outline-none"
              />

              <input
                type="password"
                placeholder="Password"
                value={signupPassword}
                onChange={(e) =>
                  setSignupPassword(e.target.value)
                }
                className="bg-gray-100 rounded-xl p-4 outline-none"
              />

              <button
                type="submit"
                disabled={loading}
                className="bg-[#14b8a6] hover:bg-teal-600 text-white py-4 rounded-xl font-semibold transition"
              >
                {loading ? "Loading..." : "Sign Up"}
              </button>
            </form>
          </div>
        </div>

{/* OVERLAY CONTAINER */}
<div
  className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden z-40 transition-all duration-700 ease-in-out
  ${isSignup ? "-translate-x-full" : ""}
  `}
>

  {/* OVERLAY */}
  <div
    className={`relative left-[-100%] w-[200%] h-full bg-[#14b8a6] text-white flex transition-all duration-700 ease-in-out
    ${isSignup ? "translate-x-1/2" : "translate-x-0"}
    `}
  >

    {/* LEFT SIDE */}
    <div className="w-1/2 flex flex-col items-center justify-center text-center px-12">

      <h1 className="text-5xl font-bold mb-6">
        Welcome Back!
      </h1>

      <p className="mb-8 text-lg">
        Already have an account? Login here
      </p>

      <button
        onClick={() => setIsSignup(false)}
        className="border-2 border-white px-10 py-3 rounded-xl font-semibold hover:bg-white hover:text-teal-500 transition"
      >
        Sign In
      </button>
    </div>

    {/* RIGHT SIDE */}
    <div className="w-1/2 flex flex-col items-center justify-center text-center px-12">

      <h1 className="text-5xl font-bold mb-6">
        Hello Friend!
      </h1>

      <p className="mb-8 text-lg">
        Create your account and start using WattSense
      </p>

      <button
        onClick={() => setIsSignup(true)}
        className="border-2 border-white px-10 py-3 rounded-xl font-semibold hover:bg-white hover:text-teal-500 transition"
      >
        Sign Up
      </button>
    </div>

  </div>
</div>
      </div>
    </div>
  )
}