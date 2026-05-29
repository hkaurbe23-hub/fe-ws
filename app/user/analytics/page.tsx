"use client"

import { useEffect, useState } from "react"
import { ChevronDown, Activity, Zap, BarChart3, TrendingUp, Clock, Cpu, Moon, Sun } from "lucide-react"

import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  Bar,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const API = process.env.NEXT_PUBLIC_API_URL

const PHASE_COLORS: any = {
  A: "#ef4444",
  B: "#f59e0b",
  C: "#3b82f6",
}

export default function UserAnalyticsPage() {
  const [boards, setBoards] = useState<any[]>([])
  const [boardSlaves, setBoardSlaves] = useState<any>({})
  const [selectedBoards, setSelectedBoards] = useState<number[]>([])
  const [selectedSlaves, setSelectedSlaves] = useState<any>({})
  const [openBoards, setOpenBoards] = useState(false)
  const [openSlaves, setOpenSlaves] = useState(false)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const token =
    typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null

  // ── USER: filter boards by logged-in user's email ──
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

  // ── USER: only shows boards belonging to this user ──
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
    setBoardSlaves((prev: any) => ({ ...prev, [boardId]: json }))
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
      setSelectedSlaves({ ...selectedSlaves, [boardId]: [] })
    } else {
      setSelectedSlaves({ ...selectedSlaves, [boardId]: [slaveId] })
    }
  }

  const fetchAnalytics = async () => {
    if (selectedBoards.length === 0) return
    const boardId = selectedBoards[0]
    const slaveId = selectedSlaves[boardId]?.[0]
    if (!slaveId) return

    setLoading(true)
    const res = await fetch(`${API}/api/boards/${boardId}/analytics/${slaveId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const json = await res.json()
    setData(json)

    localStorage.setItem(
      "analytics_state",
      JSON.stringify({ selectedBoards, selectedSlaves, data: json })
    )

    setLoading(false)
    setOpenBoards(false)
    setOpenSlaves(false)
  }

  const latest =
    data?.records?.length > 0 ? data.records[data.records.length - 1] : {}

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

  // ── ADVANCED: skips zeros, skips decreasing values (incremental protection) ──
  const buildChartData = (key: string) => {
    if (!data?.records) return []
    let lastHealthyValue: number | null = null
    return data.records
      .map((r: any, index: number) => {
        const currentValue = Number(r[key]?.value ?? 0)
        if (lastHealthyValue === null && currentValue > 0) {
          lastHealthyValue = currentValue
        } else if (currentValue === 0) {
        } else if (lastHealthyValue !== null && currentValue < lastHealthyValue) {
        } else if (currentValue > 0) {
          lastHealthyValue = currentValue
        }
        if (lastHealthyValue === null) return null
        return { index, value: lastHealthyValue, fullTime: r.timestamp }
      })
      .filter(Boolean)
  }

  const buildPieData = (type: string) => {
    if (!latest) return []
    if (type === "active") return [
      { name: "A", value: latest.activePowerA?.value || 0 },
      { name: "B", value: latest.activePowerB?.value || 0 },
      { name: "C", value: latest.activePowerC?.value || 0 },
    ]
    if (type === "apparent") return [
      { name: "A", value: latest.apparentPowerA?.value || 0 },
      { name: "B", value: latest.apparentPowerB?.value || 0 },
      { name: "C", value: latest.apparentPowerC?.value || 0 },
    ]
    if (type === "reactive") return [
      { name: "A", value: latest.reactivePowerA?.value || 0 },
      { name: "B", value: latest.reactivePowerB?.value || 0 },
      { name: "C", value: latest.reactivePowerC?.value || 0 },
    ]
    return []
  }

  const buildCurrentPie = () => {
    if (!latest) return []
    return [
      { name: "A", value: latest.currentA?.value || 0 },
      { name: "B", value: latest.currentB?.value || 0 },
      { name: "C", value: latest.currentC?.value || 0 },
    ]
  }

  const buildUnbalanceData = () => {
    if (!latest) return []
    return [
      { phase: "A", value: latest.currentUnbalanceA?.value || 0, label: "currentUnbalance : Phase A" },
      { phase: "B", value: latest.currentUnbalanceB?.value || 0, label: "currentUnbalance : Phase B" },
      { phase: "C", value: latest.currentUnbalanceC?.value || 0, label: "currentUnbalance : Phase C" },
    ]
  }

  const buildVoltageUnbalanceData = () => {
    if (!latest) return []
    return [
      { name: "AB",       value: latest.voltageUnbalanceAB?.value || 0,      label: "Voltage Unbalance AB" },
      { name: "BC",       value: latest.voltageUnbalanceBC?.value || 0,      label: "Voltage Unbalance BC" },
      { name: "CA",       value: latest.voltageUnbalanceCA?.value || 0,      label: "Voltage Unbalance CA" },
      { name: "LL Worst", value: latest.voltageUnbalanceLLWorst?.value || 0, label: "Voltage Unbalance LL Worst" },
      { name: "LN Worst", value: latest.voltageUnbalanceLNWorst?.value || 0, label: "Voltage Unbalance LN Worst" },
    ]
  }

  const buildTHDCurrentData = () => {
    if (!latest) return []
    return [
      { name: "A", value: latest.thdCurrentA?.value || 0, label: "THD Current : Phase A" },
      { name: "B", value: latest.thdCurrentB?.value || 0, label: "THD Current : Phase B" },
      { name: "C", value: latest.thdCurrentC?.value || 0, label: "THD Current : Phase C" },
    ]
  }

  const buildTHDVoltageData = () => {
    if (!latest) return []
    return [
      { name: "AB", value: latest.thdVoltageAB?.value || 0, label: "THD Voltage AB" },
      { name: "BC", value: latest.thdVoltageBC?.value || 0, label: "THD Voltage BC" },
      { name: "CA", value: latest.thdVoltageCA?.value || 0, label: "THD Voltage CA" },
      { name: "LL", value: latest.thdVoltageLL?.value || 0, label: "THD Voltage LL" },
      { name: "LN", value: latest.thdVoltageLN?.value || 0, label: "THD Voltage LN" },
    ]
  }

  const selectedBoardLabel = selectedBoards.length === 1
    ? boards.find(b => b.id === selectedBoards[0])?.board_uid || "1 Board"
    : selectedBoards.length > 1 ? `${selectedBoards.length} Boards` : "Select Board"

  const selectedSlaveLabel = (() => {
    if (selectedBoards.length === 0) return "Select Slave"
    const bid = selectedBoards[0]
    const sid = selectedSlaves[bid]?.[0]
    if (!sid) return "Select Slave"
    const slave = (boardSlaves[bid] || []).find((s: any) => s.slave_id === sid)
    return slave?.display_name || `Slave ${sid}`
  })()

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f8", fontFamily: "'Inter', 'DM Sans', sans-serif", padding: "1.75rem" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

        .an-dd-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 16px;
          background: #fff;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          cursor: pointer;
          font-family: inherit;
          font-size: 14px; font-weight: 500;
          color: #1e293b;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .an-dd-btn:hover { border-color: #1a7a5e; color: #1a7a5e; background: #f0fdf8; }
        .an-dd-btn.active { border-color: #1a7a5e; color: #1a7a5e; background: #f0fdf8; }
        .an-dd-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .an-dd-menu {
          position: absolute; top: calc(100% + 7px); left: 0;
          background: #fff;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 8px;
          z-index: 300;
          min-width: 220px; max-height: 270px;
          overflow-y: auto;
          box-shadow: 0 12px 32px rgba(0,0,0,0.10);
          animation: ddIn 0.13s ease;
        }
        @keyframes ddIn { from { opacity:0; transform:translateY(-5px) } to { opacity:1; transform:translateY(0) } }

        .an-check-row {
          display: flex; align-items: center; gap: 9px;
          padding: 8px 10px; border-radius: 8px; cursor: pointer;
          font-size: 14px; font-weight: 500; color: #1e293b;
          transition: background 0.1s;
        }
        .an-check-row:hover { background: #f0fdf8; color: #1a7a5e; }
        .an-check-row input[type="checkbox"] { accent-color: #1a7a5e; width: 14px; height: 14px; cursor: pointer; }

        .an-apply-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 10px 22px;
          background: #1a7a5e;
          border: none; border-radius: 10px;
          color: #fff;
          font-family: inherit;
          font-size: 14px; font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .an-apply-btn:hover { background: #155f49; }

        .an-kpi-card {
          background: #fff;
          border-radius: 14px;
          padding: 1.1rem 1.2rem;
          border: 1.5px solid #e2e8f0;
          transition: box-shadow 0.18s, border-color 0.18s;
          position: relative; overflow: hidden;
        }
        .an-kpi-card:hover {
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
          border-color: #cbd5e1;
        }

        .an-chart-card {
          background: #fff;
          border-radius: 14px;
          padding: 1.35rem 1.5rem;
          border: 1.5px solid #e2e8f0;
          transition: box-shadow 0.18s;
        }
        .an-chart-card:hover { box-shadow: 0 4px 18px rgba(0,0,0,0.07); }

        .an-section-label {
          font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.09em;
          color: #94a3b8; margin-bottom: 14px;
          display: flex; align-items: center; gap: 10px;
        }
        .an-section-label::after {
          content: ''; flex: 1; height: 1px; background: #e2e8f0;
        }

        .an-chart-title {
          font-size: 15px; font-weight: 600;
          color: #0f172a; margin: 0 0 1.1rem;
          display: flex; align-items: center; gap: 8px;
        }

        .an-filter-card {
          background: #fff;
          border-radius: 14px;
          border: 1.5px solid #e2e8f0;
          padding: 1.1rem 1.35rem;
          margin-bottom: 1.75rem;
        }

        @keyframes livePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          50% { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
        }
        .an-live-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #22c55e;
          animation: livePulse 2s infinite;
          flex-shrink: 0;
        }

        @keyframes spin { to { transform: rotate(360deg) } }
        .an-spinner {
          width: 44px; height: 44px;
          border: 3.5px solid #e2e8f0;
          border-top-color: #1a7a5e;
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
          margin: 0 auto;
        }

        .an-vdiv {
          width: 1px; height: 26px;
          background: #e2e8f0; flex-shrink: 0;
        }
      `}</style>

      {/* ── PAGE HEADER ── */}
      <div style={{ marginBottom: "1.75rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: "#1a7a5e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Activity size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1.2 }}>
              Energy Analytics
            </h1>
            <p style={{ color: "#64748b", fontSize: 14, margin: "3px 0 0" }}>
              Real-time power quality monitoring for your boards
            </p>
          </div>
        </div>

        {data && (
          <div style={{ display: "flex", alignItems: "center", gap: 7, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "9px 14px" }}>
            <Clock size={14} color="#1a7a5e" />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
              {formatRawTimestamp(latest?.timestamp) || "—"}
            </span>
          </div>
        )}
      </div>

      {/* ── FILTER BAR ── */}
      <div className="an-filter-card">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>

          {/* Board dropdown */}
          <div style={{ position: "relative" }}>
            <button
              className={`an-dd-btn ${openBoards ? "active" : ""}`}
              onClick={() => { setOpenBoards(!openBoards); setOpenSlaves(false) }}
            >
              <Cpu size={15} />
              {selectedBoardLabel}
              <ChevronDown size={14} style={{ transition: "transform 0.2s", transform: openBoards ? "rotate(180deg)" : "none" }} />
            </button>
            {openBoards && (
              <div className="an-dd-menu">
                {boards.map(b => (
                  <label key={b.id} className="an-check-row">
                    <input type="checkbox" checked={selectedBoards.includes(b.id)} onChange={() => toggleBoard(b.id)} />
                    {b.board_uid}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="an-vdiv" />

          {/* Slave dropdown */}
          <div style={{ position: "relative" }}>
            <button
              className={`an-dd-btn ${openSlaves ? "active" : ""}`}
              onClick={() => { setOpenSlaves(!openSlaves); setOpenBoards(false) }}
              disabled={selectedBoards.length === 0}
            >
              <Zap size={15} />
              {selectedSlaveLabel}
              <ChevronDown size={14} style={{ transition: "transform 0.2s", transform: openSlaves ? "rotate(180deg)" : "none" }} />
            </button>
            {openSlaves && (
              <div className="an-dd-menu" style={{ minWidth: 250 }}>
                {selectedBoards.map(bid => {
                  const slaves = boardSlaves[bid] || []
                  return (
                    <div key={bid}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#1a7a5e", textTransform: "uppercase", letterSpacing: "0.07em", padding: "4px 10px 6px" }}>
                        {boards.find(b => b.id === bid)?.board_uid}
                      </p>
                      {slaves.map((s: any) => (
                        <label key={s.slave_id} className="an-check-row">
                          <input type="checkbox" checked={selectedSlaves[bid]?.includes(s.slave_id) || false} onChange={() => toggleSlave(bid, s.slave_id)} />
                          {s.display_name || `Slave ${s.slave_id}`}
                        </label>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="an-vdiv" />

          <button className="an-apply-btn" onClick={fetchAnalytics}>
            <BarChart3 size={15} />
            Apply & Analyse
          </button>

          {data && (
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 8, padding: "7px 12px" }}>
              <span className="an-live-dot" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#15803d" }}>
                Live · {loadType?.toUpperCase() || "—"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div style={{ textAlign: "center", padding: "5rem 0" }}>
          <div className="an-spinner" />
          <p style={{ color: "#64748b", fontSize: 14, fontWeight: 500, marginTop: 16 }}>Fetching analytics…</p>
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!loading && !data && (
        <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: "#f0fdf8", border: "1.5px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.1rem" }}>
            <Activity size={30} color="#1a7a5e" />
          </div>
          <p style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>No data yet</p>
          <p style={{ fontSize: 14, color: "#64748b" }}>Select a board and slave, then click Apply & Analyse</p>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      {!loading && data && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

          {/* ── KPI CARDS ── */}
          <div>
            <p className="an-section-label">Key Metrics</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 12 }}>
              <KPI title="Active Load"       icon={<Zap size={14}/>}        accent="#1a7a5e" data={latest.activeEnergyDeliveredIntoLoad} />
              <KPI title="Apparent Energy"   icon={<Activity size={14}/>}   accent="#d97706" data={latest.apparentEnergyDelivered} />
              <KPI title="Reactive Energy"   icon={<TrendingUp size={14}/>} accent="#7c3aed" data={latest.reactiveEnergyDelivered} />
              <KPI title="Power Factor"      icon={<BarChart3 size={14}/>}  accent="#0369a1" data={latest.powerFactorTotal} />
              <KPI title="Frequency"         icon={<Activity size={14}/>}   accent="#1a7a5e" data={latest.frequency} />
              <KPI title="LL Avg Voltage"    icon={<Zap size={14}/>}        accent="#d97706" data={latest.voltageLLAvg} />
              <KPI title="LN Avg Voltage"    icon={<Zap size={14}/>}        accent="#7c3aed" data={latest.voltageLNAvg} />
              <KPI title="Day Consumption"   icon={<Sun size={14}/>}        accent="#0369a1" data={data?.kpis?.dayConsumption} />
              <KPI title="Night Consumption" icon={<Moon size={14}/>}       accent="#7c3aed" data={data?.kpis?.nightConsumption} />
            </div>
          </div>

          {/* ── LINE CHARTS ── */}
          <div>
            <p className="an-section-label">Energy Trends</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 14 }}>
              <LineBlock title="Active Energy"   data={buildChartData("activeEnergyDeliveredIntoLoad")} color="#1a7a5e" />
              <LineBlock title="Apparent Energy" data={buildChartData("apparentEnergyDelivered")}       color="#f59e0b" />
              <LineBlock title="Reactive Energy" data={buildChartData("reactiveEnergyDelivered")}       color="#8b5cf6" />
            </div>
          </div>

          {/* ── PIE CHARTS ── */}
          <div>
            <p className="an-section-label">Phase Distribution</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              <PieBlock title="Active Power"   accentColor="#ef4444" data={buildPieData("active")}   total={latest.activePowerTotal} />
              <PieBlock title="Apparent Power" accentColor="#f59e0b" data={buildPieData("apparent")} total={latest.apparentPowerTotal} />
              <PieBlock title="Reactive Power" accentColor="#8b5cf6" data={buildPieData("reactive")} total={latest.reactivePowerTotal} />
              <PieBlock title="Current"        accentColor="#0ea5e9" data={buildCurrentPie()}         total={latest.currentAvg} />
            </div>
          </div>

          {/* ── BAR CHARTS ── */}
          <div>
            <p className="an-section-label">Power Quality</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              <PhaseBarChart title="Current Unbalance" accentColor="#ef4444" data={buildUnbalanceData()} />
              <MultiBarChart title="Voltage Unbalance" accentColor="#f59e0b" data={buildVoltageUnbalanceData()} />
              <PhaseBarChart title="THD Current"       accentColor="#8b5cf6" data={buildTHDCurrentData()} />
              <MultiBarChart title="THD Voltage"       accentColor="#0ea5e9" data={buildTHDVoltageData()} />
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KPI({ title, data, icon, accent = "#1a7a5e" }: any) {
  return (
    <div className="an-kpi-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</p>
        <span style={{ color: accent, background: accent + "18", borderRadius: 6, padding: "3px 5px", display: "flex" }}>{icon}</span>
      </div>
      <p style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", margin: "0 0 2px", lineHeight: 1.1 }}>
        {data?.value !== undefined ? Number(data.value).toLocaleString() : "—"}
      </p>
      <p style={{ fontSize: 12, fontWeight: 500, color: "#94a3b8", margin: "0 0 10px" }}>{data?.unit ?? ""}</p>
      <div style={{ height: 3, borderRadius: 2, background: "#f1f5f9" }}>
        <div style={{ height: "100%", borderRadius: 2, background: accent, width: "60%" }} />
      </div>
    </div>
  )
}

// ─── Line Chart Block ────────────────────────────────────────────────────────

function LineBlock({ title, data, color = "#1a7a5e" }: any) {
  return (
    <div className="an-chart-card">
      <h3 className="an-chart-title">
        <span style={{ width: 4, height: 18, borderRadius: 2, background: color, flexShrink: 0, display: "block" }} />
        {title}
      </h3>
      <div style={{ height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="index" tick={false} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "none", borderRadius: 10, fontSize: 13, color: "#f8fafc" }}
              itemStyle={{ color: "#94a3b8" }}
              labelStyle={{ color: "#64748b", fontSize: 11 }}
              formatter={(v: any) => [`${v}`, "Value"]}
              labelFormatter={(_l, p) => {
                const raw = p?.[0]?.payload?.fullTime
                return raw ? raw.replace("T", " ").replace("Z", "").split(".")[0] : ""
              }}
            />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── Pie Chart Block ─────────────────────────────────────────────────────────

function PieBlock({ title, data, total, accentColor = "#1a7a5e" }: any) {
  const [hoverCenter, setHoverCenter] = useState(false)
  return (
    <div className="an-chart-card">
      <h3 className="an-chart-title">
        <span style={{ width: 4, height: 18, borderRadius: 2, background: accentColor, flexShrink: 0, display: "block" }} />
        {title} — Phase Wise
      </h3>
      <div style={{ height: 210, position: "relative" }}>
        <ResponsiveContainer>
          <PieChart>
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "none", borderRadius: 10, fontSize: 13 }}
              itemStyle={{ color: "#94a3b8" }}
              formatter={(v: any, n: any) => [`${v} ${total?.unit || ""}`, `Phase ${n}`]}
            />
            <Pie
              data={data} dataKey="value" nameKey="name"
              cx="50%" cy="50%"
              innerRadius="52%" outerRadius="70%"
              label={({ value }) => `${value} ${total?.unit || ""}`}
              labelLine={false}
            >
              {data.map((e: any, i: number) => (
                <Cell key={i} fill={PHASE_COLORS[e.name] || "#94a3b8"} />
              ))}
            </Pie>
            <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle"
              style={{ fontSize: 22, fontWeight: 700, fill: "#0f172a" }}>
              {total?.value ?? 0}
            </text>
            <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle"
              style={{ fontSize: 12, fill: "#94a3b8" }}>
              {total?.unit ?? ""}
            </text>
          </PieChart>
        </ResponsiveContainer>
        <div
          style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 110, height: 110, borderRadius: "50%" }}
          onMouseEnter={() => setHoverCenter(true)}
          onMouseLeave={() => setHoverCenter(false)}
        />
        {hoverCenter && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-100%)", background: "#0f172a", color: "#fff", padding: "8px 14px", borderRadius: 10, fontSize: 13, whiteSpace: "nowrap", pointerEvents: "none" }}>
            <strong>{title.includes("Current") ? "Avg Current" : "Total Power"}</strong><br />
            {total?.value ?? 0} {total?.unit ?? ""}
          </div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 6 }}>
        {data.map((e: any) => (
          <span key={e.name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#475569" }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: PHASE_COLORS[e.name] || "#94a3b8", display: "inline-block" }} />
            Phase {e.name}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Phase Bar Chart (A / B / C) ─────────────────────────────────────────────

function PhaseBarChart({ title, data, accentColor = "#ef4444" }: any) {
  const phaseColors: any = { A: "#ef4444", B: "#f59e0b", C: "#3b82f6" }
  return (
    <div className="an-chart-card">
      <h3 className="an-chart-title">
        <span style={{ width: 4, height: 18, borderRadius: 2, background: accentColor, flexShrink: 0, display: "block" }} />
        {title}
      </h3>
      <div style={{ height: 230 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }} barCategoryGap="55%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="phase"
              tickFormatter={(_v, i) => data[i]?.phase || data[i]?.name || ""}
              tick={{ fill: "#64748b", fontSize: 13, fontWeight: 600 }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              domain={[0, Math.ceil(Math.max(...data.map((d: any) => d.value), 1) + 1)]}
              allowDecimals={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false} tickLine={false}
            />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "none", borderRadius: 10, fontSize: 13 }}
              itemStyle={{ color: "#94a3b8" }}
              labelStyle={{ color: "#64748b" }}
              formatter={(v: any, _: any, p: any) => [`${v} %`, p.payload.label]}
            />
            <Bar dataKey="value" barSize={44} radius={[8, 8, 0, 0]}>
              {data.map((e: any, i: number) => {
                const k = e.phase || e.name
                return <Cell key={i} fill={phaseColors[k] || "#94a3b8"} />
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── Multi-series Bar Chart (AB / BC / CA / LL / LN) ─────────────────────────

function MultiBarChart({ title, data, accentColor = "#f59e0b" }: any) {
  const colorMap: any = {
    AB: "#ef4444", BC: "#f59e0b", CA: "#3b82f6",
    "LL Worst": "#ec4899", "LN Worst": "#8b5cf6",
    LL: "#ec4899", LN: "#8b5cf6",
    A: "#ef4444", B: "#f59e0b", C: "#3b82f6",
  }
  return (
    <div className="an-chart-card">
      <h3 className="an-chart-title">
        <span style={{ width: 4, height: 18, borderRadius: 2, background: accentColor, flexShrink: 0, display: "block" }} />
        {title}
      </h3>
      <div style={{ height: 230 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="45%" margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis
              domain={[0, Math.ceil(Math.max(...data.map((d: any) => d.value), 1) + 1)]}
              allowDecimals={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false} tickLine={false}
            />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "none", borderRadius: 10, fontSize: 13 }}
              itemStyle={{ color: "#94a3b8" }}
              labelStyle={{ color: "#64748b" }}
              formatter={(v: any, _: any, p: any) => [`${v} %`, p.payload.label]}
            />
            <Bar dataKey="value" barSize={34} radius={[7, 7, 0, 0]}>
              {data.map((e: any, i: number) => (
                <Cell key={i} fill={colorMap[e.name] || "#94a3b8"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}