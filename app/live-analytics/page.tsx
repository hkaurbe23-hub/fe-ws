"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Activity,
  Cpu,
  Gauge,
  Waves,
  Zap,
  RefreshCw
} from "lucide-react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts"

const API = process.env.NEXT_PUBLIC_API_URL

type MetricValue = {
  value: number | null
  unit: string
}

type AnalyticsRecord = {
  timestamp: string
  [key: string]: string | MetricValue
}

type SlaveAnalytics = {
  slave_id: number
  slave_name: string
  device_id: string
  latest: AnalyticsRecord | null
  records: AnalyticsRecord[]
}

type BoardAnalyticsResponse = {
  type: "board"
  board: {
    id: number
    board_uid: string
    serial_number: string
  }
  slaves: SlaveAnalytics[]
  updatedAt: string
}

type SingleSlaveAnalyticsResponse = {
  type: "slave"
  board: {
    id: number
    board_uid: string
    serial_number: string
  }
  slave: {
    slave_id: number
    slave_name: string
    device_id: string
  }
  latest: AnalyticsRecord | null
  records: AnalyticsRecord[]
  updatedAt: string
}

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

function formatTime(value?: string) {
  if (!value) return "-"
  const date = new Date(value)
  return date.toLocaleString()
}

function getMetric(record: AnalyticsRecord | null | undefined, key: string) {
  if (!record) return null
  const item = record[key] as MetricValue | undefined
  if (!item || typeof item !== "object") return null
  return item
}

function getAvailableMetricKeys(records: AnalyticsRecord[]) {
  const keys = new Set<string>()

  records.forEach((record) => {
    Object.keys(record).forEach((key) => {
      if (key !== "timestamp") {
        const value = record[key]
        if (value && typeof value === "object" && "value" in value) {
          keys.add(key)
        }
      }
    })
  })

  return Array.from(keys)
}

function buildTrendData(records: AnalyticsRecord[], metricKeys: string[]) {
  return records.map((record) => {
    const row: Record<string, string | number | null> = {
      time: new Date(record.timestamp).toLocaleTimeString()
    }

    metricKeys.forEach((key) => {
      const metric = getMetric(record, key)
      row[key] = metric?.value ?? null
    })

    return row
  })
}

function MetricCard({
  title,
  value,
  unit,
  icon: Icon
}: {
  title: string
  value: number | string | null | undefined
  unit?: string
  icon: any
}) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-gray-500">{title}</p>
        <Icon className="h-4 w-4 text-gray-500" />
      </div>
      <div className="text-2xl font-semibold text-gray-900 break-words">
        {value !== null && value !== undefined ? value : "-"}
      </div>
      <p className="mt-1 text-xs text-gray-500">{unit || ""}</p>
    </div>
  )
}

function SectionCard({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>
      {children}
    </div>
  )
}

