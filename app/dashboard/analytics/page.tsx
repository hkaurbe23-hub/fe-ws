"use client"

import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"

import {
  ResponsiveContainer,
  LineChart,
  Bar,
  BarChart,
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

const API = process.env.NEXT_PUBLIC_API_URL

// ✅ COLORS FOR PIE
const PHASE_COLORS: any = {
  A: "#ef4444", // red
  B: "#eab308", // yellow
  C: "#3b82f6", // blue
  TOTAL: "#6b7280", // grey
}

export default function AnalyticsPage() {
  const [boards, setBoards] = useState<any[]>([])
  const [boardSlaves, setBoardSlaves] = useState<any>({})
  const [selectedBoards, setSelectedBoards] = useState<number[]>([])
  const [selectedSlaves, setSelectedSlaves] = useState<any>({})
  const [openBoards, setOpenBoards] = useState(false)
  const [openSlaves, setOpenSlaves] = useState(false)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("jwtToken")
      : null

  const userEmail =
    typeof window !== "undefined"
      ? localStorage.getItem("userEmail")?.toLowerCase()
      : null

  useEffect(() => {
    const saved = localStorage.getItem("analytics_state")
    if (saved) {
      const parsed = JSON.parse(saved)
      setSelectedBoards(parsed.selectedBoards || [])
      setSelectedSlaves(parsed.selectedSlaves || {})
      setData(parsed.data || null)
    }
  }, [])

  useEffect(() => {
    fetchBoards()
  }, [])

  const fetchBoards = async () => {
    const res = await fetch(`${API}/api/boards`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const json = await res.json()

    const myBoards = json.filter(
      (b: any) => b.email?.toLowerCase() === userEmail
    )

    setBoards(myBoards)
    myBoards.forEach((b: any) => fetchSlaves(b.id))
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
  }

  const toggleBoard = (id: number) => {
    if (selectedBoards.includes(id)) {
      setSelectedBoards([])
      setSelectedSlaves({})
    } else {
      setSelectedBoards([id])
      setSelectedSlaves({ [id]: [] })
    }
  }

  const toggleSlave = (boardId: number, slaveId: number) => {
    const current = selectedSlaves[boardId] || []

    if (current.includes(slaveId)) {
      setSelectedSlaves({
        ...selectedSlaves,
        [boardId]: [],
      })
    } else {
      setSelectedSlaves({
        ...selectedSlaves,
        [boardId]: [slaveId],
      })
    }
  }

  const fetchAnalytics = async () => {
    if (selectedBoards.length === 0) return

    const boardId = selectedBoards[0]
    const slaveId = selectedSlaves[boardId]?.[0]

    if (!slaveId) return

    setLoading(true)

    const res = await fetch(
      `${API}/api/boards/${boardId}/analytics/${slaveId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    const json = await res.json()
    setData(json)

    localStorage.setItem(
      "analytics_state",
      JSON.stringify({
        selectedBoards,
        selectedSlaves,
        data: json,
      })
    )

    setLoading(false)
    setOpenBoards(false)
setOpenSlaves(false)
  }

  const latest =
    data?.records?.length > 0
      ? data.records[data.records.length - 1]
      : {}

  const getLoadType = () => {
    if (selectedBoards.length === 0) return null

    const boardId = selectedBoards[0]
    const slaveId = selectedSlaves[boardId]?.[0]

    if (!slaveId) return null

    const slaves = boardSlaves[boardId] || []
    const slave = slaves.find((s: any) => s.slave_id === slaveId)

    return slave?.load_type || null
  }

  const loadType = getLoadType()

  const formatRawTimestamp = (ts: string) => {
    if (!ts) return ""
    return ts.replace("T", " ").replace("Z", "").split(".")[0]
  }

  const buildChartData = (key: string) => {
    if (!data?.records) return []

    return data.records.map((r: any, index: number) => ({
      index,
      value: r[key]?.value ?? 0,
      fullTime: r.timestamp,
    }))
  }

  // ✅ PIE DATA
  const buildPieData = (type: string) => {
    if (!latest) return []

    if (type === "active") {
      return [
        { name: "A", value: latest.activePowerA?.value || 0 },
        { name: "B", value: latest.activePowerB?.value || 0 },
        { name: "C", value: latest.activePowerC?.value || 0 },
      ]
    }

    if (type === "apparent") {
      return [
        { name: "A", value: latest.apparentPowerA?.value || 0 },
        { name: "B", value: latest.apparentPowerB?.value || 0 },
        { name: "C", value: latest.apparentPowerC?.value || 0 },
      ]
    }

    if (type === "reactive") {
      return [
        { name: "A", value: latest.reactivePowerA?.value || 0 },
        { name: "B", value: latest.reactivePowerB?.value || 0 },
        { name: "C", value: latest.reactivePowerC?.value || 0 },
      ]
    }

    return []
  }
  const buildUnbalanceData = () => {
  if (!latest) return []

  return [
    {
      phase: "A",
      value: latest.currentUnbalanceA?.value || 0,
      label: "currentUnbalance : Phase A",
    },
    {
      phase: "B",
      value: latest.currentUnbalanceB?.value || 0,
      label: "currentUnbalance : Phase B",
    },
    {
      phase: "C",
      value: latest.currentUnbalanceC?.value || 0,
      label: "currentUnbalance : Phase C",
    },
  ]
}
const buildVoltageUnbalanceData = () => {
  if (!latest) return []

  return [
    {
      name: "AB",
      value: latest.voltageUnbalanceAB?.value || 0,
      label: "Voltage Unbalance AB",
    },
    {
      name: "BC",
      value: latest.voltageUnbalanceBC?.value || 0,
      label: "Voltage Unbalance BC",
    },
    {
      name: "CA",
      value: latest.voltageUnbalanceCA?.value || 0,
      label: "Voltage Unbalance CA",
    },
    {
      name: "LL Worst",
      value: latest.voltageUnbalanceLLWorst?.value || 0,
      label: "Voltage Unbalance LL Worst",
    },
    {
      name: "LN Worst",
      value: latest.voltageUnbalanceLNWorst?.value || 0,
      label: "Voltage Unbalance LN Worst",
    },
  ]
}
const buildTHDCurrentData = () => {
  if (!latest) return []

  return [
    {
      name: "A",
      value: latest.thdCurrentA?.value || 0,
      label: "THD Current : Phase A",
    },
    {
      name: "B",
      value: latest.thdCurrentB?.value || 0,
      label: "THD Current : Phase B",
    },
    {
      name: "C",
      value: latest.thdCurrentC?.value || 0,
      label: "THD Current : Phase C",
    },
  ]
}
const buildTHDVoltageData = () => {
  if (!latest) return []

  return [
    {
      name: "AB",
      value: latest.thdVoltageAB?.value || 0,
      label: "THD Voltage AB",
    },
    {
      name: "BC",
      value: latest.thdVoltageBC?.value || 0,
      label: "THD Voltage BC",
    },
    {
      name: "CA",
      value: latest.thdVoltageCA?.value || 0,
      label: "THD Voltage CA",
    },
    {
      name: "LL",
      value: latest.thdVoltageLL?.value || 0,
      label: "THD Voltage LL",
    },
    {
      name: "LN",
      value: latest.thdVoltageLN?.value || 0,
      label: "THD Voltage LN",
    },
  ]
}
  const buildCurrentPie = () => {
  if (!latest) return []

  return [
    { name: "A", value: latest.currentA?.value || 0 },
    { name: "B", value: latest.currentB?.value || 0 },
    { name: "C", value: latest.currentC?.value || 0 },
  ]
}

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        Energy Analytics Dashboard
      </h1>

      {/* SELECTORS */}
      <div className="bg-white p-4 rounded shadow flex gap-4 flex-wrap">
        <div className="relative">
          <button onClick={() => setOpenBoards(!openBoards)} className="px-4 py-2 border rounded-md bg-gray-100 flex gap-2">
            Boards ({selectedBoards.length === 1 ? "1" : "Select"})
            <ChevronDown size={16} />
          </button>
          {openBoards && (
            <div className="absolute top-12 bg-white border shadow rounded p-3 z-50 max-h-60 overflow-auto">
              {boards.map((b) => (
                <label key={b.id} className="block text-sm">
                  <input type="checkbox" checked={selectedBoards.includes(b.id)} onChange={() => toggleBoard(b.id)} />
                  {b.board_uid}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => setOpenSlaves(!openSlaves)} className="px-4 py-2 border rounded-md bg-gray-100 flex gap-2">
            Slave IDs
            <ChevronDown size={16} />
          </button>
          {openSlaves && (
            <div className="absolute top-12 bg-white border shadow rounded p-3 z-50 max-h-60 overflow-auto w-64">
              {selectedBoards.map((bid) => {
                const slaves = boardSlaves[bid] || []
                return (
                  <div key={bid}>
                    {slaves.map((s: any) => (
                      <label key={s.slave_id} className="block text-sm">
                        <input
                          type="checkbox"
                          checked={selectedSlaves[bid]?.includes(s.slave_id) || false}
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

        <button onClick={fetchAnalytics} className="bg-blue-600 text-white px-4 py-2 rounded-md">
          Apply
        </button>
      </div>

      {loading && <p className="mt-4">Loading...</p>}

      {!loading && data && (
        <div className="space-y-6 mt-6">

          {/* HEADER */}
          <div className="bg-white p-5 rounded-2xl shadow">
            <h2 className="text-xl font-bold">
              ⚡ {loadType?.toUpperCase()}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Updated: {formatRawTimestamp(latest?.timestamp)}
            </p>
          </div>

          {/* KPI */}
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-7 gap-4">
            <KPI title="Active Load" data={latest.activeEnergyDeliveredIntoLoad} />
            <KPI title="Apparent Energy" data={latest.apparentEnergyDelivered} />
            <KPI title="Reactive Energy" data={latest.reactiveEnergyDelivered} />
            <KPI title="Power Factor" data={latest.powerFactorTotal} />
            <KPI title="Frequency" data={latest.frequency} />
            <KPI title="LL Avg Voltage" data={latest.voltageLLAvg} />
            <KPI title="LN Avg Voltage" data={latest.voltageLNAvg} />
          </div>

          {/* LINE CHARTS */}
          <ChartBlock title="Active Energy" data={buildChartData("activeEnergyDeliveredIntoLoad")} />
          <ChartBlock title="Apparent Energy" data={buildChartData("apparentEnergyDelivered")} />
          <ChartBlock title="Reactive Energy" data={buildChartData("reactiveEnergyDelivered")} />

          {/* PIE CHARTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            <PieBlock
              title="Active Power : Phase Wise"
              data={buildPieData("active")}
              total={latest.activePowerTotal}
            />

            <PieBlock
              title="Apparent Power : Phase Wise"
              data={buildPieData("apparent")}
              total={latest.apparentPowerTotal}
            />

            <PieBlock
              title="Reactive Power : Phase Wise"
              data={buildPieData("reactive")}
              total={latest.reactivePowerTotal}
            />
            <PieBlock
  title="Current : Phase Wise"
  data={buildCurrentPie()}
  total={latest.currentAvg}
/>
          </div>
          {/* ✅ CURRENT UNBALANCE BAR CHART */}
<UnbalanceBarChart data={buildUnbalanceData()} />
<VoltageUnbalanceBarChart data={buildVoltageUnbalanceData()} />
<UnbalanceBarChart data={buildTHDCurrentData()} />
<VoltageUnbalanceBarChart data={buildTHDVoltageData()} />

        </div>
      )}
    </div>
  )
}

function KPI({ title, data }: any) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <p className="text-xs text-gray-500">{title}</p>

      <p className="text-sm md:text-base font-semibold text-blue-600 mt-1 break-all leading-tight">
        {data?.value !== undefined ? Number(data.value).toString() : 0}
      </p>

      <p className="text-xs text-gray-400">{data?.unit ?? ""}</p>
    </div>
  )
}

function ChartBlock({ title, data }: any) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow">
      <h2 className="text-blue-600 font-semibold mb-3">{title}</h2>

      <div className="h-[260px]">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="index" tick={false} axisLine={false} />
            <YAxis />
            <Tooltip
              formatter={(value: any) => [`${value}`, "Value"]}
              labelFormatter={(label, payload) => {
                const raw = payload?.[0]?.payload?.fullTime
                return raw ? raw.replace("T", " ").replace("Z", "").split(".")[0] : ""
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function PieBlock({ title, data, total }: any) {
  const [hoverCenter, setHoverCenter] = useState(false)

  return (
    <div className="bg-white p-4 rounded-2xl shadow">
      <h2 className="text-blue-600 font-semibold mb-3">{title}</h2>

      <div className="h-[260px] flex items-center justify-center relative">
        <ResponsiveContainer>
          <PieChart>

            {/* ✅ NORMAL TOOLTIP (for slices) */}
            <Tooltip
              formatter={(value: any, name: any) => {
                return [`${value} ${total?.unit || ""}`, `Phase ${name}`]
              }}
            />

            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="55%"
outerRadius="80%"
              label={({ value }) => `${value}`} // ✅ keep your current behavior
            >
             {data.map((entry: any, index: number) => (
  <Cell key={index} fill={PHASE_COLORS[entry.name] || "#999"} />
))}
            </Pie>

            {/* ✅ CENTER VALUE (unchanged) */}
            <text
              x="50%"
              y="45%"
              textAnchor="middle"
              dominantBaseline="middle"
             className="text-sm md:text-base font-semibold fill-gray-800"
            >
              {total?.value ?? 0}
            </text>

            <text
              x="50%"
              y="60%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-gray-400"
            >
              {total?.unit ?? ""}
            </text>

          </PieChart>
        </ResponsiveContainer>

        {/* 🔥 INVISIBLE CENTER HOVER AREA */}
        <div
          className="absolute w-[120px] h-[120px] rounded-full"
          style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
          onMouseEnter={() => setHoverCenter(true)}
          onMouseLeave={() => setHoverCenter(false)}
        />

        {/* 🔥 CUSTOM CENTER TOOLTIP */}
        {hoverCenter && (
          <div className="absolute bg-black text-white px-3 py-2 rounded shadow text-sm">
            <div className="font-semibold">
              {title.includes("Current") ? "Current Average" : "Total Power"}
            </div>
            <div>
              {total?.value ?? 0} {total?.unit ?? ""}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
function UnbalanceBarChart({ data }: any) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow">
      <h2 className="text-blue-600 font-semibold mb-3">
        Current Unbalance (Phase Wise)
      </h2>

      {/* ✅ IMPORTANT: limit width so it doesn’t stretch */}
      <div className="h-[300px] flex justify-center">
        <div className="w-[400px]"> {/* 👈 controls compactness */}

          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              barCategoryGap="60%"   // more spacing between A B C
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

              <XAxis
                dataKey="phase"
                tick={{ fill: "#6b7280", fontSize: 13 }}
                axisLine={{ stroke: "#9ca3af" }}
                tickLine={false}
              />

              <YAxis
                domain={[0, Math.ceil(Math.max(...data.map((d: any) => d.value)) + 1)]}
                allowDecimals={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={{ stroke: "#9ca3af" }}
                tickLine={false}
              />

              <Tooltip
  contentStyle={{
    backgroundColor: "#111827",
    border: "none",
    borderRadius: "8px",
  }}
  itemStyle={{ color: "#fff" }}
  labelStyle={{ color: "#fff" }}
  formatter={(value: any, _: any, props: any) => {
    return [`${value} %`, props.payload.label]
  }}
/>

              {/* ❌ REMOVE LEGEND (it’s useless here) */}

              <Bar dataKey="value" barSize={35} radius={[10, 10, 0, 0]}>
  {data.map((entry: any, index: number) => {
  let color = "#2563eb"

  const key = entry.phase || entry.name   // 👈 IMPORTANT FIX

  if (key === "A") color = "#ef4444"   // RED
  if (key === "B") color = "#eab308"   // YELLOW
  if (key === "C") color = "#3b82f6"   // BLUE

  return <Cell key={index} fill={color} />
})}
</Bar>
            </BarChart>
          </ResponsiveContainer>

        </div>
      </div>
    </div>
  )
}

function VoltageUnbalanceBarChart({ data }: any) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow">
      <h2 className="text-blue-600 font-semibold mb-3">
        Voltage Unbalance
      </h2>

      <div className="h-[300px] flex justify-center">
        <div className="w-[500px]">

          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              barCategoryGap="50%"
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

              <XAxis
                dataKey="name"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={{ stroke: "#9ca3af" }}
                tickLine={false}
              />

              <YAxis
                domain={[0, Math.ceil(Math.max(...data.map((d: any) => d.value)) + 1)]}
                allowDecimals={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={{ stroke: "#9ca3af" }}
                tickLine={false}
              />

              <Tooltip
  contentStyle={{
    backgroundColor: "#111827",
    border: "none",
    borderRadius: "8px",
  }}
  itemStyle={{ color: "#fff" }}
  labelStyle={{ color: "#fff" }}
  formatter={(value: any, _: any, props: any) => {
    return [`${value} %`, props.payload.label]
  }}
/>

              <Bar dataKey="value" barSize={30} radius={[8, 8, 0, 0]}>
  {data.map((entry: any, index: number) => {
    let color = "#22c55e"

    if (entry.name === "AB") color = "#ef4444"        // RED
    if (entry.name === "BC") color = "#eab308"        // YELLOW
    if (entry.name === "CA") color = "#3b82f6"        // BLUE
   if (entry.name === "LL Worst" || entry.name === "LL") color = "#ec4899"  // PINK
if (entry.name === "LN Worst" || entry.name === "LN") color = "#92400e"  // BROWN

    return <Cell key={index} fill={color} />
  })}
</Bar>
            </BarChart>
          </ResponsiveContainer>

        </div>
      </div>
    </div>
  )
}