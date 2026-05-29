"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Trash2, ChevronLeft, ChevronRight, Plus, Save } from "lucide-react"
import { useFloorsContext } from "@/lib/floor-context"

interface Board {
  id: number | string
  board_uid: string
  serial_number: string
  email: string | null
  enabled: boolean
  floor_id: number | null
  isNew?: boolean
}

const BOARDS_PER_PAGE = 10

export default function EditFloorPage() {
  const router = useRouter()
  const params = useParams()
  const floorId = Number(params?.floorId)

  const { boards: contextBoards } = useFloorsContext()

  const [boards, setBoards] = useState<Board[]>([])
  const boardsRef = useRef<Board[]>([])
  const [addCount, setAddCount] = useState(1)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(boards.length / BOARDS_PER_PAGE))
  const paginatedBoards = boards.slice(
    (currentPage - 1) * BOARDS_PER_PAGE,
    currentPage * BOARDS_PER_PAGE
  )

  useEffect(() => {
    boardsRef.current = boards
  }, [boards])

  useEffect(() => {
    if (isNaN(floorId)) return

    async function fetchBoards() {
      try {
        setLoading(true)
        const token = localStorage.getItem("jwtToken")
        if (!token || token === "null") {
          setError("Not authenticated")
          return
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.wattsense.in"
        const res = await fetch(`${apiUrl}/api/boards/floor/${floorId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error("Failed to load boards")
        const data = await res.json()
        setBoards(data)
      } catch (err) {
        console.error(err)
        setError("Failed to load boards")
      } finally {
        setLoading(false)
      }
    }

    fetchBoards()
  }, [floorId])

  function addBoards() {
    const newBoards: Board[] = []
    for (let i = 0; i < addCount; i++) {
      newBoards.push({
        id: `temp-${Date.now()}-${i}`,
        board_uid: "",
        serial_number: "",
        email: "",
        enabled: true,
        floor_id: floorId,
        isNew: true,
      })
    }
    setBoards((prev) => [...prev, ...newBoards])
    setAddCount(1)
    // Jump to last page to show newly added boards
    const newTotal = Math.ceil((boards.length + newBoards.length) / BOARDS_PER_PAGE)
    setCurrentPage(newTotal)
  }

  function updateBoardField(id: number | string, field: keyof Board, value: any) {
    setBoards((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    )
  }

  const deleteBoard = async (id: number | string) => {
    const token = localStorage.getItem("jwtToken")
    if (!token) { alert("Please login again"); return }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.wattsense.in"
    const res = await fetch(`${apiUrl}/api/boards/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = await res.json()
    if (!res.ok) { alert(data.error || "Delete failed"); return }

    const newBoards = boards.filter((b) => b.id !== id)
    setBoards(newBoards)
    // Adjust page if current page becomes empty
    const newTotal = Math.max(1, Math.ceil(newBoards.length / BOARDS_PER_PAGE))
    if (currentPage > newTotal) setCurrentPage(newTotal)
  }

  async function saveChanges() {
    try {
      setSaving(true)
      const latestBoards = boardsRef.current
      const token = typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.wattsense.in"

      for (const board of latestBoards) {
        const headers: Record<string, string> = { "Content-Type": "application/json" }
        if (token) headers["Authorization"] = `Bearer ${token}`

        if (board.isNew) {
          const res = await fetch(`${apiUrl}/api/boards/register`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              email: (board.email || "").trim().toLowerCase(),
              floor_id: floorId,
            }),
          })
          if (!res.ok) { alert("Board create failed"); setSaving(false); return }
        } else {
          const res = await fetch(`${apiUrl}/api/boards/${board.id}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({
              email: (board.email || "").trim().toLowerCase(),
              enabled: board.enabled,
              floor_id: board.floor_id ?? floorId,
            }),
          })
          if (!res.ok) { alert("Board update failed"); setSaving(false); return }
        }
      }

      alert("Saved successfully ✅")
    } catch (err) {
      console.error("Save error:", err)
      alert("Error saving boards")
    } finally {
      setSaving(false)
    }
  }

  const getPageNumbers = () => {
    const pages: (number | "...")[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push("...")
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i)
      }
      if (currentPage < totalPages - 2) pages.push("...")
      pages.push(totalPages)
    }
    return pages
  }

  if (loading) return (
    <div style={styles.loadingWrap}>
      <div style={styles.loadingSpinner} />
      <p style={styles.loadingText}>Loading boards...</p>
    </div>
  )

  if (error) return (
    <div style={styles.errorWrap}>
      <div style={styles.errorBox}>
        <span style={styles.errorIcon}>⚠</span>
        <p style={styles.errorText}>{error}</p>
        <button style={styles.retryBtn} onClick={() => router.back()}>Go Back</button>
      </div>
    </div>
  )

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <p style={styles.breadcrumb}>Admin / Floors / Edit</p>
          <h1 style={styles.title}>Edit Board Data</h1>
          <p style={styles.subtitle}>
            {boards.length} board{boards.length !== 1 ? "s" : ""} assigned to this floor
          </p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={18} />
            Back
          </button>
          <button onClick={saveChanges} disabled={saving} style={styles.saveBtn}>
            <Save size={18} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Card */}
      <div style={styles.card}>
        {/* Add boards toolbar */}
        <div style={styles.toolbar}>
          <p style={styles.toolbarLabel}>
            Page {currentPage} of {totalPages} &nbsp;·&nbsp; {boards.length} total boards
          </p>
          <div style={styles.addRow}>
            <input
              type="number"
              min="1"
              value={addCount}
              onChange={(e) => setAddCount(Number(e.target.value))}
              style={styles.countInput}
            />
            <button onClick={addBoards} style={styles.addBtn}>
              <Plus size={16} />
              Add Board{addCount > 1 ? `s (${addCount})` : ""}
            </button>
          </div>
        </div>

        {/* Table */}
        {boards.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📋</div>
            <p style={styles.emptyTitle}>No boards assigned yet</p>
            <p style={styles.emptyText}>Use the Add Board button above to get started.</p>
          </div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  {["#", "Board ID", "Serial Number", "Email Address", "Status", "Action"].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedBoards.map((board, index) => {
                  const globalIndex = (currentPage - 1) * BOARDS_PER_PAGE + index + 1
                  return (
                    <tr key={board.id} style={styles.tr}
                      onMouseEnter={(e) => {
                        ;(e.currentTarget as HTMLTableRowElement).style.background = "#f0fdf9"
                      }}
                      onMouseLeave={(e) => {
                        ;(e.currentTarget as HTMLTableRowElement).style.background = "white"
                      }}
                    >
                      <td style={{ ...styles.td, ...styles.tdNum }}>{globalIndex}</td>
                      <td style={styles.td}>
                        <span style={board.board_uid ? styles.uidBadge : styles.newBadge}>
                          {board.board_uid || "New"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.serialText}>
                          {board.serial_number || "—"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <input
                          value={board.email ?? ""}
                          onChange={(e) => {
                            const value = e.target.value
                            setBoards((prev) =>
                              prev.map((b) =>
                                b.id === board.id ? { ...b, email: value } : b
                              )
                            )
                          }}
                          placeholder="user@example.com"
                          style={styles.emailInput}
                          onFocus={(e) => {
                            e.target.style.borderColor = "#10b981"
                            e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.15)"
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "#e5e7eb"
                            e.target.style.boxShadow = "none"
                          }}
                        />
                      </td>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        <label style={styles.toggle}>
                          <input
                            type="checkbox"
                            checked={board.enabled}
                            onChange={(e) => updateBoardField(board.id, "enabled", e.target.checked)}
                            style={{ display: "none" }}
                          />
                          <div style={{
                            ...styles.toggleTrack,
                            background: board.enabled ? "#10b981" : "#d1d5db",
                          }}>
                            <div style={{
                              ...styles.toggleThumb,
                              transform: board.enabled ? "translateX(20px)" : "translateX(2px)",
                            }} />
                          </div>
                          <span style={{ ...styles.toggleLabel, color: board.enabled ? "#059669" : "#9ca3af" }}>
                            {board.enabled ? "Active" : "Off"}
                          </span>
                        </label>
                      </td>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        <button
                          onClick={() => deleteBoard(board.id)}
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
                          <Trash2 size={17} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ ...styles.pageBtn, ...(currentPage === 1 ? styles.pageBtnDisabled : {}) }}
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <div style={styles.pageNumbers}>
              {getPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} style={styles.ellipsis}>…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
                    style={{
                      ...styles.pageNum,
                      ...(currentPage === p ? styles.pageNumActive : {}),
                    }}
                  >
                    {p}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{ ...styles.pageBtn, ...(currentPage === totalPages ? styles.pageBtnDisabled : {}) }}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Inline styles ─────────────────────────────────────────────────────── */
const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: "28px 32px",
    minHeight: "100vh",
    background: "#f8fafb",
    fontFamily: "'DM Sans', 'Inter', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 28,
  },
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
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    marginTop: 4,
  },
  headerActions: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 20px",
    fontSize: 15,
    fontWeight: 500,
    border: "1.5px solid #d1d5db",
    borderRadius: 10,
    background: "white",
    color: "#374151",
    cursor: "pointer",
  },
  saveBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 22px",
    fontSize: 15,
    fontWeight: 600,
    border: "none",
    borderRadius: 10,
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(16,185,129,0.35)",
  },
  card: {
    background: "white",
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 24px",
    borderBottom: "1px solid #f3f4f6",
    flexWrap: "wrap",
    gap: 12,
  },
  toolbarLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: 500,
  },
  addRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  countInput: {
    width: 68,
    padding: "8px 12px",
    fontSize: 15,
    border: "1.5px solid #e5e7eb",
    borderRadius: 8,
    outline: "none",
    textAlign: "center",
    color: "#111827",
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "9px 18px",
    fontSize: 14,
    fontWeight: 600,
    border: "1.5px solid #10b981",
    borderRadius: 8,
    background: "#f0fdf4",
    color: "#059669",
    cursor: "pointer",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 720,
  },
  theadRow: {
    background: "#f0fdf9",
  },
  th: {
    padding: "14px 18px",
    fontSize: 18,
    fontWeight: 700,
    color: "#047857",
    textAlign: "left",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    borderBottom: "2px solid #d1fae5",
  },
  tr: {
    background: "white",
    transition: "background 0.15s",
    cursor: "default",
  },
  td: {
    padding: "14px 18px",
    fontSize: 18,
    color: "#374151",
    borderBottom: "1px solid #f3f4f6",
    verticalAlign: "middle",
  },
  tdNum: {
    fontWeight: 700,
    color: "#9ca3af",
    fontSize: 18,
    width: 48,
  },
  uidBadge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 20,
    background: "#ecfdf5",
    color: "#059669",
    fontWeight: 600,
    fontSize: 18,
    border: "1px solid #a7f3d0",
    fontFamily: "monospace",
  },
  newBadge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 20,
    background: "#fef3c7",
    color: "#92400e",
    fontWeight: 600,
    fontSize: 18,
    border: "1px solid #fcd34d",
  },
  serialText: {
    fontSize: 18,
    color: "#6b7280",
    fontFamily: "monospace",
  },
  emailInput: {
    width: "100%",
    padding: "9px 13px",
    fontSize: 18,
    border: "1.5px solid #e5e7eb",
    borderRadius: 8,
    outline: "none",
    color: "#111827",
    transition: "border-color 0.2s, box-shadow 0.2s",
    minWidth: 200,
  },
  toggle: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 999,
    transition: "background 0.2s",
    position: "relative",
  },
  toggleThumb: {
    position: "absolute",
    top: 2,
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "white",
    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
    transition: "transform 0.2s",
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: 600,
  },
  deleteBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: 8,
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
    color: "#9ca3af",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 15,
    color: "#6b7280",
  },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "20px 24px",
    borderTop: "1px solid #f3f4f6",
    flexWrap: "wrap",
  },
  pageBtn: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "8px 16px",
    fontSize: 14,
    fontWeight: 500,
    border: "1.5px solid #e5e7eb",
    borderRadius: 8,
    background: "white",
    color: "#374151",
    cursor: "pointer",
  },
  pageBtnDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
  },
  pageNumbers: {
    display: "flex",
    gap: 4,
    alignItems: "center",
  },
  pageNum: {
    width: 38,
    height: 38,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
    fontWeight: 500,
    border: "1.5px solid #e5e7eb",
    borderRadius: 8,
    background: "white",
    color: "#374151",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  pageNumActive: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    border: "1.5px solid #10b981",
    boxShadow: "0 3px 10px rgba(16,185,129,0.3)",
    fontWeight: 700,
  },
  ellipsis: {
    fontSize: 16,
    color: "#9ca3af",
    padding: "0 4px",
  },
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
  errorWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
  },
  errorBox: {
    textAlign: "center",
    padding: 40,
    background: "white",
    borderRadius: 16,
    border: "1px solid #fecaca",
  },
  errorIcon: {
    fontSize: 40,
    display: "block",
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: "#b91c1c",
    marginBottom: 20,
  },
  retryBtn: {
    padding: "10px 22px",
    fontSize: 15,
    fontWeight: 600,
    border: "none",
    borderRadius: 10,
    background: "#10b981",
    color: "white",
    cursor: "pointer",
  },
}
