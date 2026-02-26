"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MoreVertical } from "lucide-react"
import { loadAllBoards } from "@/lib/load-boards"

interface Floor {
  id: number
  name: string
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

export default function BoardsPage() {
  const router = useRouter()

  const [floors, setFloors] = useState<Floor[]>([])
  const [boards, setBoards] = useState<Board[]>([])
  const [activeMenu, setActiveMenu] = useState<number | null>(null)
  const [newFloor, setNewFloor] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load floors and boards on mount
  useEffect(() => {
    refreshData()
  }, [])

  async function refreshData() {
    setLoading(true)
    setError(null)
    try {
      // Load floors
      const floorsRes = await fetch(`${API}/floors`)
      if (!floorsRes.ok) throw new Error("Failed to load floors")
      const floorsData = await floorsRes.json()
      setFloors(floorsData)

      // Load boards using the optimized utility function
      const boardsData = await loadAllBoards()
      setBoards(boardsData)
    } catch (err) {
      console.error("Data loading error:", err)
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  function getBoardsByFloor(floorId: number) {
    return boards.filter((b) => Number(b.floor_id) === Number(floorId))
  }

  async function addFloor() {
    if (!newFloor.trim()) return

    try {
      const res = await fetch(`${API}/floors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFloor }),
      })

      if (!res.ok) throw new Error("Failed to add floor")

      setNewFloor("")
      await refreshData()
    } catch (err) {
      console.error("Add floor error:", err)
      alert("Failed to add floor")
    }
  }

  // ✅ YOUR PROVIDED FUNCTION ADDED — NOTHING ELSE CHANGED
  const deleteFloor = async (id: number) => {
    const token = localStorage.getItem("jwtToken")

    if (!token) {
      alert("Login again")
      return
    }

    try {
      const res = await fetch(
        `https://api.wattsense.in/api/floors/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await res.json()

      if (!res.ok) {
        alert(data?.error || "Delete failed")
        return
      }

      // Remove deleted floor from UI
      setFloors((prev) => prev.filter((f) => f.id !== id))

    } catch (err) {
      console.error("Floor delete error:", err)
      alert("Something went wrong")
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Boards</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <input
          value={newFloor}
          onChange={(e) => setNewFloor(e.target.value)}
          placeholder="Enter new floor name"
          className="border rounded-md px-4 py-2 w-full"
        />
        <button
          onClick={addFloor}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-gray-400"
        >
          {loading ? "Loading..." : "+ Add Floor"}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading boards and floors...
        </div>
      ) : floors.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No floors yet. Create one to get started.
        </div>
      ) : (
        <div className="space-y-4">

          {floors.map((floor) => {
            const floorBoards = getBoardsByFloor(floor.id)

            return (
              <div
                key={floor.id}
                className="bg-white rounded-xl shadow-sm border relative"
              >
                <div className="flex justify-between items-center p-4">
                  <div className="flex items-center gap-3">
                    <h2 className="font-semibold text-lg">{floor.name}</h2>

                    <span className="bg-gray-200 text-xs px-3 py-1 rounded-full">
                      {floorBoards.length} boards
                    </span>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() =>
                        setActiveMenu(
                          activeMenu === floor.id ? null : floor.id
                        )
                      }
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {activeMenu === floor.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-md z-10">
                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard/boards/${floor.id}`
                            )
                          }
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          View
                        </button>
                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard/boards/edit/${floor.id}`
                            )
                          }
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteFloor(floor.id)}
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Print
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}