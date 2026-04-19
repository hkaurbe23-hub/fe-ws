"use client"

import { useEffect, useState, useMemo } from "react"

const API = process.env.NEXT_PUBLIC_API_URL

export default function AlarmsPage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [filter, setFilter] = useState<"all" | "critical" | "warning">("all")
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<any[]>([])

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("jwtToken")
      : null

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${API}/api/alerts`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const json = await res.json()

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

  const getSeverity = (a: any) => {
    if (a.parameter?.toLowerCase().includes("voltage")) return "critical"
    if (a.parameter?.toLowerCase().includes("current")) return "warning"
    return "warning"
  }

  // ✅ FILTERED ALERTS
  const filteredAlerts = useMemo(() => {
    if (filter === "all") return alerts
    return alerts.filter((a) => getSeverity(a) === filter)
  }, [alerts, filter])

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

  // ✅ SELECT HANDLERS
  const toggleSelect = (alert: any) => {
    const exists = selected.find(
      (s) =>
        s.board_id === alert.board_id &&
        s.slave_id === alert.slave_id &&
        s.parameter === alert.parameter &&
        s.timestamp === alert.timestamp
    )

    if (exists) {
      setSelected(selected.filter((s) => s !== exists))
    } else {
      setSelected([...selected, alert])
    }
  }

  const selectAll = () => setSelected(filteredAlerts)

  const selectByType = (type: "critical" | "warning") => {
    setSelected(alerts.filter((a) => getSeverity(a) === type))
  }

const handleDelete = async () => {
  if (selected.length === 0) return

  const payload = selected.map((a) => ({
    board_id: a.board_id,
    slave_id: a.slave_id, // ✅ now correct numeric ID
    parameter: a.parameter,
    timestamp: a.timestamp,
  }))

  // ✅ instant UI update
  setAlerts((prev) =>
    prev.filter(
      (a) =>
        !selected.some(
          (s) =>
            s.board_id === a.board_id &&
            s.slave_id === a.slave_id &&
            s.parameter === a.parameter &&
            s.timestamp === a.timestamp
        )
    )
  )

  await fetch(`${API}/api/alerts/dismiss`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ alerts: payload }),
  })

  setSelected([])
  setSelectMode(false)
}

  if (loading) return <div className="p-6">Loading alerts...</div>

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      <h1 className="text-3xl font-bold text-red-600 mb-6">
        🚨 Alerts Dashboard
      </h1>

      {/* 🔥 TOP BAR */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">

        {/* FILTER TOGGLE */}
        <div className="flex gap-2">
          {["all", "critical", "warning"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* SELECT BUTTON */}
        <button
          onClick={() => {
            setSelectMode(!selectMode)
            setSelected([])
          }}
          className="px-3 py-1 bg-gray-800 text-white rounded-md"
        >
          {selectMode ? "Cancel" : "Select"}
        </button>

        {/* BULK ACTIONS */}
        {selectMode && (
          <>
            <button onClick={selectAll} className="text-sm underline">
              Select All
            </button>

            <button onClick={() => selectByType("critical")} className="text-sm underline">
              Critical
            </button>

            <button onClick={() => selectByType("warning")} className="text-sm underline">
              Warning
            </button>
          </>
        )}

        {/* DELETE ICON */}
        {selectMode && selected.length > 0 && (
          <button
            onClick={handleDelete}
            className="ml-auto bg-red-600 text-white px-3 py-1 rounded-md"
          >
            🗑 Delete ({selected.length})
          </button>
        )}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Alerts" value={stats.total} color="bg-gray-800" />
        <StatCard title="Critical" value={stats.critical} color="bg-red-600" />
        <StatCard title="Warning" value={stats.warning} color="bg-yellow-500" />
      </div>

      {filteredAlerts.length === 0 && (
        <div className="bg-white p-6 rounded shadow text-green-600 font-semibold">
          ✅ No alerts
        </div>
      )}

      <div className="space-y-4">
        {filteredAlerts.map((a, i) => {
          const severity = getSeverity(a)
          const isChecked = selected.includes(a)

          return (
            <div
              key={i}
              className={`bg-white p-4 rounded shadow border-l-4 flex gap-3
                ${severity === "critical" ? "border-red-600" : "border-yellow-500"}
              `}
            >

              {/* CHECKBOX */}
              {selectMode && (
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleSelect(a)}
                />
              )}

              <div className="flex-1">

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
                  <p><b>Slave:</b> {a.slave_name}</p>
                  <p><b>Parameter:</b> {a.parameter}</p>
                  <p><b>Status:</b> Zero value detected</p>
                </div>

              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatCard({ title, value, color }: any) {
  return (
    <div className={`${color} text-white p-4 rounded shadow`}>
      <p className="text-sm opacity-80">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}