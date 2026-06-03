"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, Pencil, Trash2, Search } from "lucide-react"

import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import { useFloorsContext } from "@/lib/floor-context"

interface Floor {
  id: number
  name: string
}

const API = process.env.NEXT_PUBLIC_API_URL!

export default function BoardsPage() {
  const router = useRouter()
  const { boards } = useFloorsContext()

  const [floors, setFloors] = useState<Floor[]>([])
  const [boardsByFloor, setBoardsByFloor] = useState<Record<number, any[]>>({})
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null)
  const [newFloor, setNewFloor] = useState("")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFloors()
  }, [])

  async function fetchFloors() {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem("jwtToken")
      if (!token) throw new Error("No token")

      const res = await fetch(`${API}/api/floors`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error("Failed to load floors")

      const data = await res.json()
      setFloors(data)
      data.forEach((floor: Floor) => fetchBoardsForFloor(floor.id))
    } catch (err) {
      console.error(err)
      setError("Failed to load floors")
    } finally {
      setLoading(false)
    }
  }

  async function fetchBoardsForFloor(floorId: number) {
    try {
      const token = localStorage.getItem("jwtToken")
      const res = await fetch(`${API}/api/boards/floor/${floorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setBoardsByFloor(prev => ({ ...prev, [floorId]: data }))
    } catch (err) {
      console.error("Failed to load boards for floor", floorId)
    }
  }

  async function addFloor() {
    if (!newFloor.trim()) return
    try {
      const token = localStorage.getItem("jwtToken")
      const res = await fetch(`${API}/api/floors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newFloor }),
      })
      if (!res.ok) throw new Error()
      setNewFloor("")
      fetchFloors()
    } catch {
      alert("Failed to add floor")
    }
  }

  async function deleteFloor(id: number) {
    const token = localStorage.getItem("jwtToken")
    try {
      const res = await fetch(`${API}/api/floors/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      setFloors((prev) => prev.filter((f) => f.id !== id))
    } catch {
      alert("Delete failed")
    }
  }

  const filteredFloors = floors.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen p-8" style={{ background: "#f0fafa" }}>
      <style>{`
        .floors-list {
          perspective: 1000px;
        }
        .floor-row {
          background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
          border-radius: 14px;
          border: 1px solid #0d9488;
          padding: 22px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: transform 0.22s ease, box-shadow 0.22s ease, background 0.22s ease, border-color 0.22s ease;
          box-shadow: 0 4px 0px #0a7870, 0 6px 16px rgba(13,148,136,0.25);
          min-height: 72px;
          transform-style: preserve-3d;
          position: relative;
        }
        .floor-row .floor-name {
          color: white;
          transition: color 0.22s;
        }
        .floor-row .floor-count {
          color: rgba(255,255,255,0.8);
          transition: color 0.22s;
        }
        .floor-row:hover {
          background: white;
          border: 2px solid #0d9488;
          box-shadow: 0 8px 0px #0a7870, 0 14px 32px rgba(13,148,136,0.28);
          transform: translateY(-4px) rotateX(2deg);
        }
        .floor-row:hover .floor-name {
          color: #0d9488;
        }
        .floor-row:hover .floor-count {
          color: #5eada8;
        }
        .floor-row:hover .action-btn {
          background: rgba(13,148,136,0.1);
          color: #0d9488;
        }
        .floor-row:hover .action-btn:hover {
          background: rgba(13,148,136,0.22);
        }
        .floor-row:hover .action-btn.delete:hover {
          background: rgba(239,68,68,0.12);
          color: #ef4444;
        }
        .floor-row:active {
          transform: translateY(0px) rotateX(0deg);
          box-shadow: 0 2px 0px #0a7870, 0 4px 10px rgba(13,148,136,0.2);
        }
        .floor-actions {
          display: flex;
          gap: 8px;
        }
        .action-btn {
          background: rgba(255,255,255,0.18);
          border: none;
          border-radius: 8px;
          padding: 8px;
          color: white;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .action-btn:hover {
          background: rgba(255,255,255,0.32);
        }
        .action-btn.delete:hover {
          background: rgba(239,68,68,0.55);
        }
        .search-input {
          flex: 1;
          border: 1px solid #b2dfdb;
          border-radius: 10px;
          padding: 10px 16px 10px 42px;
          font-size: 14px;
          outline: none;
          background: white;
          color: #1a3a38;
          transition: border-color 0.2s;
        }
        .search-input:focus {
          border-color: #0d9488;
          box-shadow: 0 0 0 3px rgba(13,148,136,0.12);
        }
        .add-btn {
          background: linear-gradient(135deg, #0d9488, #14b8a6);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(13,148,136,0.3);
          transition: all 0.18s;
        }
        .add-btn:hover {
          background: linear-gradient(135deg, #0f766e, #0d9488);
          box-shadow: 0 4px 16px rgba(13,148,136,0.4);
          transform: translateY(-1px);
        }
        .new-floor-input {
          border: 1px solid #b2dfdb;
          border-radius: 10px;
          padding: 10px 16px;
          font-size: 14px;
          outline: none;
          background: white;
          flex: 1;
          color: #1a3a38;
          transition: border-color 0.2s;
        }
        .new-floor-input:focus {
          border-color: #0d9488;
          box-shadow: 0 0 0 3px rgba(13,148,136,0.12);
        }
      `}</style>

      <h1 style={{ fontSize: 28, fontWeight: 700, color: "#0d9488", marginBottom: 24 }}>
        Boards
      </h1>

      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fca5a5",
          color: "#dc2626", padding: "12px 16px", borderRadius: 10, marginBottom: 20
        }}>
          {error}
        </div>
      )}

      {/* SEARCH + ADD FLOOR */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search
            size={16}
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}
          />
          <input
            className="search-input"
            style={{ width: "100%", boxSizing: "border-box" }}
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="add-btn" onClick={() => {
          const name = prompt("Enter new floor name")
          if (name) { setNewFloor(name); setTimeout(addFloor, 0) }
        }}>
          + Add Floor
        </button>
      </div>

      {/* FLOOR LIST */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af" }}>
          Loading floors...
        </div>
      ) : filteredFloors.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af" }}>
          {search ? "No floors match your search" : "No floors yet"}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }} className="floors-list">
          {filteredFloors.map((floor) => {
            const floorBoards = boardsByFloor[floor.id] || []

            return (
              <div
                key={floor.id}
                className="floor-row"
              >
                <div>
                  <div className="floor-name" style={{ fontWeight: 600, fontSize: 20, transition: "color 0.2s" }}>
                    {floor.name}
                  </div>
                  <div className="floor-count" style={{ fontSize: 18, marginTop: 3, transition: "color 0.2s" }}>
                    {floorBoards.length} boards
                  </div>
                </div>

                <div className="floor-actions">
                  <button
                    className="action-btn"
                    title="View"
                    onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/boards/${floor.id}`) }}
                  >
                    <Eye size={17} />
                  </button>
                  <button
                    className="action-btn"
                    title="Edit"
                    onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/boards/edit/${floor.id}`) }}
                  >
                    <Pencil size={17} />
                  </button>
                  <button
                    className="action-btn delete"
                    title="Delete"
                    onClick={(e) => { e.stopPropagation(); deleteFloor(floor.id) }}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}