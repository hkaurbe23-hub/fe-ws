"use client"

import { useEffect, useState } from "react"
import {
  CircuitBoard,
  Activity,
  Zap,
  PlugZap,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function UserDashboardPage() {
  const [authorized, setAuthorized] = useState(false)
  const [userName, setUserName] = useState("")

  const [statsData, setStatsData] = useState({
    totalClaimedBoards: 0,
    activeBoards: 0,
    inactiveBoards: 0,
  })

  // 🔐 USER PROTECTION
  useEffect(() => {
    if (typeof window === "undefined") return

    const token = localStorage.getItem("jwtToken")
    const role = localStorage.getItem("userRole")
    const name = localStorage.getItem("userName") || ""

    setUserName(name)

    if (!token) {
      fetch("/api/auth/session")
        .then((res) => res.json())
        .then((session) => {
          if (session?.user?.email) {
            window.location.href = "/authsuccess"
          } else {
            window.location.href = "/login"
          }
        })
      return
    }

    if (role === "admin") {
      window.location.href = "/dashboard"
      return
    }

    setAuthorized(true)
  }, [])

  // ✅ FETCH USER STATS
  const fetchStats = async () => {
  try {
    const token = localStorage.getItem("jwtToken")

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://api.wattsense.in"

    const res = await fetch(`${apiUrl}/api/boards`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) throw new Error()

    const boards = await res.json()

    const totalClaimedBoards = boards.length

    const activeBoards = boards.filter(
      (b: any) => b.enabled
    ).length

    const inactiveBoards = totalClaimedBoards - activeBoards

    setStatsData({
      totalClaimedBoards,
      activeBoards,
      inactiveBoards,
    })
  } catch (err) {
    console.error("Failed to load user stats", err)
  }
}
   

  // 🔥 INITIAL FETCH
  useEffect(() => {
    if (!authorized) return
    fetchStats()
  }, [authorized])

  // 🔥 AUTO REFRESH
  useEffect(() => {
    if (!authorized) return

    const interval = setInterval(() => {
      fetchStats()
    }, 5000)

    return () => clearInterval(interval)
  }, [authorized])

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f4fffd]">
        <p className="text-slate-600 text-lg">Checking access...</p>
      </div>
    )
  }

  const stats = [
    {
      title: "My Boards",
      value: statsData.totalClaimedBoards,
      icon: CircuitBoard,
    },
    {
      title: "Active Boards",
      value: statsData.activeBoards,
      icon: Activity,
    },
    {
      title: "Inactive Boards",
      value: statsData.inactiveBoards,
      icon: Zap,
    },
  ]

  const gradients = [
    "from-[#14b8a6] to-[#2dd4bf]",
    "from-[#0f766e] to-[#14b8a6]",
    "from-[#99f6e4] to-[#5eead4]",
  ]

  return (
    <div className="min-h-screen bg-[#f5fffd] p-6">

      {/* HERO */}
      <div className="
        relative
        overflow-hidden
        rounded-[32px]
        bg-gradient-to-r
        from-[#dffcf7]
        to-[#f5fffd]
        border
        border-[#d7f5ef]
        p-8
        shadow-sm
        mb-8
      ">

        {/* glow */}
        <div className="
          absolute
          top-[-80px]
          right-[-80px]
          w-[220px]
          h-[220px]
          bg-teal-200/40
          blur-3xl
          rounded-full
        " />

        <div className="relative z-10 flex items-center justify-between">

          {/* LEFT */}
          <div>
            <p className="text-xl font-medium text-teal-500 mb-2">
              Welcome Back 👋
            </p>

            <h1 className="text-4xl font-bold text-slate-800 mb-3">
              My Dashboard
            </h1>

            <p className="text-slate-500 max-w-xl leading-relaxed">
              View your claimed boards, monitor energy usage, and manage alerts in one place.
            </p>
          </div>

          {/* RIGHT */}
          <div className="
            hidden
            lg:flex
            w-[180px]
            h-[180px]
            rounded-full
            bg-gradient-to-br
            from-teal-300
            to-cyan-200
            items-center
            justify-center
            shadow-xl
          ">
            <PlugZap className="w-20 h-20 text-white" />
          </div>

        </div>
      </div>

      {/* STATS */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mb-8">

        {stats.map((stat, i) => (
          <div
            key={i}
            className={`
              relative
              overflow-hidden
              rounded-[38px]
              p-7
              min-h-[210px]
              shadow-[0_12px_30px_rgba(20,184,166,0.12)]
              hover:shadow-[0_18px_40px_rgba(20,184,166,0.18)]
              hover:-translate-y-1
              transition-all
              duration-300
              bg-gradient-to-br
              ${gradients[i]}
            `}
          >

            {/* folder notch */}
            <div className="
              absolute
              top-0
              left-8
              w-28
              h-7
              bg-white/18
              rounded-b-[20px]
              backdrop-blur-xl
            " />

            {/* soft blob */}
            <div className="
              absolute
              -right-6
              -bottom-6
              w-32
              h-32
              bg-white/10
              rounded-full
            " />

            {/* icon */}
            <div className="
              w-14
              h-14
              rounded-[18px]
              bg-white/25
              backdrop-blur-xl
              flex
              items-center
              justify-center
              text-white
              mb-10
            ">
              <stat.icon className="w-7 h-7" />
            </div>

            {/* content */}
            <div className="relative z-10">
              <p className="text-white/100 text-2xl mb-2 font-medium">
                {stat.title}
              </p>
              <h2 className="text-4xl font-bold text-white tracking-tight">
                {stat.value}
              </h2>
            </div>

          </div>
        ))}

      </div>

      {/* QUICK ACTIONS */}
      <Card className="rounded-[28px] border border-[#d7f5ef] bg-white shadow-sm">

        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800">
            Quick Actions
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-4">

            <a
              href="/user/my-boards"
              className="
                px-5
                py-3
                rounded-2xl
                bg-[#14b8a6]
                text-white
                font-lg
                hover:bg-teal-600
                transition
              "
            >
              My Boards
            </a>

            <a
              href="/user/energy-dashboard"
              className="
                px-5
                py-3
                rounded-2xl
                border
                border-[#ccfbf1]
                text-slate-700
                hover:bg-[#f0fdfa]
                transition
              "
            >
              Energy Dashboard
            </a>

            <a
              href="/user/analytics"
              className="
                px-5
                py-3
                rounded-2xl
                border
                border-[#ccfbf1]
                text-slate-700
                hover:bg-[#f0fdfa]
                transition
              "
            >
              Analytics
            </a>

            <a
              href="/user/reports"
              className="
                px-5
                py-3
                rounded-2xl
                border
                border-[#ccfbf1]
                text-slate-700
                hover:bg-[#f0fdfa]
                transition
              "
            >
              View Reports
            </a>

          </div>
        </CardContent>

      </Card>

    </div>
  )
}