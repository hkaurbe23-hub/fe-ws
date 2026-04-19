"use client"

import { useEffect, useState, useMemo } from "react"

const API = process.env.NEXT_PUBLIC_API_URL

export default function AlarmsPage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("jwtToken")
      : null

  useEffect(() => {
    fetchAlerts()

    const interval = setInterval(fetchAlerts, 10000) // auto refresh
    return () => clearInterval(interval)
  }, [])

const fetchAlerts = async () => {
  try {
    const res = await fetch(`${API}/api/alerts`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const json = await res.json()

    console.log("ALERT API RESPONSE:", json)

    // ✅ FIX: ensure it's always an array
    const safeData = Array.isArray(json)
      ? json
      : Array.isArray(json.data)
      ? json.data
      : []

    const sorted = safeData.sort(
      (a: any, b: any) =>
        new Date(b.timestamp).getTime() -
        new Date(a.timestamp).getTime()
    )

    setAlerts(sorted)
  } catch (err) {
    console.error(err)
  } finally {
    setLoading(false)
  }
}


  // 🔥 Severity logic
  const getSeverity = (a: any) => {
    if (a.parameter?.toLowerCase().includes("voltage")) return "critical"
    if (a.parameter?.toLowerCase().includes("current")) return "warning"
    return "warning"
  }

  // 📊 Stats
  const stats = useMemo(() => {
    let critical = 0
    let warning = 0

    alerts.forEach((a) => {
      const sev = getSeverity(a)
      if (sev === "critical") critical++
      else warning++
    })

    return {
      total: alerts.length,
      critical,
      warning,
    }
  }, [alerts])

  if (loading) return <div className="p-6">Loading alerts...</div>

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      <h1 className="text-3xl font-bold text-red-600 mb-6">
        🚨 Alerts Dashboard
      </h1>

      {/* 📊 STATS */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Alerts" value={stats.total} color="bg-gray-800" />
        <StatCard title="Critical" value={stats.critical} color="bg-red-600" />
        <StatCard title="Warning" value={stats.warning} color="bg-yellow-500" />
      </div>

      {/* EMPTY STATE */}
      {alerts.length === 0 && (
        <div className="bg-white p-6 rounded shadow text-green-600 font-semibold">
          ✅ No alerts — system healthy
        </div>
      )}

      {/* ALERT LIST */}
      <div className="space-y-4">
        {alerts.map((a, i) => {
          const severity = getSeverity(a)

          return (
            <div
              key={i}
              className={`bg-white p-4 rounded shadow border-l-4 transition hover:shadow-lg
                ${severity === "critical" ? "border-red-600" : "border-yellow-500"}
              `}
            >
              <div className="flex justify-between items-center">

                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {severity === "critical" ? "🚨" : "⚠️"}
                  </span>

                  <p
                    className={`font-semibold ${
                      severity === "critical"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {severity === "critical"
                      ? "Critical Alert"
                      : "Warning Alert"}
                  </p>
                </div>

                <span className="text-xs text-gray-500">
                  {new Date(a.timestamp).toLocaleString()}
                </span>
              </div>

              <div className="mt-3 text-sm text-gray-700 grid grid-cols-2 gap-2">
                <p><b>Board:</b> {a.board_uid}</p>
                <p><b>Slave:</b> {a.slave_id}</p>
                <p><b>Parameter:</b> {a.parameter}</p>
                <p><b>Status:</b> Zero value detected</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* 🔥 SMALL COMPONENT */
function StatCard({ title, value, color }: any) {
  return (
    <div className={`${color} text-white p-4 rounded shadow`}>
      <p className="text-sm opacity-80">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}