"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Brush,
} from "recharts"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b"]

export default function EnergyDashboard() {
  const [authorized, setAuthorized] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)

  const [level, setLevel] = useState("level1")
  const [showIndividual, setShowIndividual] = useState(false)
  const [timeFilter, setTimeFilter] = useState("all")

  useEffect(() => {
    const token = localStorage.getItem("jwtToken")

    if (!token) {
      window.location.href = "/login"
      return
    }

    setAuthorized(true)
  }, [])

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("jwtToken")
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://api.wattsense.in"

      const res = await fetch(
        `${apiUrl}/api/dashboard/master`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await res.json()
      setDashboardData(data)
    } catch (err) {
      console.error("Dashboard fetch failed:", err)
    }
  }

  useEffect(() => {
    if (!authorized) return

    fetchDashboard()

    const interval = setInterval(fetchDashboard, 5000)
    return () => clearInterval(interval)
  }, [authorized])

  const applyTimeFilter = (records: any[]) => {
    if (timeFilter === "all") return records

    const now = new Date()

    return records.filter((r) => {
      const ts = new Date(r.timestamp)

      if (timeFilter === "hour") {
        return now.getTime() - ts.getTime() <= 3600000
      }

      if (timeFilter === "day") {
        return now.getTime() - ts.getTime() <= 86400000
      }

      if (timeFilter === "week") {
        return now.getTime() - ts.getTime() <= 604800000
      }

      return true
    })
  }

  if (!authorized || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg font-medium">
        Loading Dashboard...
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6 bg-slate-50 min-h-screen">

      {/* HEADER */}
      <div className="rounded-3xl bg-white border shadow-sm px-6 py-5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            ⚡ Energy Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time Master Dashboard Monitoring
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-[180px] rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="level1">Level 1</SelectItem>
              <SelectItem value="level2">Level 2</SelectItem>
              <SelectItem value="level3">Level 3</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[180px] rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="hour">Last Hour</SelectItem>
              <SelectItem value="day">Last Day</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
            </SelectContent>
          </Select>

          {level !== "level3" && (
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() =>
                setShowIndividual((prev) => !prev)
              }
            >
              {showIndividual
                ? "Combined View"
                : "Detailed View"}
            </Button>
          )}
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
        {dashboardData.kpis.map((kpi: any, i: number) => (
          <Card
            key={i}
            className="rounded-3xl border-0 shadow-md bg-gradient-to-br from-white to-slate-50"
          >
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-600">
                {kpi.board_uid} / Slave {kpi.slave_id}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 text-sm">
              <Metric label="Frequency" value={kpi.frequency} color="text-blue-600" />
              <Metric label="Power Factor" value={kpi.powerFactor} color="text-purple-600" />
              <Metric label="Active" value={kpi.activeEnergy} color="text-emerald-600" />
              <Metric label="Reactive" value={kpi.reactiveEnergy} color="text-orange-600" />
              <Metric label="Apparent" value={kpi.apparentEnergy} color="text-rose-600" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* LEVEL 1 */}
      {level === "level1" &&
        dashboardData.cumulative.map((series: any, idx: number) => {
          const records = applyTimeFilter(series.records)

          return (
            <Card key={idx} className="rounded-3xl shadow-md border-0">
              <CardHeader>
                <CardTitle>
                  Cumulative — {series.board_uid} / Slave {series.slave_id}
                </CardTitle>
              </CardHeader>

              <CardContent>
                {!showIndividual ? (
                  <ChartBox>
                    <LineChart data={records}>
                      <BaseChart />
                      <Line dataKey="activeEnergyDeliveredIntoLoad" stroke="#3b82f6" />
                      <Line dataKey="reactiveEnergyDelivered" stroke="#10b981" />
                      <Line dataKey="apparentEnergyDelivered" stroke="#f59e0b" />
                    </LineChart>
                  </ChartBox>
                ) : (
                  <div className="grid xl:grid-cols-3 gap-4">
                    <SingleLineChart title="Active Energy" dataKey="activeEnergyDeliveredIntoLoad" color="#3b82f6" records={records} />
                    <SingleLineChart title="Reactive Energy" dataKey="reactiveEnergyDelivered" color="#10b981" records={records} />
                    <SingleLineChart title="Apparent Energy" dataKey="apparentEnergyDelivered" color="#f59e0b" records={records} />
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}

      {/* LEVEL 2 */}
      {level === "level2" &&
        dashboardData.delta.map((series: any, idx: number) => {
          const records = applyTimeFilter(series.records)

          return (
            <Card key={idx} className="rounded-3xl shadow-md border-0">
              <CardHeader>
                <CardTitle>
                  Master Delta — {series.board_uid} / Slave {series.slave_id}
                </CardTitle>
              </CardHeader>

              <CardContent>
                {!showIndividual ? (
                  <>
                    <ChartBox>
                      <BarChart data={records}>
                        <BaseChart />
                        <Bar dataKey="deltaActiveEnergy" fill="#3b82f6" />
                        <Bar dataKey="deltaReactiveEnergy" fill="#10b981" />
                        <Bar dataKey="deltaApparentEnergy" fill="#f59e0b" />
                      </BarChart>
                    </ChartBox>

                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                      <MiniMetricCard title="Avg Current" value={records.at(-1)?.avgCurrent || 0} />
                      <MiniMetricCard title="Avg Voltage" value={records.at(-1)?.avgVoltage || 0} />
                    </div>
                  </>
                ) : (
                  <div className="grid xl:grid-cols-3 gap-4">
                    <SingleBarChart title="Delta Active" dataKey="deltaActiveEnergy" color="#3b82f6" records={records} />
                    <SingleBarChart title="Delta Reactive" dataKey="deltaReactiveEnergy" color="#10b981" records={records} />
                    <SingleBarChart title="Delta Apparent" dataKey="deltaApparentEnergy" color="#f59e0b" records={records} />
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}

      {/* LEVEL 3 */}
      {level === "level3" &&
        dashboardData.masterCumulative.map((cumSeries: any, idx: number) => {
          const deltaSeries = dashboardData.masterDelta[idx]

          const cumulativeRecords = applyTimeFilter(cumSeries.records)
          const deltaRecords = applyTimeFilter(deltaSeries.records)

          const latest =
            cumulativeRecords[cumulativeRecords.length - 1] || {}

          const pieData = [
            { name: "Active", value: latest.activeEnergyDeliveredIntoLoad || 0 },
            { name: "Reactive", value: latest.reactiveEnergyDelivered || 0 },
            { name: "Apparent", value: latest.apparentEnergyDelivered || 0 },
          ]

          return (
            <div key={idx} className="grid xl:grid-cols-3 gap-4">
              <Card className="rounded-3xl shadow-md border-0">
                <CardHeader>
                  <CardTitle>Master Energy Split</CardTitle>
                </CardHeader>
                <CardContent className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" outerRadius={100} label>
                        {pieData.map((_: any, i: number) => (
                          <Cell key={i} fill={COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-md border-0">
                <CardHeader>
                  <CardTitle>Master Cumulative Trend</CardTitle>
                </CardHeader>
                <CardContent className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cumulativeRecords}>
                      <BaseChart />
                      <Line dataKey="activeEnergyDeliveredIntoLoad" stroke="#3b82f6" />
                      <Line dataKey="reactiveEnergyDelivered" stroke="#10b981" />
                      <Line dataKey="apparentEnergyDelivered" stroke="#f59e0b" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-md border-0">
                <CardHeader>
                  <CardTitle>Master Delta Trend</CardTitle>
                </CardHeader>
                <CardContent className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deltaRecords}>
                      <BaseChart />
                      <Bar dataKey="deltaActiveEnergy" fill="#3b82f6" />
                      <Bar dataKey="deltaReactiveEnergy" fill="#10b981" />
                      <Bar dataKey="deltaApparentEnergy" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )
        })}
    </div>
  )
}

/* HELPERS */

function Metric({ label, value, color }: any) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  )
}

function MiniMetricCard({ title, value }: any) {
  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="text-2xl font-bold mt-1">{Number(value).toFixed(2)}</div>
      </CardContent>
    </Card>
  )
}

function ChartBox({ children }: any) {
  return (
    <div className="h-[430px]">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

function BaseChart() {
  return (
    <>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="timestamp" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Brush />
    </>
  )
}

function SingleLineChart({ title, dataKey, color, records }: any) {
  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={records}>
            <BaseChart />
            <Line dataKey={dataKey} stroke={color} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function SingleBarChart({ title, dataKey, color, records }: any) {
  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={records}>
            <BaseChart />
            <Bar dataKey={dataKey} fill={color} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}