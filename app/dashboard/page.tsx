"use client"

import { useEffect, useState } from "react"
import {
  CircuitBoard,
  Activity,
  Zap,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    .then(res => res.json())
    .then(session => {
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
        process.env.NEXT_PUBLIC_API_URL || "https://api.wattsense.in"

      const res = await fetch(`${apiUrl}/api/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error()

      const data = await res.json()

      setStatsData({
        totalBoards: data.totalBoards || 0,
        activeBoards: data.activeBoards || 0,
        inactiveBoards: data.inactiveBoards || 0,
      })

    } catch (err) {
      console.error("Failed to load admin stats", err)
    }
  }

  // 🔥 INITIAL FETCH
  useEffect(() => {
    if (!authorized) return
    fetchStats()
  }, [authorized])

  // 🔥 AUTO REFRESH (CLIENT REQUIREMENT)
  useEffect(() => {
    if (!authorized) return

    const interval = setInterval(() => {
      fetchStats()
    }, 5000)

    return () => clearInterval(interval)
  }, [authorized])

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Checking access...</p>
      </div>
    )
  }

  const stats = [
    {
      title: "Total Boards",
      value: statsData.totalBoards,
      icon: CircuitBoard,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Active Boards",
      value: statsData.activeBoards,
      icon: Activity,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Inactive Boards",
      value: statsData.inactiveBoards,
      icon: Zap,
      color: "bg-red-50 text-red-600",
    },
  ]

  return (
    <div className="flex flex-col gap-6">

      <div>
        <h1 className="text-2xl font-bold text-foreground">
          🧠 Admin Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage and monitor all boards in the system
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, i) => (
          <Card
            key={i}
            className="border shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs text-muted-foreground">
                {stat.title}
              </CardTitle>

              <div className={`p-2 rounded ${stat.color}`}>
                <stat.icon className="size-4" />
              </div>
            </CardHeader>

            <CardContent>
              <div className="text-xl font-bold text-foreground">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border shadow-sm hover:shadow-md transition">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">
            Go to{" "}
            <a
              href="/dashboard/boards"
              className="font-medium text-primary hover:underline"
            >
              Boards
            </a>{" "}
            to manage devices.
          </p>
        </CardContent>
      </Card>

    </div>
  )
}