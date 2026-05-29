"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Floor {
  id: number
  name: string
  remarks?: string
}

interface Board {
  id: number
  board_uid: string
  serial_number: string
  floor_id: number | null
  email: string | null
  enabled: boolean
}

const API = "https://api.wattsense.in/api"
const BOARDS_PER_PAGE = 10

export default function ViewFloorPage() {
  const router = useRouter()
  const params = useParams()
  const floorId = Number(params?.floorId)

  const [floor, setFloor] = useState<Floor | null>(null)
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(boards.length / BOARDS_PER_PAGE))
  const paginatedBoards = boards.slice(
    (currentPage - 1) * BOARDS_PER_PAGE,
    currentPage * BOARDS_PER_PAGE
  )

  useEffect(() => {
    if (!floorId) return

    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        const floorRes = await fetch(`${API}/floors`)
        if (!floorRes.ok) throw new Error("Failed to load floors")
        const floorsData: Floor[] = await floorRes.json()
        setFloor(floorsData.find((f) => Number(f.id) === Number(floorId)) || null)

        const token =
          typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null

        const boardRes = await fetch(`${API}/boards`, {
          headers: token
            ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
            : { "Content-Type": "application/json" },
        })
        if (!boardRes.ok) throw new Error("Failed to load boards")
        const boardsData: Board[] = await boardRes.json()

        const filtered = boardsData
          .filter((b) => String(b.floor_id) === String(floorId))
          .sort((a, b) => a.id - b.id)

        setBoards(filtered)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [floorId])

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
      <p style={styles.loadingText}>Loading floor and boards...</p>
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
          <p style={styles.breadcrumb}>Admin / Floors / View</p>
          <h1 style={styles.title}>{floor?.name || "Floor Details"}</h1>
          <p style={styles.subtitle}>
            {boards.length} board{boards.length !== 1 ? "s" : ""} assigned to this floor
          </p>
        </div>
        <button onClick={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={18} />
          Back
        </button>
      </div>

      {/* Info Card */}
      <div style={styles.infoCard}>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <p style={styles.infoLabel}>Floor Name</p>
            <p style={styles.infoValue}>{floor?.name || "—"}</p>
          </div>
          <div style={styles.infoItem}>
            <p style={styles.infoLabel}>Remarks</p>
            <p style={styles.infoValue}>{floor?.remarks || "—"}</p>
          </div>
          <div style={styles.infoItem}>
            <p style={styles.infoLabel}>Total Boards</p>
            <p style={{ ...styles.infoValue, ...styles.infoValueGreen }}>{boards.length}</p>
          </div>
          <div style={styles.infoItem}>
            <p style={styles.infoLabel}>Active Boards</p>
            <p style={{ ...styles.infoValue, ...styles.infoValueGreen }}>
              {boards.filter((b) => b.enabled).length}
            </p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div style={styles.card}>
        <div style={styles.toolbar}>
          <p style={styles.toolbarLabel}>
            {boards.length === 0
              ? "No boards assigned yet"
              : `Page ${currentPage} of ${totalPages} · ${boards.length} total boards`}
          </p>
        </div>

        {boards.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📋</div>
            <p style={styles.emptyTitle}>No boards assigned yet</p>
            <p style={styles.emptyText}>No boards have been assigned to this floor.</p>
          </div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  {["#", "Board ID", "Serial Number", "Email Address", "Status"].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedBoards.map((board, index) => {
                  const globalIndex = (currentPage - 1) * BOARDS_PER_PAGE + index + 1
                  return (
                    <tr
                      key={board.id}
                      style={styles.tr}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.background = "#f0fdf9"
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.background = "white"
                      }}
                    >
                      <td style={{ ...styles.td, ...styles.tdNum }}>{globalIndex}</td>
                      <td style={styles.td}>
                        <span style={styles.uidBadge}>{board.board_uid || "—"}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.serialText}>{board.serial_number || "—"}</span>
                      </td>
                      <td style={styles.td}>{board.email || "—"}</td>
                      <td style={styles.td}>
                        <span style={board.enabled ? styles.badgeEnabled : styles.badgeDisabled}>
                          {board.enabled ? "Enabled" : "Disabled"}
                        </span>
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

/* ── Styles ─────────────────────────────────────────────────────────────── */
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
    marginBottom: 24,
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
  infoCard: {
    background: "white",
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
    padding: "24px 28px",
    marginBottom: 20,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 24,
  },
  infoItem: {},
  infoLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 600,
    color: "#111827",
  },
  infoValueGreen: {
    color: "#059669",
    fontSize: 22,
  },
  card: {
    background: "white",
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  toolbar: {
    padding: "18px 24px",
    borderBottom: "1px solid #f3f4f6",
  },
  toolbarLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: 500,
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 640,
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
  serialText: {
    fontSize: 18,
    color: "#6b7280",
    fontFamily: "monospace",
  },
  badgeEnabled: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: 20,
    background: "#ecfdf5",
    color: "#059669",
    fontWeight: 700,
    fontSize: 16,
    border: "1px solid #a7f3d0",
  },
  badgeDisabled: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: 20,
    background: "#fef2f2",
    color: "#dc2626",
    fontWeight: 700,
    fontSize: 16,
    border: "1px solid #fca5a5",
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
  errorIcon: { fontSize: 40, display: "block", marginBottom: 12 },
  errorText: { fontSize: 16, color: "#b91c1c", marginBottom: 20 },
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
