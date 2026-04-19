"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Trash2 } from "lucide-react"
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

export default function EditFloorPage() {
  const router = useRouter()
  const params = useParams()
  const floorId = Number(params?.floorId)

  const { boards: contextBoards } = useFloorsContext() // ✅ FIXED (moved inside)

  const [boards, setBoards] = useState<Board[]>([])
  const boardsRef = useRef<Board[]>([])
  const [addCount, setAddCount] = useState(1)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Keep ref in sync with state
  useEffect(() => {
    boardsRef.current = boards
    console.log("🔄 BOARDS REF UPDATED:", boards.map(b => ({ id: b.id, email: b.email })))
  }, [boards])

  useEffect(() => {
    if (isNaN(floorId)) return

async function fetchBoards() {
  try {
    setLoading(true)

    const token = localStorage.getItem("jwtToken")
   if (!token || token === "null") {
  console.log("❌ INVALID TOKEN")
  setError("Not authenticated")
  return
}
    

    console.log("🔥 TOKEN BEING SENT:", token)

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://api.wattsense.in"

    const res = await fetch(`${apiUrl}/api/boards/floor/${floorId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ ALWAYS send
      },
    })

    if (!res.ok) {
      if (!res.ok) {
  console.log("❌ RESPONSE STATUS:", res.status)
  throw new Error("Failed to load boards")
}
      throw new Error("Failed to load boards")
    }

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
  }

  function updateBoardField(
    id: number | string,
    field: keyof Board,
    value: any
  ) {
    setBoards((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    )
  }

  const deleteBoard = async (id: number | string) => {
    const token = localStorage.getItem("jwtToken")

    if (!token) {
      alert("Please login again")
      return
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.wattsense.in"

    const res = await fetch(
      `${apiUrl}/api/boards/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || "Delete failed")
      return
    }

    setBoards(prev => prev.filter(b => b.id !== id))
  }

  async function saveChanges() {
    try {
      setSaving(true)

      const latestBoards = boardsRef.current
      console.log("📤 SAVE TRIGGERED - REF BOARDS:", latestBoards.map(b => ({ id: b.id, email: b.email, isNew: b.isNew })))

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("jwtToken")
          : null

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.wattsense.in"

      for (const board of latestBoards) {
        if (board.isNew) {
          const res = await fetch(`${apiUrl}/api/boards/register`, {
            method: "POST",
            headers: token
              ? {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                }
              : {
                  "Content-Type": "application/json",
                },
            body: JSON.stringify({
  email: (board.email || "").trim().toLowerCase(),
  floor_id: floorId,
}),
          })

          const responseData = await res.json()

          if (!res.ok) {
            alert("Board create failed")
            setSaving(false)
            return
          }
        } else {
          const res = await fetch(`${apiUrl}/api/boards/${board.id}`, {
            method: "PATCH",
            headers: token
              ? {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                }
              : {
                  "Content-Type": "application/json",
                },
            body: JSON.stringify({
  email: (board.email || "").trim().toLowerCase(),
  enabled: board.enabled,
  floor_id: board.floor_id ?? floorId
}),
          })

          const responseData = await res.json()

          if (!res.ok) {
            alert("Board update failed")
            setSaving(false)
            return
          }
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

  if (loading)
    return <div className="p-6 text-gray-500">Loading boards...</div>

  if (error)
    return (
      <div className="p-6 text-red-600">
        {error}
      </div>
    )

  return (
    <div className="p-4 sm:p-6 space-y-6 text-sm">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl font-semibold">Edit Board Data</h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto px-4 py-2 border rounded-md"
          >
            Back
          </button>

          <button
            onClick={saveChanges}
            disabled={saving}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-3">
          <input
            type="number"
            min="1"
            value={addCount}
            onChange={(e) => setAddCount(Number(e.target.value))}
            className="w-full sm:w-20 border rounded-md px-3 py-1.5"
          />
          <button
            onClick={addBoards}
            className="w-full sm:w-auto px-3 py-1.5 border rounded-md"
          >
            + Add Board(s)
          </button>
        </div>

        {boards.length === 0 ? (
          <div className="text-gray-500">
            No boards assigned to this floor yet
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-[700px] w-full border text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th>#</th>
                  <th>Board ID</th>
                  <th>Serial</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {boards.map((board, index) => (
                  <tr key={board.id} className="border-t">
                    <td>{index + 1}</td>
                    <td>{board.board_uid || "(new)"}</td>
                    <td>{board.serial_number || "-"}</td>

                    <td>
                      <input
                        name={`email-${board.id}`}
                        value={board.email ?? ""}
                        onChange={(e) => {
                          const value = e.target.value
                          setBoards(prev =>
                            prev.map(b =>
                              b.id === board.id ? { ...b, email: value } : b
                            )
                          )
                        }}
                        className="w-full border rounded-md px-2 py-1"
                      />
                    </td>

                    <td>
                      <input
                        type="checkbox"
                        checked={board.enabled}
                        onChange={(e) =>
                          updateBoardField(
                            board.id,
                            "enabled",
                            e.target.checked
                          )
                        }
                      />
                    </td>

                    <td>
                      <button
                        onClick={() => deleteBoard(board.id)}
                        className="text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}