export default function LiveAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [data, setData] = useState<
    BoardAnalyticsResponse | SingleSlaveAnalyticsResponse | null
  >(null)

  const [lastRefresh, setLastRefresh] = useState<string>("")

  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null

  const type = searchParams?.get("type")
  const boardId = searchParams?.get("boardId")
  const slaveId = searchParams?.get("slaveId")

  const jwtToken =
    typeof window !== "undefined"
      ? localStorage.getItem("jwtToken")
      : null

  const fetchAnalytics = async () => {
    if (!boardId) {
      setError("Missing board ID")
      setLoading(false)
      return
    }

    try {
      const endpoint =
        type === "slave" && slaveId
          ? `${API}/api/boards/${boardId}/analytics/${slaveId}`
          : `${API}/api/boards/${boardId}/analytics`

      const res = await fetch(endpoint, {
        headers: jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error || "Failed to load analytics")
        setLoading(false)
        return
      }

      setData(json)
      setError("")
      setLastRefresh(new Date().toISOString())
    } catch (err) {
      console.error("Live analytics fetch error:", err)
      setError("Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()

    const interval = setInterval(() => {
      fetchAnalytics()
    }, 8000)

    return () => clearInterval(interval)
  }, [boardId, slaveId, type])

  const latestRecord = useMemo(() => {
    if (!data) return null
    if (data.type === "slave") return data.latest
    if (data.type === "board" && data.slaves.length > 0) {
      return data.slaves[0].latest
    }
    return null
  }, [data])

  const slaveRecords = useMemo(() => {
    if (!data) return []
    if (data.type === "slave") return data.records
    return []
  }, [data])

  const availableKeys = useMemo(() => {
    if (!slaveRecords.length) return []
    return getAvailableMetricKeys(slaveRecords)
  }, [slaveRecords])

  const voltageKeys = availableKeys.filter((k) => k.toLowerCase().includes("voltage"))
  const currentKeys = availableKeys.filter((k) => k.toLowerCase().includes("current"))
  const powerKeys = availableKeys.filter((k) => k.toLowerCase().includes("power"))
  const energyKeys = availableKeys.filter((k) => k.toLowerCase().includes("energy"))
  const qualityKeys = availableKeys.filter(
    (k) =>
      k.toLowerCase().includes("unbalance") ||
      k.toLowerCase().includes("frequency") ||
      k.toLowerCase().includes("factor")
  )

  const voltageData = buildTrendData(slaveRecords, voltageKeys)
  const currentData = buildTrendData(slaveRecords, currentKeys)
  const powerData = buildTrendData(slaveRecords, powerKeys)

  const energyPieData =
    latestRecord && energyKeys.length > 0
      ? energyKeys
          .map((key) => {
            const metric = getMetric(latestRecord, key)
            return {
              name: key,
              value: metric?.value ?? 0
            }
          })
          .filter((item) => item.value > 0)
      : []

  const boardComparisonData =
    data?.type === "board"
      ? data.slaves.map((slave) => ({
          name: slave.slave_name,
          activePowerTotal:
            getMetric(slave.latest, "activePowerTotal")?.value ?? 0,
          currentAvg:
            getMetric(slave.latest, "currentAvg")?.value ?? 0,
          voltageLLAvg:
            getMetric(slave.latest, "voltageLLAvg")?.value ?? 0
        }))
      : []

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex h-[70vh] items-center justify-center">
          <div className="flex items-center gap-3 text-gray-600">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Loading live analytics...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl rounded-2xl border bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">Live Analytics</h1>
          <p className="mt-4 text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl rounded-2xl border bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">Live Analytics</h1>
          <p className="mt-4 text-gray-500">No data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                Live Analytics
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Device: {data.board.board_uid}
              </p>
              <p className="text-sm text-gray-500">
                Mode: {data.type === "slave" ? "Single Slave" : "Board"}
              </p>
              {data.type === "slave" && (
                <p className="text-sm text-gray-500">
                  Slave: {data.slave.slave_name} ({data.slave.slave_id})
                </p>
              )}
              <p className="text-sm text-gray-500">
                Last refresh: {formatTime(lastRefresh)}
              </p>
            </div>

            <button
              onClick={fetchAnalytics}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh now
            </button>
          </div>
        </div>

        {data.type === "slave" && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Active Power Total"
                value={getMetric(data.latest, "activePowerTotal")?.value}
                unit={getMetric(data.latest, "activePowerTotal")?.unit}
                icon={Zap}
              />
              <MetricCard
                title="Current Average"
                value={getMetric(data.latest, "currentAvg")?.value}
                unit={getMetric(data.latest, "currentAvg")?.unit}
                icon={Activity}
              />
              <MetricCard
                title="Voltage LL Average"
                value={getMetric(data.latest, "voltageLLAvg")?.value}
                unit={getMetric(data.latest, "voltageLLAvg")?.unit}
                icon={Gauge}
              />
              <MetricCard
                title="Frequency"
                value={getMetric(data.latest, "frequency")?.value}
                unit={getMetric(data.latest, "frequency")?.unit}
                icon={Waves}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {voltageKeys.length > 0 && (
                <SectionCard title="Voltage Trend">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={voltageData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {voltageKeys.map((key) => (
                          <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            strokeWidth={2}
                            dot={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>
              )}

              {currentKeys.length > 0 && (
                <SectionCard title="Current Trend">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={currentData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {currentKeys.map((key) => (
                          <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            strokeWidth={2}
                            dot={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>
              )}

              {powerKeys.length > 0 && (
                <SectionCard title="Power Trend">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={powerData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {powerKeys.map((key) => (
                          <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            strokeWidth={2}
                            dot={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>
              )}

              {energyPieData.length > 0 && (
                <SectionCard title="Energy Distribution">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={energyPieData}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={110}
                          label
                        >
                          {energyPieData.map((_, index) => (
                            <Cell
                              key={index}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>
              )}
            </div>

            {qualityKeys.length > 0 && (
              <SectionCard title="Power Quality / Other Metrics">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {qualityKeys.map((key) => {
                    const metric = getMetric(data.latest, key)
                    return (
                      <MetricCard
                        key={key}
                        title={key}
                        value={metric?.value}
                        unit={metric?.unit}
                        icon={Cpu}
                      />
                    )
                  })}
                </div>
              </SectionCard>
            )}

            <SectionCard title="Latest Raw Values">
              <div className="overflow-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left">
                      <th className="px-4 py-3 font-medium">Parameter</th>
                      <th className="px-4 py-3 font-medium">Value</th>
                      <th className="px-4 py-3 font-medium">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableKeys.map((key) => {
                      const metric = getMetric(data.latest, key)
                      return (
                        <tr key={key} className="border-b">
                          <td className="px-4 py-3">{key}</td>
                          <td className="px-4 py-3">
                            {metric?.value ?? "-"}
                          </td>
                          <td className="px-4 py-3">
                            {metric?.unit || "-"}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </>
        )}

        {data.type === "board" && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Total Slaves"
                value={data.slaves.length}
                unit="connected"
                icon={Cpu}
              />
              <MetricCard
                title="Device ID"
                value={data.board.board_uid}
                unit=""
                icon={Activity}
              />
              <MetricCard
                title="Latest Updated Slaves"
                value={data.slaves.filter((s) => s.latest).length}
                unit="with data"
                icon={Gauge}
              />
              <MetricCard
                title="Refresh Window"
                value={8}
                unit="seconds"
                icon={RefreshCw}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <SectionCard title="Slave Active Power Comparison">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={boardComparisonData} barCategoryGap="35%">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="activePowerTotal"
                        fill="#2563eb"
                        radius={[6, 6, 0, 0]}
                        barSize={28}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard title="Slave Average Current Comparison">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={boardComparisonData} barCategoryGap="35%">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="currentAvg"
                        fill="#2563eb"
                        radius={[6, 6, 0, 0]}
                        barSize={28}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>
            </div>

            <SectionCard title="Slave Latest Snapshot Table">
              <div className="overflow-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left">
                      <th className="px-4 py-3 font-medium">Slave</th>
                      <th className="px-4 py-3 font-medium">Active Power Total</th>
                      <th className="px-4 py-3 font-medium">Current Avg</th>
                      <th className="px-4 py-3 font-medium">Voltage LL Avg</th>
                      <th className="px-4 py-3 font-medium">Frequency</th>
                      <th className="px-4 py-3 font-medium">Power Factor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.slaves.map((slave) => (
                      <tr key={slave.slave_id} className="border-b">
                        <td className="px-4 py-3">
                          {slave.slave_name} ({slave.slave_id})
                        </td>
                        <td className="px-4 py-3">
                          {getMetric(slave.latest, "activePowerTotal")?.value ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          {getMetric(slave.latest, "currentAvg")?.value ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          {getMetric(slave.latest, "voltageLLAvg")?.value ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          {getMetric(slave.latest, "frequency")?.value ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          {getMetric(slave.latest, "powerFactorTotal")?.value ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </>
        )}
      </div>
    </div>
  )
}
