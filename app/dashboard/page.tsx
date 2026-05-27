"use client"

import { useEffect, useState } from "react"
import {
  CircuitBoard,
  Activity,
  Zap,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { useFloorsContext } from "@/lib/floor-context"

export default function DashboardPage() {
  const { boards } = useFloorsContext()

  const [authorized, setAuthorized] = useState(false)

  const [statsData, setStatsData] = useState({
    totalBoards: 0,
    activeBoards: 0,
    inactiveBoards: 0,
  })

  // 🔐 ADMIN PROTECTION
  useEffect(() => {
    if (typeof window === "undefined") return

    const token = localStorage.getItem("jwtToken")
    const role = localStorage.getItem("userRole")

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

    if (role !== "admin") {
      window.location.href = "/user"
      return
    }

    setAuthorized(true)
  }, [])

  // ✅ FETCH ADMIN STATS
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("jwtToken")

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://api.wattsense.in"

      const res = await fetch(
        `${apiUrl}/api/admin/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) throw new Error()

      const data = await res.json()

      setStatsData({
        totalBoards: data.totalBoards || 0,
        activeBoards: data.activeBoards || 0,
        inactiveBoards: data.inactiveBoards || 0,
      })

    } catch (err) {
      console.error(
        "Failed to load admin stats",
        err
      )
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
      <div className="
        flex
        items-center
        justify-center
        min-h-screen
        bg-[#f4fffd]
      ">
        <p className="text-slate-600 text-lg">
          Checking access...
        </p>
      </div>
    )
  }

  const stats = [
    {
      title: "Total Boards",
      value: statsData.totalBoards,
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

          <p className="
            text-sm
            font-medium
            text-teal-500
            mb-2
          ">
            Welcome Back 👋
          </p>

          <h1 className="
            text-4xl
            font-bold
            text-slate-800
            mb-3
          ">
            Admin Dashboard
          </h1>

          <p className="
            text-slate-500
            max-w-xl
            leading-relaxed
          ">
            Monitor all boards, analytics, alarms
            and reports in one place.
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

          <Activity className="
            w-20
            h-20
            text-white
          " />

        </div>
      </div>
    </div>

    {/* STATS */}
    <div className="
      grid
      gap-6
      md:grid-cols-2
      xl:grid-cols-3
      mb-8
    ">

      {stats.map((stat, i) => (
        <Card
          key={i}
          className="
            rounded-[28px]
            border
            border-[#d7f5ef]
            bg-white
            shadow-sm
            hover:shadow-xl
            transition-all
            duration-300
            hover:-translate-y-1
          "
        >

          <CardHeader className="
            flex
            flex-row
            items-center
            justify-between
            pb-2
          ">

            <div>

              <CardTitle className="
                text-sm
                font-medium
                text-slate-500
              ">
                {stat.title}
              </CardTitle>

            </div>

            <div className="
              w-12
              h-12
              rounded-2xl
              bg-[#dffcf7]
              flex
              items-center
              justify-center
              text-[#14b8a6]
            ">

              <stat.icon className="w-5 h-5" />

            </div>

          </CardHeader>

          <CardContent>

            <div className="
              text-4xl
              font-bold
              text-slate-800
            ">
              {stat.value}
            </div>

          </CardContent>

        </Card>
      ))}
    </div>

    {/* QUICK ACTIONS */}
    <Card
      className="
        rounded-[28px]
        border
        border-[#d7f5ef]
        bg-white
        shadow-sm
      "
    >

      <CardHeader>

        <CardTitle className="
          text-xl
          font-semibold
          text-slate-800
        ">
          Quick Actions
        </CardTitle>

      </CardHeader>

      <CardContent>

        <div className="
          flex
          flex-wrap
          gap-4
        ">

          <a
            href="/dashboard/boards"
            className="
              px-5
              py-3
              rounded-2xl
              bg-[#14b8a6]
              text-white
              font-medium
              hover:bg-teal-600
              transition
            "
          >
            Manage Boards
          </a>

          <a
            href="/dashboard/reports"
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