"use client"

import { useEffect, useState } from "react"
import { ChevronDown, Download, FileSpreadsheet, BarChart2, Zap } from "lucide-react"

const API = process.env.NEXT_PUBLIC_API_URL

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]

export default function ReportsPage() {
  const [boards, setBoards] = useState<any[]>([])
  const [boardSlaves, setBoardSlaves] = useState<any>({})
  const [selectedBoards, setSelectedBoards] = useState<number[]>([])
  const [selectedSlaves, setSelectedSlaves] = useState<any>({})
  const [openBoards, setOpenBoards] = useState(false)
  const [openSlaves, setOpenSlaves] = useState(false)
  const [loadingNormal, setLoadingNormal] = useState(false)
  const [loadingSingle, setLoadingSingle] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const token =
    typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null
  const userEmail =
    typeof window !== "undefined"
      ? localStorage.getItem("userEmail")?.toLowerCase()
      : null

  useEffect(() => {
    fetchBoards()
  }, [])

  const fetchBoards = async () => {
    const res = await fetch(`${API}/api/boards`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const json = await res.json()
    const myBoards = json.filter((b: any) => b.email?.toLowerCase() === userEmail)
    setBoards(myBoards)
    setSelectedBoards([])
    myBoards.forEach((b: any) => fetchSlaves(b.id))
  }

  const fetchSlaves = async (boardId: number) => {
    const res = await fetch(`${API}/api/boards/${boardId}/slaves`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const json = await res.json()
    setBoardSlaves((prev: any) => ({ ...prev, [boardId]: json }))
    setSelectedSlaves((prev: any) => ({ ...prev, [boardId]: [] }))
  }

  const toggleBoard = (id: number) => {
    if (selectedBoards.includes(id)) {
      setSelectedBoards(selectedBoards.filter((b) => b !== id))
      setSelectedSlaves((prev: any) => ({ ...prev, [id]: [] }))
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
    setSelectedSlaves({
      ...selectedSlaves,
      [boardId]: current.includes(slaveId)
        ? current.filter((s: number) => s !== slaveId)
        : [...current, slaveId],
    })
  }

  const handleDownload = async () => {
    if (selectedBoards.length === 0) {
      alert("Select at least one board")
      return
    }
    const payload = selectedBoards.map((bid) => ({
      board_id: bid,
      slave_ids: selectedSlaves[bid] || [],
    }))
    setOpenBoards(false)
    setOpenSlaves(false)
    setLoadingNormal(true)
    const res = await fetch(`${API}/api/reports/export`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ boards: payload, month: selectedMonth, year: selectedYear }),
    })
    if (!res.ok) {
      const err = await res.json()
      alert(err.error || "Download failed")
      setLoadingNormal(false)
      return
    }
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "Energy_Report.xlsx"
    a.click()
    setLoadingNormal(false)
  }

  const handleSingleSheetDownload = async () => {
    const payload = boards.map((b) => ({ board_id: b.id, slave_ids: [] }))
    setOpenBoards(false)
    setOpenSlaves(false)
    setLoadingSingle(true)
    const res = await fetch(`${API}/api/reports/export-single`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ boards: payload, month: selectedMonth, year: selectedYear }),
    })
    if (!res.ok) {
      const err = await res.json()
      alert(err.error || "Download failed")
      setLoadingSingle(false)
      return
    }
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "Single_Sheet_Report.xlsx"
    a.click()
    setLoadingSingle(false)
  }

  const selectedSlaveCount = Object.values(selectedSlaves as Record<string, number[]>)
    .flat()
    .length

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0fdfb",
        fontFamily: "'DM Sans', sans-serif",
        padding: "2rem",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

        .ws-card {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0,191,165,0.10);
          overflow: visible;
        }

        .ws-dropdown-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #fff;
          border: 1.5px solid #99e6da;
          border-radius: 10px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 20px;
          font-weight: 500;
          color: #000706;
          transition: all 0.18s;
          white-space: nowrap;
        }
        .ws-dropdown-btn:hover {
          background: #e0faf6;
          border-color: #00bfa5;
        }
        .ws-dropdown-btn.active {
          background: #e0faf6;
          border-color: #00bfa5;
        }

        .ws-dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          background: #fff;
          border: 1.5px solid #99e6da;
          border-radius: 12px;
          padding: 12px;
          z-index: 100;
          min-width: 200px;
          max-height: 260px;
          overflow-y: auto;
          box-shadow: 0 8px 24px rgba(0,191,165,0.14);
        }
        .ws-dropdown-menu::-webkit-scrollbar { width: 4px; }
        .ws-dropdown-menu::-webkit-scrollbar-thumb {
          background: #66d9c8;
          border-radius: 4px;
        }

        .ws-checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 20px;
          color: #000706;
          padding: 5px 4px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.12s;
        }
        .ws-checkbox-label:hover { background: #e0faf6; }
        .ws-checkbox-label input[type="checkbox"] {
          accent-color: #00bfa5;
          width: 15px;
          height: 15px;
          cursor: pointer;
        }

        .ws-select {
          padding: 10px 16px;
          background: #ffffff;
          border: 1.5px solid #99e6da;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: #111111;
          cursor: pointer;
          outline: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%2300bfa5' stroke-width='3'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          background-size: 18px;
          padding-right: 42px;
          transition: all 0.18s;
        }
        .ws-select:hover, .ws-select:focus {
          border-color: #00bfa5;
          background-color: #ffffff;
        }

        .ws-btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #00c9b1, #00897b);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 20px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s;
          box-shadow: 0 4px 12px rgba(0,191,165,0.30);
          white-space: nowrap;
        }
        .ws-btn-primary:hover {
          background: linear-gradient(135deg, #00d9bf, #00897b);
          box-shadow: 0 6px 16px rgba(0,191,165,0.40);
          transform: translateY(-1px);
        }
        .ws-btn-primary:active { transform: translateY(0); }
        .ws-btn-primary:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        .ws-btn-secondary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #fff;
          border: 1.5px solid #00bfa5;
          border-radius: 10px;
          color: #007a6a;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s;
          white-space: nowrap;
        }
        .ws-btn-secondary:hover {
          background: #e0faf6;
          box-shadow: 0 4px 12px rgba(0,191,165,0.14);
          transform: translateY(-1px);
        }
        .ws-btn-secondary:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        .ws-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #00bfa5;
          color: #fff;
          font-size: 11px;
          font-weight: 600;
          border-radius: 999px;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
        }

        .ws-stat-card {
          border-radius: 14px;
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 16px;
          color: #fff;
        }
        .ws-icon-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.22);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .separator {
          height: 1.5px;
          background: linear-gradient(90deg, #99e6da, transparent);
          margin: 1.5rem 0;
        }
        .divider-label {
          font-size: 16px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #000706;
          margin-bottom: 8px;
          padding-top: 4px;
          border-top: 1.5px solid #e0faf6;
        }

        .loading-dot {
          display: inline-block;
          animation: blink 1.2s step-start infinite;
        }
        .loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .loading-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "linear-gradient(135deg, #00c9b1, #00897b)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BarChart2 size={20} color="#fff" />
          </div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 600,
              color: "#007a6a",
              margin: 0,
            }}
          >
            Reports Dashboard
          </h1>
        </div>
        <p style={{ color: "#4db6ac", fontSize: 14, margin: 0, paddingLeft: 52 }}>
          Export and analyse energy data across your boards
        </p>
      </div>

      {/* ── Summary Stats Strip ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: "1.75rem",
        }}
      >
        <div
          className="ws-stat-card"
          style={{ background: "linear-gradient(135deg, #00897b, #00695c)" }}
        >
          <div className="ws-icon-circle">
            <Zap size={20} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 20, margin: 0, opacity: 0.85 }}>Total Boards</p>
            <p style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>{boards.length}</p>
          </div>
        </div>

        <div
          className="ws-stat-card"
          style={{ background: "linear-gradient(135deg, #00bfa5, #00897b)" }}
        >
          <div className="ws-icon-circle">
            <BarChart2 size={20} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 20, margin: 0, opacity: 0.85 }}>Selected Boards</p>
            <p style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>{selectedBoards.length}</p>
          </div>
        </div>

        <div
          className="ws-stat-card"
          style={{ background: "linear-gradient(135deg, #4dd0c4, #00bfa5)" }}
        >
          <div className="ws-icon-circle">
            <FileSpreadsheet size={20} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 20, margin: 0, opacity: 0.85 }}>Selected Slaves</p>
            <p style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>{selectedSlaveCount}</p>
          </div>
        </div>
      </div>

      {/* ── Main Filter + Export Card ── */}
      <div className="ws-card" style={{ padding: "1.5rem 2rem" }}>
        <p
          style={{
            fontSize: 18,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "#000706",
            marginBottom: 16,
          }}
        >
          Filter & Export
        </p>

        {/* Row 1: Boards + Slaves + Period */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          {/* BOARDS DROPDOWN */}
          <div style={{ position: "relative" }}>
            <button
              className={`ws-dropdown-btn ${openBoards ? "active" : ""}`}
              onClick={() => { setOpenBoards(!openBoards); setOpenSlaves(false) }}
            >
              Boards
              {selectedBoards.length > 0 && (
                <span className="ws-badge">{selectedBoards.length}</span>
              )}
              <ChevronDown
                size={16}
                style={{
                  transition: "transform 0.2s",
                  transform: openBoards ? "rotate(180deg)" : "rotate(0)",
                }}
              />
            </button>

            {openBoards && (
              <div className="ws-dropdown-menu">
                <label className="ws-checkbox-label" style={{ fontWeight: 600, marginBottom: 6 }}>
                  <input
                    type="checkbox"
                    checked={selectedBoards.length === boards.length && boards.length > 0}
                    onChange={() => {
                      if (selectedBoards.length === boards.length) {
                        setSelectedBoards([])
                        setSelectedSlaves({})
                      } else {
                        const allBoardIds = boards.map((b) => b.id)
                        const allSlaves: any = {}
                        boards.forEach((b) => {
                          allSlaves[b.id] = (boardSlaves[b.id] || []).map((s: any) => s.slave_id)
                        })
                        setSelectedBoards(allBoardIds)
                        setSelectedSlaves(allSlaves)
                      }
                    }}
                  />
                  All Boards
                </label>
                <div className="separator" style={{ margin: "6px 0" }} />
                {boards.map((b) => (
                  <label key={b.id} className="ws-checkbox-label">
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

          {/* SLAVES DROPDOWN */}
          <div style={{ position: "relative" }}>
            <button
              className={`ws-dropdown-btn ${openSlaves ? "active" : ""}`}
              onClick={() => { setOpenSlaves(!openSlaves); setOpenBoards(false) }}
              disabled={selectedBoards.length === 0}
              style={{ opacity: selectedBoards.length === 0 ? 0.5 : 1 }}
            >
              Slave IDs
              {selectedSlaveCount > 0 && (
                <span className="ws-badge">{selectedSlaveCount}</span>
              )}
              <ChevronDown
                size={16}
                style={{
                  transition: "transform 0.2s",
                  transform: openSlaves ? "rotate(180deg)" : "rotate(0)",
                }}
              />
            </button>

            {openSlaves && (
              <div className="ws-dropdown-menu" style={{ minWidth: 240 }}>
                {selectedBoards.map((bid) => {
                  const slaves = boardSlaves[bid] || []
                  return (
                    <div key={bid} style={{ marginBottom: 12 }}>
                      <p className="divider-label">
                        {boards.find((b) => b.id === bid)?.board_uid}
                      </p>
                      {slaves.length === 0 && (
                        <p style={{ fontSize: 14, color: "#000706", padding: "2px 4px" }}>
                          No slaves configured
                        </p>
                      )}
                      {slaves.length > 0 && (
                        <label className="ws-checkbox-label" style={{ fontWeight: 600 }}>
                          <input
                            type="checkbox"
                            checked={(selectedSlaves[bid]?.length || 0) === slaves.length}
                            onChange={() => {
                              if ((selectedSlaves[bid]?.length || 0) === slaves.length) {
                                setSelectedSlaves({ ...selectedSlaves, [bid]: [] })
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
                        <label key={s.slave_id} className="ws-checkbox-label">
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

          {/* DIVIDER */}
          <div
            style={{
              width: 1.5,
              height: 36,
              background: "#99e6da",
              borderRadius: 2,
              flexShrink: 0,
            }}
          />

          {/* MONTH */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="ws-select"
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>

          {/* YEAR */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="ws-select"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Row 2: Export buttons */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            paddingTop: 16,
            borderTop: "1.5px solid #e0faf6",
          }}
        >
          <button
            className="ws-btn-primary"
            onClick={handleDownload}
            disabled={loadingNormal}
          >
            <Download size={16} />
            {loadingNormal ? (
              <>
                Downloading
                <span className="loading-dot">.</span>
                <span className="loading-dot">.</span>
                <span className="loading-dot">.</span>
              </>
            ) : (
              "Download Report"
            )}
          </button>

          <button
            className="ws-btn-secondary"
            onClick={handleSingleSheetDownload}
            disabled={loadingSingle}
          >
            <FileSpreadsheet size={16} />
            {loadingSingle ? (
              <>
                Downloading
                <span className="loading-dot">.</span>
                <span className="loading-dot">.</span>
                <span className="loading-dot">.</span>
              </>
            ) : (
              "Download Single Sheet"
            )}
          </button>

          <p
            style={{
              fontSize: 16,
              color: "#000706",
              margin: "auto 0 auto auto",
              alignSelf: "center",
            }}
          >
            {MONTHS[selectedMonth - 1]} {selectedYear}
            {selectedBoards.length > 0 && ` · ${selectedBoards.length} board${selectedBoards.length > 1 ? "s" : ""}`}
          </p>
        </div>
      </div>
    </div>
  )
}