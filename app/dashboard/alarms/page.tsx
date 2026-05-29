"use client"

import { useEffect, useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, Trash2, CheckSquare, Square } from "lucide-react"

const API = process.env.NEXT_PUBLIC_API_URL
const ALERTS_PER_PAGE = 10

export default function AlarmsPage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "critical" | "warning">("all")
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  const token =
    typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [filter])

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${API}/api/alerts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      const safeData = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : []
      const sorted = safeData.sort(
        (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
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
    return "warning"
  }

  const filteredAlerts = useMemo(() => {
    if (filter === "all") return alerts
    return alerts.filter((a) => getSeverity(a) === filter)
  }, [alerts, filter])

  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / ALERTS_PER_PAGE))
  const paginatedAlerts = filteredAlerts.slice(
    (currentPage - 1) * ALERTS_PER_PAGE,
    currentPage * ALERTS_PER_PAGE
  )

  const stats = useMemo(() => {
    let critical = 0, warning = 0
    alerts.forEach((a) => {
      if (getSeverity(a) === "critical") critical++
      else warning++
    })
    return { total: alerts.length, critical, warning }
  }, [alerts])

  const toggleSelect = (alert: any) => {
    const exists = selected.find(
      (s) =>
        s.board_id === alert.board_id &&
        s.slave_id === alert.slave_id &&
        s.parameter === alert.parameter &&
        s.timestamp === alert.timestamp
    )
    if (exists) setSelected(selected.filter((s) => s !== exists))
    else setSelected([...selected, alert])
  }

  const isSelected = (alert: any) =>
    !!selected.find(
      (s) =>
        s.board_id === alert.board_id &&
        s.slave_id === alert.slave_id &&
        s.parameter === alert.parameter &&
        s.timestamp === alert.timestamp
    )

  const selectAll = () => setSelected(filteredAlerts)
  const selectByType = (type: "critical" | "warning") =>
    setSelected(alerts.filter((a) => getSeverity(a) === type))

  const handleDelete = async () => {
    if (selected.length === 0) return
    const payload = selected.map((a) => ({
      board_id: a.board_id,
      slave_id: a.slave_id,
      parameter: a.parameter,
      timestamp: a.timestamp,
    }))
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
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ alerts: payload }),
    })
    setSelected([])
    setSelectMode(false)
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
      <p style={styles.loadingText}>Loading alerts...</p>
    </div>
  )

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <p style={styles.breadcrumb}>Dashboard / Alarms</p>
        <h1 style={styles.title}>🚨 Alerts Dashboard</h1>
        <p style={styles.subtitle}>Real-time monitoring · Auto-refreshes every 10s</p>
      </div>

      {/* Stat Cards — colors unchanged */}
      <div style={styles.statsRow}>
        <div style={{ ...styles.statCard, background: "#1e293b" }}>
          <p style={styles.statLabel}>Total Alerts</p>
          <p style={styles.statValue}>{stats.total}</p>
        </div>
        <div style={{ ...styles.statCard, background: "#dc2626" }}>
          <p style={styles.statLabel}>Critical</p>
          <p style={styles.statValue}>{stats.critical}</p>
        </div>
        <div style={{ ...styles.statCard, background: "#eab308" }}>
          <p style={styles.statLabel}>Warning</p>
          <p style={styles.statValue}>{stats.warning}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.filterTabs}>
          {(["all", "critical", "warning"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...styles.filterBtn,
                ...(filter === f ? styles.filterBtnActive : {}),
                ...(filter === f && f === "critical" ? { background: "#dc2626", borderColor: "#dc2626" } : {}),
                ...(filter === f && f === "warning" ? { background: "#eab308", borderColor: "#eab308" } : {}),
              }}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={styles.toolbarRight}>
          {selectMode && (
            <>
              <button onClick={selectAll} style={styles.linkBtn}>Select All</button>
              <button onClick={() => selectByType("critical")} style={{ ...styles.linkBtn, color: "#dc2626" }}>Critical</button>
              <button onClick={() => selectByType("warning")} style={{ ...styles.linkBtn, color: "#ca8a04" }}>Warning</button>
            </>
          )}
          {selectMode && selected.length > 0 && (
            <button onClick={handleDelete} style={styles.deleteBtn}>
              <Trash2 size={15} />
              Delete ({selected.length})
            </button>
          )}
          <button
            onClick={() => { setSelectMode(!selectMode); setSelected([]) }}
            style={selectMode ? styles.cancelBtn : styles.selectBtn}
          >
            {selectMode ? "Cancel" : "Select"}
          </button>
        </div>
      </div>

      {/* Count bar */}
      <div style={styles.countBar}>
        <span style={styles.countText}>
          Showing {paginatedAlerts.length} of {filteredAlerts.length} alerts
          &nbsp;·&nbsp; Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* Alert List */}
      {filteredAlerts.length === 0 ? (
        <div style={styles.emptyCard}>
          <span style={{ fontSize: 40 }}>✅</span>
          <p style={styles.emptyTitle}>No alerts found</p>
          <p style={styles.emptyText}>Everything looks good!</p>
        </div>
      ) : (
        <div style={styles.alertsList}>
          {paginatedAlerts.map((a, i) => {
            const severity = getSeverity(a)
            const checked = isSelected(a)
            const isCritical = severity === "critical"
            const accentColor = isCritical ? "#dc2626" : "#d97706"
            const accentBg = isCritical ? "#fef2f2" : "#fffbeb"
            const accentBorder = isCritical ? "#fca5a5" : "#fcd34d"

            return (
              <div
                key={i}
                style={{
                  ...styles.alertCard,
                  borderLeftColor: accentColor,
                  background: checked ? accentBg : "white",
                  boxShadow: checked
                    ? `0 4px 16px ${isCritical ? "rgba(220,38,38,0.12)" : "rgba(234,179,8,0.12)"}`
                    : "0 2px 10px rgba(13,148,136,0.08)",
                }}
                onClick={() => selectMode && toggleSelect(a)}
              >
                {selectMode && (
                  <div style={styles.checkboxWrap}>
                    {checked
                      ? <CheckSquare size={22} color={accentColor} />
                      : <Square size={22} color="#9ca3af" />}
                  </div>
                )}

                <div style={styles.alertContent}>

                  {/* Top row */}
                  <div style={styles.alertTopRow}>
                    <div style={styles.alertTitleGroup}>
                      <span style={{
                        ...styles.severityIcon,
                        background: accentBg,
                        border: `1.5px solid ${accentBorder}`,
                      }}>
                        {isCritical ? "🚨" : "⚠️"}
                      </span>
                      <span style={{ ...styles.alertTypeLabel, color: accentColor }}>
                        {isCritical ? "Critical Alert" : "Warning Alert"}
                      </span>
                      <span style={{
                        ...styles.severityBadge,
                        background: accentBg,
                        color: accentColor,
                        border: `1.5px solid ${accentBorder}`,
                      }}>
                        {severity.toUpperCase()}
                      </span>
                    </div>
                    <span style={styles.timestamp}>
                      {new Date(a.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {/* Divider */}
                  <div style={styles.divider} />

                  {/* Info grid */}
                  <div style={styles.alertGrid}>
                    <div style={styles.alertField}>
                      <span style={styles.fieldLabel}>Board</span>
                      <span style={styles.fieldValue}>{a.board_uid}</span>
                    </div>
                    <div style={styles.alertField}>
                      <span style={styles.fieldLabel}>Slave</span>
                      <span style={styles.fieldValue}>{a.slave_name}</span>
                    </div>
                    <div style={styles.alertField}>
                      <span style={styles.fieldLabel}>Parameter</span>
                      <span style={{ ...styles.fieldValue, color: accentColor }}>{a.parameter}</span>
                    </div>
                    <div style={styles.alertField}>
                      <span style={styles.fieldLabel}>Status</span>
                      <span style={styles.statusPill}>Zero value detected</span>
                    </div>
                  </div>

                </div>
              </div>
            )
          })}
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
            <ChevronLeft size={16} /> Previous
          </button>

          <div style={styles.pageNumbers}>
            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={`e-${i}`} style={styles.ellipsis}>…</span>
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
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Styles ─────────────────────────────────────────────────────────────── */
const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: "28px 32px",
    minHeight: "100vh",
    background: "#f0fafa",
    fontFamily: "'DM Sans', 'Inter', sans-serif",
  },

  header: { marginBottom: 28 },
  breadcrumb: { fontSize: 13, color: "#0d9488", marginBottom: 4, letterSpacing: "0.03em", fontWeight: 500 },
  title: { fontSize: 30, fontWeight: 800, color: "#0d4f4a", margin: 0, letterSpacing: "-0.5px" },
  subtitle: { fontSize: 14, color: "#5eada8", marginTop: 5, fontWeight: 500 },

  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginBottom: 28,
  },
  statCard: {
    borderRadius: 16,
    padding: "24px 28px",
    color: "white",
    boxShadow: "0 4px 0px rgba(0,0,0,0.2), 0 8px 20px rgba(0,0,0,0.12)",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: 800,
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    opacity: 0.9,
    marginBottom: 10,
  },
  statValue: { fontSize: 42, fontWeight: 800, lineHeight: 1 },

  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap" as const,
    gap: 12,
    background: "white",
    border: "1.5px solid #b2dfdb",
    borderRadius: 14,
    padding: "14px 20px",
    marginBottom: 14,
    boxShadow: "0 2px 10px rgba(13,148,136,0.08)",
  },
  filterTabs: { display: "flex", gap: 8 },
  filterBtn: {
    padding: "8px 20px",
    fontSize: 13,
    fontWeight: 700,
    border: "1.5px solid #b2dfdb",
    borderRadius: 10,
    background: "white",
    color: "#0d9488",
    cursor: "pointer",
    letterSpacing: "0.05em",
    transition: "all 0.15s",
  },
  filterBtnActive: {
    background: "#0d9488",
    color: "white",
    borderColor: "#0d9488",
  },
  toolbarRight: { display: "flex", alignItems: "center", gap: 10 },
  linkBtn: {
    fontSize: 14,
    fontWeight: 600,
    background: "none",
    border: "none",
    color: "#0d9488",
    cursor: "pointer",
    textDecoration: "underline",
    padding: "0 4px",
  },
  selectBtn: {
    padding: "9px 22px",
    fontSize: 14,
    fontWeight: 700,
    border: "none",
    borderRadius: 10,
    background: "linear-gradient(135deg, #0d9488, #14b8a6)",
    color: "white",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(13,148,136,0.3)",
  },
  cancelBtn: {
    padding: "9px 22px",
    fontSize: 14,
    fontWeight: 700,
    border: "1.5px solid #b2dfdb",
    borderRadius: 10,
    background: "white",
    color: "#0d9488",
    cursor: "pointer",
  },
  deleteBtn: {
    display: "inline-flex" as const,
    alignItems: "center",
    gap: 6,
    padding: "9px 18px",
    fontSize: 14,
    fontWeight: 700,
    border: "none",
    borderRadius: 10,
    background: "#dc2626",
    color: "white",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(220,38,38,0.3)",
  },

  countBar: { marginBottom: 14, paddingLeft: 2 },
  countText: { fontSize: 13, color: "#5eada8", fontWeight: 600 },

  alertsList: { display: "flex", flexDirection: "column" as const, gap: 12 },

  alertCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    background: "white",
    borderRadius: 14,
    border: "1.5px solid #e0f2f1",
    borderLeft: "5px solid",
    padding: "20px 24px",
    cursor: "default",
    transition: "box-shadow 0.15s, background 0.15s",
  },
  checkboxWrap: {
    flexShrink: 0,
    marginTop: 3,
    cursor: "pointer",
  },
  alertContent: { flex: 1, minWidth: 0 },

  alertTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap" as const,
    gap: 10,
    marginBottom: 14,
  },
  alertTitleGroup: { display: "flex", alignItems: "center", gap: 10 },
  severityIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: 10,
    fontSize: 18,
    flexShrink: 0,
  },
  alertTypeLabel: {
    fontSize: 17,
    fontWeight: 800,
    letterSpacing: "-0.2px",
  },
  severityBadge: {
    display: "inline-block",
    padding: "3px 12px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.07em",
  },
  timestamp: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: 600,
    background: "#f1f5f9",
    padding: "4px 12px",
    borderRadius: 8,
  },

  divider: {
    height: 1,
    background: "linear-gradient(to right, #e0f2f1, transparent)",
    marginBottom: 14,
  },

  alertGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px 32px",
  },
  alertField: { display: "flex", flexDirection: "column" as const, gap: 3 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: 800,
    color: "#0d9488",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: 700,
    color: "#0d4f4a",
  },
  statusPill: {
    display: "inline-block",
    fontSize: 13,
    fontWeight: 600,
    color: "#64748b",
    background: "#f1f5f9",
    padding: "3px 10px",
    borderRadius: 6,
    width: "fit-content",
  },

  emptyCard: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "72px 24px",
    background: "white",
    borderRadius: 16,
    border: "1.5px solid #b2dfdb",
    gap: 8,
  },
  emptyTitle: { fontSize: 20, fontWeight: 700, color: "#0d4f4a" },
  emptyText: { fontSize: 15, color: "#5eada8" },

  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "28px 0 8px",
    flexWrap: "wrap" as const,
  },
  pageBtn: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "9px 18px",
    fontSize: 14,
    fontWeight: 600,
    border: "1.5px solid #b2dfdb",
    borderRadius: 10,
    background: "white",
    color: "#0d9488",
    cursor: "pointer",
  },
  pageBtnDisabled: { opacity: 0.35, cursor: "not-allowed" },
  pageNumbers: { display: "flex", gap: 4, alignItems: "center" },
  pageNum: {
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
    fontWeight: 600,
    border: "1.5px solid #b2dfdb",
    borderRadius: 10,
    background: "white",
    color: "#0d9488",
    cursor: "pointer",
  },
  pageNumActive: {
    background: "linear-gradient(135deg, #0d9488, #14b8a6)",
    color: "white",
    border: "1.5px solid #0d9488",
    fontWeight: 800,
    boxShadow: "0 2px 8px rgba(13,148,136,0.3)",
  },
  ellipsis: { fontSize: 16, color: "#9ca3af", padding: "0 4px" },

  loadingWrap: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    gap: 16,
  },
  loadingSpinner: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "4px solid #b2dfdb",
    borderTopColor: "#0d9488",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: { fontSize: 16, color: "#5eada8", fontWeight: 600 },
}