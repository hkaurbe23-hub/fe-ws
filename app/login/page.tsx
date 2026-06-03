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
  <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4 py-8 overflow-hidden">

    <div
      className="
      relative
      w-full
      max-w-6xl
      min-h-[700px]
      md:min-h-[600px]
      bg-white
      rounded-[30px]
      overflow-hidden
      shadow-2xl
      flex
      flex-col
      md:block
      "
    >

      {/* ================= SIGN IN ================= */}
      <div
        className={`
        w-full
        md:absolute md:top-0 md:left-0 md:h-full md:w-1/2
        transition-all duration-700 ease-in-out
        ${
          isSignup
            ? "md:translate-x-full md:opacity-0 md:z-10 hidden md:block"
            : "translate-x-0 opacity-100 z-30"
        }
      `}
      >
        <div className="flex flex-col items-center justify-center h-full px-6 py-10 md:px-16">

          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">
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
            className="
            border rounded-xl px-4 py-3
            flex items-center justify-center gap-3
            hover:bg-gray-100 transition mb-6
            w-full max-w-sm
            "
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="w-5 h-5"
            />
            Continue with Google
          </button>

          <form
            onSubmit={handleLogin}
            className="w-full max-w-sm flex flex-col gap-4"
          >
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) =>
                setLoginEmail(e.target.value)
              }
              className="bg-gray-100 rounded-xl p-4 outline-none w-full"
            />

            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) =>
                setLoginPassword(e.target.value)
              }
              className="bg-gray-100 rounded-xl p-4 outline-none w-full"
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
              className="
              bg-[#14b8a6]
              hover:bg-teal-600
              text-white
              py-4
              rounded-xl
              font-semibold
              transition
              w-full
              "
            >
              {loading ? "Loading..." : "Sign In"}
            </button>
          </form>

          {/* MOBILE SWITCH */}
          <div className="md:hidden mt-8 text-center">
            <p className="text-gray-500 mb-3">
              Don&apos;t have an account?
            </p>

            <button
              onClick={() => setIsSignup(true)}
              className="
              border-2 border-[#14b8a6]
              text-[#14b8a6]
              px-8 py-3 rounded-xl font-semibold
              "
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>

      {/* ================= SIGN UP ================= */}
      <div
        className={`
        w-full
        md:absolute md:top-0 md:left-0 md:h-full md:w-1/2
        transition-all duration-700 ease-in-out
        ${
          isSignup
            ? "translate-x-0 opacity-100 z-30"
            : "hidden md:block md:translate-x-0 md:opacity-0 md:z-10"
        }
      `}
      >
        <div className="flex flex-col items-center justify-center h-full px-6 py-10 md:px-16">

          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">
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
            className="
            border rounded-xl px-4 py-3
            flex items-center justify-center gap-3
            hover:bg-gray-100 transition mb-6
            w-full max-w-sm
            "
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="w-5 h-5"
            />
            Continue with Google
          </button>

          <form
            onSubmit={handleSignup}
            className="w-full max-w-sm flex flex-col gap-4"
          >
            <input
              type="email"
              placeholder="Email"
              value={signupEmail}
              onChange={(e) =>
                setSignupEmail(e.target.value)
              }
              className="bg-gray-100 rounded-xl p-4 outline-none w-full"
            />

            <input
              type="password"
              placeholder="Password"
              value={signupPassword}
              onChange={(e) =>
                setSignupPassword(e.target.value)
              }
              className="bg-gray-100 rounded-xl p-4 outline-none w-full"
            />

            <button
              type="submit"
              disabled={loading}
              className="
              bg-[#14b8a6]
              hover:bg-teal-600
              text-white
              py-4
              rounded-xl
              font-semibold
              transition
              w-full
              "
            >
              {loading ? "Loading..." : "Sign Up"}
            </button>
          </form>

          {/* MOBILE SWITCH */}
          <div className="md:hidden mt-8 text-center">
            <p className="text-gray-500 mb-3">
              Already have an account?
            </p>

            <button
              onClick={() => setIsSignup(false)}
              className="
              border-2 border-[#14b8a6]
              text-[#14b8a6]
              px-8 py-3 rounded-xl font-semibold
              "
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* ================= DESKTOP OVERLAY ================= */}
      <div
        className={`
        hidden md:block
        absolute top-0 left-1/2 w-1/2 h-full overflow-hidden z-40
        transition-all duration-700 ease-in-out
        ${isSignup ? "-translate-x-full" : ""}
      `}
      >
        <div
          className={`
          relative left-[-100%] w-[200%] h-full
          bg-[#14b8a6]
          text-white
          flex
          transition-all duration-700 ease-in-out
          ${isSignup ? "translate-x-1/2" : "translate-x-0"}
        `}
        >

          {/* LEFT */}
          <div className="w-1/2 flex flex-col items-center justify-center text-center px-12">

            <h1 className="text-5xl font-bold mb-6">
              Welcome Back!
            </h1>

            <p className="mb-8 text-lg">
              Already have an account? Login here
            </p>

            <button
              onClick={() => setIsSignup(false)}
              className="
              border-2 border-white
              px-10 py-3 rounded-xl
              font-semibold
              hover:bg-white hover:text-teal-500
              transition
              "
            >
              Sign In
            </button>
          </div>

          {/* RIGHT */}
          <div className="w-1/2 flex flex-col items-center justify-center text-center px-12">

            <h1 className="text-5xl font-bold mb-6">
              Hello Friend!
            </h1>

            <p className="mb-8 text-lg">
              Create your account and start using WattSense
            </p>

            <button
              onClick={() => setIsSignup(true)}
              className="
              border-2 border-white
              px-10 py-3 rounded-xl
              font-semibold
              hover:bg-white hover:text-teal-500
              transition
              "
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