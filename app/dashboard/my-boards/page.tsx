"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Pencil, Check, X, Plus, Cpu, Hash } from "lucide-react"

const API = process.env.NEXT_PUBLIC_API_URL

type Board = {
  id: number
  board_uid: string
  serial_number: string
  email: string
  enabled: boolean
  floor_id: number
}

export default function MyBoardsPage() {
  const router = useRouter()

  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)

  const [boardSlaves, setBoardSlaves] = useState<any>({})
  const [slaveNames, setSlaveNames] = useState<any>({})
  const [editingSlave, setEditingSlave] = useState<string | null>(null)

  const [boardUid, setBoardUid] = useState("")
  const [serialNumber, setSerialNumber] = useState("")
  const [claimLoading, setClaimLoading] = useState(false)

  const [jwtToken, setJwtToken] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const hasInitialized = useRef(false)

  useEffect(() => {
    const token = localStorage.getItem("jwtToken")
    const email = localStorage.getItem("userEmail")
    if (!token) return router.replace("/login")
    setJwtToken(token)
    setUserEmail(email?.toLowerCase() || null)
  }, [router])

  const fetchSlaves = async (boardId: number) => {
    const res = await fetch(`${API}/api/boards/${boardId}/slaves`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    })
    const data = await res.json()
    setBoardSlaves((prev: any) => ({ ...prev, [boardId]: data }))
  }

  useEffect(() => {
    if (!jwtToken || !userEmail || hasInitialized.current) return
    hasInitialized.current = true

    const fetchBoards = async () => {
      setLoading(true)
      const res = await fetch(`${API}/api/boards`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      })
      const data: Board[] = await res.json()
      const myBoards = data.filter((b) => b.email?.toLowerCase() === userEmail)
      setBoards(myBoards)
      myBoards.forEach((b) => fetchSlaves(b.id))
      setLoading(false)
    }

    fetchBoards()
  }, [jwtToken, userEmail])

  const handleClaimBoard = async () => {
    if (!boardUid || !serialNumber) return alert("Fill all fields")
    setClaimLoading(true)

    const res = await fetch(`${API}/api/boards/claim`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ board_uid: boardUid, serial_number: serialNumber }),
    })

    const data = await res.json()
    if (!res.ok) { alert(data.error); setClaimLoading(false); return }

    alert("Board claimed!")

    const refresh = await fetch(`${API}/api/boards`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    })
    const updated: Board[] = await refresh.json()
    setBoards(updated.filter((b) => b.email?.toLowerCase() === userEmail))
    setBoardUid("")
    setSerialNumber("")
    setClaimLoading(false)
  }

  const handleRemoveBoard = async (boardId: number) => {
    if (!confirm("Remove this board?")) return
    await fetch(`${API}/api/boards/${boardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwtToken}` },
      body: JSON.stringify({ email: null }),
    })
    setBoards((prev) => prev.filter((b) => b.id !== boardId))
  }

  const handleSaveSlaveName = async (boardId: number, slaveId: number) => {
    const key = `${boardId}_${slaveId}`
    const name = slaveNames[key]
    try {
      const res = await fetch(`${API}/api/boards/${boardId}/slaves/${slaveId}/name`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwtToken}` },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.error || "Failed to save slave name"); return }
      alert(data.message || "Slave name saved successfully")
      fetchSlaves(boardId)
      setEditingSlave(null)
    } catch (err) {
      console.error(err)
      alert("Something went wrong")
    }
  }

  if (loading) return (
    <div style={styles.loadingWrap}>
      <div style={styles.loadingSpinner} />
      <p style={styles.loadingText}>Loading your boards...</p>
    </div>
  )

  const activeCount = boards.filter((b) => b.enabled).length

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <p style={styles.breadcrumb}>User / My Boards</p>
          <h1 style={styles.title}>My Boards</h1>
          <p style={styles.userEmail}>{userEmail}</p>
        </div>
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statIconWrap}>
            <Cpu size={20} color="#059669" />
          </div>
          <div>
            <p style={styles.statLabel}>Total Boards</p>
            <p style={styles.statValue}>{boards.length}</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIconWrap, background: "#ecfdf5" }}>
            <span style={{ fontSize: 18 }}>✅</span>
          </div>
          <div>
            <p style={styles.statLabel}>Active</p>
            <p style={{ ...styles.statValue, color: "#059669" }}>{activeCount}</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIconWrap, background: "#fef2f2" }}>
            <span style={{ fontSize: 18 }}>⛔</span>
          </div>
          <div>
            <p style={styles.statLabel}>Inactive</p>
            <p style={{ ...styles.statValue, color: "#dc2626" }}>{boards.length - activeCount}</p>
          </div>
        </div>
      </div>

      {/* Claim Board */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardHeaderIcon}>
            <Plus size={18} color="#059669" />
          </div>
          <div>
            <h2 style={styles.cardTitle}>Claim a Board</h2>
            <p style={styles.cardSubtitle}>Link a new board to your account using its UID and serial number</p>
          </div>
        </div>

        <div style={styles.claimRow}>
          <input
            value={boardUid}
            onChange={(e) => setBoardUid(e.target.value)}
            placeholder="Board UID  (e.g. BRD-XXXXXX)"
            style={styles.claimInput}
            onFocus={(e) => {
              e.target.style.borderColor = "#10b981"
              e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.15)"
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e5e7eb"
              e.target.style.boxShadow = "none"
            }}
          />
          <input
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            placeholder="Serial Number  (e.g. SN-XXXXXX)"
            style={styles.claimInput}
            onFocus={(e) => {
              e.target.style.borderColor = "#10b981"
              e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.15)"
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e5e7eb"
              e.target.style.boxShadow = "none"
            }}
          />
          <button
            onClick={handleClaimBoard}
            disabled={claimLoading}
            style={styles.claimBtn}
          >
            {claimLoading ? "Claiming..." : "Claim Board"}
          </button>
        </div>
      </div>

      {/* Boards List */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardHeaderIcon}>
            <Cpu size={18} color="#059669" />
          </div>
          <div>
            <h2 style={styles.cardTitle}>My Boards</h2>
            <p style={styles.cardSubtitle}>{boards.length} board{boards.length !== 1 ? "s" : ""} linked to your account</p>
          </div>
        </div>

        {boards.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📋</div>
            <p style={styles.emptyTitle}>No boards claimed yet</p>
            <p style={styles.emptyText}>Use the Claim a Board form above to get started.</p>
          </div>
        ) : (
          <div style={styles.boardsList}>
            {boards.map((board, idx) => {
              const slaves = boardSlaves[board.id] || []
              return (
                <div
                  key={board.id}
                  style={styles.boardRow}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLDivElement).style.background = "#f0fdf9"
                    ;(e.currentTarget as HTMLDivElement).style.borderColor = "#a7f3d0"
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLDivElement).style.background = "white"
                    ;(e.currentTarget as HTMLDivElement).style.borderColor = "#f3f4f6"
                  }}
                >
                  {/* Index dot */}
                  <div style={styles.boardIndex}>{idx + 1}</div>

                  {/* Board info */}
                  <div style={styles.boardInfo}>
                    <div style={styles.boardTopRow}>
                      <span style={styles.boardUid}>{board.board_uid}</span>
                      <span style={styles.boardSerial}>
                        <Hash size={12} style={{ marginRight: 3 }} />
                        {board.serial_number}
                      </span>
                    </div>

                    {slaves.length > 0 && (
                      <div style={styles.slavesWrap}>
                        {slaves.map((s: any) => {
                          const key = `${board.id}_${s.slave_id}`
                          const isEditing = editingSlave === key
                          return (
                            <div key={s.slave_id} style={styles.slaveRow}>
                              <div style={styles.slaveDot} />
                              {isEditing ? (
                                <>
                                  <input
                                    style={styles.slaveInput}
                                    value={slaveNames[key] || ""}
                                    onChange={(e) =>
                                      setSlaveNames((prev: any) => ({ ...prev, [key]: e.target.value }))
                                    }
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleSaveSlaveName(board.id, s.slave_id)}
                                    style={styles.slaveActionBtn}
                                  >
                                    <Check size={12} />
                                  </button>
                                  <button
                                    onClick={() => setEditingSlave(null)}
                                    style={{ ...styles.slaveActionBtn, ...styles.slaveCancelBtn }}
                                  >
                                    <X size={12} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span style={styles.slaveName}>
                                    {s.display_name || `Slave ${s.slave_id}`}
                                  </span>
                                  <button
                                    style={styles.slaveEditBtn}
                                    onClick={() => {
                                      setEditingSlave(key)
                                      setSlaveNames((prev: any) => ({ ...prev, [key]: s.display_name || "" }))
                                    }}
                                  >
                                    <Pencil size={11} />
                                  </button>
                                </>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={styles.boardActions}>
                    <span style={board.enabled ? styles.badgeEnabled : styles.badgeDisabled}>
                      {board.enabled ? "Active" : "Disabled"}
                    </span>
                    <button
                      onClick={() => handleRemoveBoard(board.id)}
                      style={styles.deleteBtn}
                      onMouseEnter={(e) => {
                        ;(e.currentTarget as HTMLButtonElement).style.background = "#fef2f2"
                        ;(e.currentTarget as HTMLButtonElement).style.borderColor = "#fca5a5"
                      }}
                      onMouseLeave={(e) => {
                        ;(e.currentTarget as HTMLButtonElement).style.background = "transparent"
                        ;(e.currentTarget as HTMLButtonElement).style.borderColor = "#f3f4f6"
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Styles ─────────────────────────────────────────────────────────────── */
const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: "28px 32px",
    minHeight: "100vh",
    background: "#f8fafb",
    fontFamily: "'DM Sans', 'Inter', sans-serif",
    maxWidth: 960,
  },
  header: { marginBottom: 24 },
  breadcrumb: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
    letterSpacing: "0.02em",
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#064e3b",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  userEmail: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
    fontWeight: 500,
  },
  statsRow: {
    display: "flex",
    gap: 16,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: "16px 22px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
    flex: "1 1 160px",
  },
  statIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    background: "#f0fdf9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 700,
    color: "#111827",
    lineHeight: 1,
  },
  card: {
    background: "white",
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
    marginBottom: 20,
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "20px 24px",
    borderBottom: "1px solid #f3f4f6",
  },
  cardHeaderIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "#f0fdf9",
    border: "1px solid #d1fae5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#064e3b",
    margin: 0,
  },
  cardSubtitle: {
    fontSize: 15,
    color: "#6b7280",
    marginTop: 3,
  },
  claimRow: {
    display: "flex",
    gap: 14,
    padding: "22px 26px",
    flexWrap: "wrap",
  },
  claimInput: {
    flex: "1 1 200px",
    padding: "13px 17px",
    fontSize: 16,
    border: "1.5px solid #e5e7eb",
    borderRadius: 11,
    outline: "none",
    color: "#111827",
    transition: "border-color 0.2s, box-shadow 0.2s",
    background: "#fafafa",
  },
  claimBtn: {
    padding: "13px 32px",
    fontSize: 16,
    fontWeight: 700,
    border: "none",
    borderRadius: 11,
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(16,185,129,0.35)",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  boardsList: {
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  boardRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 18,
    padding: "22px 20px",
    borderRadius: 14,
    border: "1.5px solid #f3f4f6",
    background: "white",
    transition: "background 0.15s, border-color 0.15s",
  },
  boardIndex: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "#f0fdf9",
    border: "1.5px solid #d1fae5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
    fontWeight: 700,
    color: "#059669",
    flexShrink: 0,
    marginTop: 2,
  },
  boardInfo: { flex: 1, minWidth: 0 },
  boardTopRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap",
  },
  boardUid: {
    fontSize: 19,
    fontWeight: 700,
    color: "#064e3b",
    fontFamily: "monospace",
  },
  boardSerial: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: 15,
    color: "#6b7280",
    fontFamily: "monospace",
    background: "#f3f4f6",
    borderRadius: 8,
    padding: "4px 12px",
  },
  slavesWrap: {
    marginTop: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  slaveRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  slaveDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#10b981",
    flexShrink: 0,
  },
  slaveName: {
    fontSize: 15,
    color: "#374151",
    fontWeight: 500,
  },
  slaveEditBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 26,
    height: 26,
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    background: "transparent",
    color: "#6b7280",
    cursor: "pointer",
    padding: 0,
  },
  slaveInput: {
    padding: "5px 10px",
    fontSize: 15,
    border: "1.5px solid #10b981",
    borderRadius: 7,
    outline: "none",
    color: "#111827",
    width: 180,
  },
  slaveActionBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    border: "none",
    borderRadius: 7,
    background: "#10b981",
    color: "white",
    cursor: "pointer",
    padding: 0,
  },
  slaveCancelBtn: { background: "#9ca3af" },
  boardActions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
    marginTop: 2,
  },
  badgeEnabled: {
    display: "inline-block",
    padding: "7px 18px",
    borderRadius: 20,
    background: "#ecfdf5",
    color: "#059669",
    fontWeight: 700,
    fontSize: 15,
    border: "1px solid #a7f3d0",
  },
  badgeDisabled: {
    display: "inline-block",
    padding: "7px 18px",
    borderRadius: 20,
    background: "#fef2f2",
    color: "#dc2626",
    fontWeight: 700,
    fontSize: 15,
    border: "1px solid #fca5a5",
  },
  deleteBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 42,
    height: 42,
    borderRadius: 10,
    border: "1.5px solid #f3f4f6",
    background: "transparent",
    color: "#ef4444",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 24px",
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 600, color: "#374151", marginBottom: 6 },
  emptyText: { fontSize: 15, color: "#6b7280" },
  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    gap: 16,
  },
  loadingSpinner: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "4px solid #d1fae5",
    borderTopColor: "#10b981",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: 500,
  },
}