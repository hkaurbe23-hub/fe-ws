"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ChevronDown } from "lucide-react"

const API = process.env.NEXT_PUBLIC_API_URL
const COLORS = ["#2563eb", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"]

export default function AnalyticsPage() {
  const [boards, setBoards] = useState<any[]>([])
  const [boardSlaves, setBoardSlaves] = useState<any>({})

  const [selectedBoards, setSelectedBoards] = useState<number[]>([])
  const [selectedSlaves, setSelectedSlaves] = useState<any>({})

  const [openBoards, setOpenBoards] = useState(false)
  const [openSlaves, setOpenSlaves] = useState(false)

  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("jwtToken")
      : null

  useEffect(() => {
    fetchBoards()
  }, [])

  const fetchBoards = async () => {
    const res = await fetch(`${API}/api/boards`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const json = await res.json()

    setBoards(json)
    setSelectedBoards([])

    json.forEach((b: any) => fetchSlaves(b.id))
  }

  const fetchSlaves = async (boardId: number) => {
    const res = await fetch(`${API}/api/boards/${boardId}/slaves`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const json = await res.json()

    setBoardSlaves((prev: any) => ({
      ...prev,
      [boardId]: json,
    }))

    setSelectedSlaves((prev: any) => ({
      ...prev,
      [boardId]: [],
    }))
  }

  // ✅ FIXED: BOARD SELECT AUTO SLAVE SELECT
  const toggleBoard = (id: number) => {
    if (selectedBoards.includes(id)) {
      setSelectedBoards(selectedBoards.filter((b) => b !== id))

      setSelectedSlaves((prev: any) => ({
        ...prev,
        [id]: [],
      }))
    } else {
      const slaves = boardSlaves[id] || []

      setSelectedBoards([...selectedBoards, id])

      setSelectedSlaves((prev: any) => ({
        ...prev,
        [id]: slaves.map((s: any) => s.slave_id),
      }))
    }
  }

  const toggleSlave = (boardId: number, slaveId: number) => {
    const current = selectedSlaves[boardId] || []

    if (current.includes(slaveId)) {
      setSelectedSlaves({
        ...selectedSlaves,
        [boardId]: current.filter((s: number) => s !== slaveId),
      })
    } else {
      setSelectedSlaves({
        ...selectedSlaves,
        [boardId]: [...current, slaveId],
      })
    }
  }

  const fetchAnalytics = async () => {
    setLoading(true)
    let all: any[] = []

    for (let boardId of selectedBoards) {
      const slaves = selectedSlaves[boardId]

      if (!slaves || slaves.length === 0) continue

      for (let sid of slaves) {
        const res = await fetch(
          `${API}/api/boards/${boardId}/analytics/${sid}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        const json = await res.json()
        if (json.records) {
          all.push(...json.records)
        }
      }
    }

    all.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() -
        new Date(b.timestamp).getTime()
    )

    setData(all)
    setLoading(false)
  }

  const metricKeys = useMemo(() => {
    if (!data.length) return []
    return Object.keys(data[0]).filter((k) => k !== "timestamp")
  }, [data])

  const voltageKeys = metricKeys.filter((k) =>
    k.toLowerCase().includes("voltage")
  )
  const currentKeys = metricKeys.filter((k) =>
    k.toLowerCase().includes("current")
  )
  const powerKeys = metricKeys.filter((k) =>
    k.toLowerCase().includes("power")
  )

  const buildChartData = (keys: string[]) =>
    data.map((r) => {
      const row: any = {
        time: new Date(r.timestamp).toLocaleTimeString(),
      }
      keys.forEach((k) => {
        row[k] = r[k]?.value ?? 0
      })
      return row
    })

  const pieData = powerKeys.map((k) => ({
    name: k,
    value: data.length ? data[data.length - 1][k]?.value || 0 : 0,
  }))

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        Energy Analytics Dashboard
      </h1>

      <div className="bg-white p-4 rounded shadow flex items-center gap-4 flex-wrap">

        {/* BOARDS */}
        <div className="relative">
          <button
            onClick={() => setOpenBoards(!openBoards)}
            className="px-4 py-2 border rounded-md bg-gray-100 flex gap-2"
          >
            Boards ({selectedBoards.length || "All"})
            <ChevronDown size={16} />
          </button>

          {openBoards && (
            <div className="absolute top-12 left-0 bg-white border shadow rounded p-3 z-50 max-h-60 overflow-auto">

              {/* ✅ ALL BOARDS */}
              <label className="block text-sm font-semibold mb-2 border-b pb-1">
                <input
                  type="checkbox"
                  checked={
                    selectedBoards.length === boards.length &&
                    boards.length > 0
                  }
                  onChange={() => {
                    if (selectedBoards.length === boards.length) {
                      setSelectedBoards([])
                      setSelectedSlaves({})
                    } else {
                      const allIds = boards.map((b) => b.id)

                      const allSlaves: any = {}

                      boards.forEach((b) => {
                        const slaves = boardSlaves[b.id] || []
                        allSlaves[b.id] = slaves.map((s: any) => s.slave_id)
                      })

                      setSelectedBoards(allIds)
                      setSelectedSlaves(allSlaves)
                    }
                  }}
                />
                All Boards
              </label>

              {boards.map((b) => (
                <label key={b.id} className="block text-sm">
                  <input
                    type="checkbox"
                    checked={selectedBoards.includes(b.id)}
                    onChange={() => toggleBoard(b.id)}
                  />
                  {b.board_uid}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* SLAVES */}
        <div className="relative">
          <button
            onClick={() => setOpenSlaves(!openSlaves)}
            className="px-4 py-2 border rounded-md bg-gray-100 flex gap-2"
          >
            Slave IDs
            <ChevronDown size={16} />
          </button>

          {openSlaves && (
            <div className="absolute top-12 left-0 bg-white border shadow rounded p-3 z-50 max-h-60 overflow-auto w-64">
              {selectedBoards.map((bid) => {
                const slaves = boardSlaves[bid] || []

                return (
                  <div key={bid} className="mb-2">
                    <p className="text-xs font-semibold text-gray-500">
                      {boards.find((b) => b.id === bid)?.board_uid}
                    </p>

                    {/* ✅ NO SLAVES */}
                    {slaves.length === 0 && (
                      <p className="text-xs text-gray-400">No Slaves</p>
                    )}

                    {/* ✅ ALL SLAVES */}
                    {slaves.length > 0 && (
                      <label className="block text-xs font-semibold mb-1">
                        <input
                          type="checkbox"
                          checked={
                            (selectedSlaves[bid]?.length || 0) ===
                            slaves.length
                          }
                          onChange={() => {
                            if (
                              (selectedSlaves[bid]?.length || 0) ===
                              slaves.length
                            ) {
                              setSelectedSlaves({
                                ...selectedSlaves,
                                [bid]: [],
                              })
                            } else {
                              setSelectedSlaves({
                                ...selectedSlaves,
                                [bid]: slaves.map((s: any) => s.slave_id),
                              })
                            }
                          }}
                        />
                        All Slaves
                      </label>
                    )}

                    {slaves.map((s: any) => (
                      <label key={s.slave_id} className="block text-sm">
                        <input
                          type="checkbox"
                          checked={
                            selectedSlaves[bid]?.includes(s.slave_id) || false
                          }
                          onChange={() => toggleSlave(bid, s.slave_id)}
                        />
                        {s.display_name || `Slave ${s.slave_id}`}
                      </label>
                    ))}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <button
          onClick={fetchAnalytics}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Apply
        </button>
      </div>

      {loading && <p className="mt-4">Loading...</p>}

      {!loading && data.length > 0 && (
        <div className="space-y-6 mt-6">

          {voltageKeys.length > 0 && (
            <ChartBlock title="Voltage Trend" data={buildChartData(voltageKeys)} keys={voltageKeys} />
          )}

          {currentKeys.length > 0 && (
            <ChartBlock title="Current Trend" data={buildChartData(currentKeys)} keys={currentKeys} />
          )}

          {powerKeys.length > 0 && (
            <ChartBlock title="Power Trend" data={buildChartData(powerKeys)} keys={powerKeys} />
          )}

          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-blue-600 font-semibold mb-3">
              Power Distribution
            </h2>

            <div className="h-80">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

function ChartBlock({ title, data, keys }: any) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-blue-600 font-semibold mb-3">{title}</h2>

      <div className="h-[350px]">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />

            {keys.map((k: string, i: number) => (
              <Line
                key={k}
                type="monotone"
                dataKey={k}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}