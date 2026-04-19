"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MoreVertical } from "lucide-react"

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
  const [activeMenu, setActiveMenu] = useState<number | null>(null)
  const [newFloor, setNewFloor] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFloors()
  }, [])

  // ✅ FETCH FLOORS
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

      // 🔥 FETCH BOARDS FOR EACH FLOOR
      data.forEach((floor: Floor) => {
        fetchBoardsForFloor(floor.id)
      })

    } catch (err) {
      console.error(err)
      setError("Failed to load floors")
    } finally {
      setLoading(false)
    }
  }

  // 🔥 NEW FUNCTION
  async function fetchBoardsForFloor(floorId: number) {
    try {
      const token = localStorage.getItem("jwtToken")

      const res = await fetch(`${API}/api/boards/floor/${floorId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error()

      const data = await res.json()

      setBoardsByFloor(prev => ({
        ...prev,
        [floorId]: data
      }))

    } catch (err) {
      console.error("Failed to load boards for floor", floorId)
    }
  }

  // ✅ EXPORT
  async function handlePrint(floorId: number, floorName: string) {
    const token = localStorage.getItem("jwtToken")
    const floorBoards = boardsByFloor[floorId] || []

    const uniqueEmails = [
      ...new Set(
        floorBoards
          .map((b) => b.email)
          .filter((email): email is string => !!email)
      ),
    ]

    if (uniqueEmails.length === 0) {
      alert("No data available")
      return
    }

    try {
      let allData: any[] = []

      for (const email of uniqueEmails) {
        const res = await fetch(
          `${API}/api/boards/export/user-data/${email}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!res.ok) continue

        const data = await res.json()
        allData = [...allData, ...data]
      }

      if (!allData.length) {
        alert("No data available")
        return
      }

      const ws = XLSX.utils.json_to_sheet(allData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, floorName)

      const buffer = XLSX.write(wb, {
        bookType: "xlsx",
        type: "array",
      })

      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      saveAs(blob, `${floorName}_Boards.xlsx`)

    } catch (err) {
      console.error(err)
      alert("Export failed")
    }
  }

  // ✅ ADD FLOOR
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

  // ✅ DELETE FLOOR
  async function deleteFloor(id: number) {
    const token = localStorage.getItem("jwtToken")

    try {
      const res = await fetch(`${API}/api/floors/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error()

      setFloors((prev) => prev.filter((f) => f.id !== id))

    } catch {
      alert("Delete failed")
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

      {/* ADD FLOOR */}
      <div className="flex gap-3">
        <input
          value={newFloor}
          onChange={(e) => setNewFloor(e.target.value)}
          placeholder="Enter new floor name"
          className="border rounded-md px-4 py-2 w-full"
        />
        <button
          onClick={addFloor}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          + Add Floor
        </button>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading floors...
        </div>
      ) : floors.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No floors yet
        </div>
      ) : (
        <div className="space-y-4">
          {floors.map((floor) => {
            const floorBoards = boardsByFloor[floor.id] || []

            return (
              <div
                key={floor.id}
                className="bg-white rounded-xl shadow border p-4 relative"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold text-lg">
                      {floor.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {floorBoards.length} boards
                    </p>
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
                          onClick={() => {
                            router.push(`/dashboard/boards/${floor.id}`)
                            setActiveMenu(null)
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          View
                        </button>

                        <button
                          onClick={() => {
                            router.push(`/dashboard/boards/edit/${floor.id}`)
                            setActiveMenu(null)
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => {
                            deleteFloor(floor.id)
                            setActiveMenu(null)
                          }}
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                        >
                          Delete
                        </button>

                        <button
                          onClick={() => {
                            handlePrint(floor.id, floor.name)
                            setActiveMenu(null)
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Export
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