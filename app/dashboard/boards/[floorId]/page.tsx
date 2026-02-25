"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"

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

export default function ViewFloorPage() {
  const router = useRouter()
  const params = useParams()
  const floorId = Number(params?.floorId)

  const [floor, setFloor] = useState<Floor | null>(null)
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!floorId) return

    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        console.log("📡 Loading data for floor:", floorId)

        // 🔹 Load all floors
        const floorRes = await fetch(`${API}/floors`)
        if (!floorRes.ok) throw new Error("Failed to load floors")
        const floorsData: Floor[] = await floorRes.json()

        const selectedFloor = floorsData.find(
          (f) => Number(f.id) === Number(floorId)
        )

        setFloor(selectedFloor || null)

        // 🔹 Load all boards
        const boardRes = await fetch(`${API}/boards`)
        if (!boardRes.ok) throw new Error("Failed to load boards")
        const boardsData: Board[] = await boardRes.json()

        console.log("✅ Total boards from backend:", boardsData.length)

        // 🔹 Filter boards by floor
        const filteredBoards = boardsData.filter(
          (b) => String(b.floor_id) === String(floorId)
        )

        console.log("✅ Filtered boards:", filteredBoards.length)

        setBoards(filteredBoards)
      } catch (err) {
        console.error("❌ Load error:", err)
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [floorId])

  if (loading)
    return (
      <div className="p-6 text-gray-500">
        Loading floor and boards...
      </div>
    )

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 border rounded-md"
        >
          Back
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {floor?.name || "Floor Details"}
        </h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border rounded-md"
        >
          Back
        </button>
      </div>

      <div className="bg-white border rounded-xl p-6 space-y-4">
        <div>
          <strong>Floor Name:</strong> {floor?.name || "-"}
        </div>

        <div>
          <strong>Remarks:</strong> {floor?.remarks || "-"}
        </div>

        <div>
          <strong>No. of Boards:</strong> {boards.length}
        </div>

        {boards.length === 0 ? (
          <div className="text-gray-500 py-4">
            No boards assigned to this floor yet.
          </div>
        ) : (
          <table className="w-full border text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Board ID</th>
                <th className="p-3 text-left">Serial</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {boards.map((board, index) => (
                <tr key={board.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3 font-mono text-sm">
                    {board.board_uid}
                  </td>
                  <td className="p-3 font-mono text-sm">
                    {board.serial_number}
                  </td>
                  <td className="p-3">{board.email || "-"}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        board.enabled
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {board.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}