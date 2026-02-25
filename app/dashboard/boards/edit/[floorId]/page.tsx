"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Trash2 } from "lucide-react"

interface Board {
  id: number | string
  board_uid: string
  serial_number: string
  email: string | null
  enabled: boolean
  floor_id: number | null
  isNew?: boolean
}

const API = "https://api.wattsense.in/api"

export default function EditFloorPage() {
  const router = useRouter()
  const params = useParams()
  const floorId = Number(params?.floorId)

  const [boards, setBoards] = useState<Board[]>([])
  const [addCount, setAddCount] = useState(1)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 🔹 Load boards for this floor
  useEffect(() => {
    if (!floorId) {
      setError("Invalid floor ID")
      setLoading(false)
      return
    }

    async function fetchBoards() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`${API}/boards`)
        if (!res.ok) throw new Error("Failed to load boards")

        const data: Board[] = await res.json()

        const filtered = data.filter(
          (b) => String(b.floor_id) === String(floorId)
        )

        setBoards(filtered)
      } catch (err) {
        console.error(err)
        setError("Failed to load boards")
      } finally {
        setLoading(false)
      }
    }

    fetchBoards()
  }, [floorId])

  // 🔹 Add new temp boards
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

  // 🔹 Update field locally
  function updateBoardField(
    id: number | string,
    field: keyof Board,
    value: any
  ) {
    setBoards((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    )
  }

  // 🔹 Delete board
  async function deleteBoard(id: number | string) {
    if (typeof id === "string") {
      setBoards((prev) => prev.filter((b) => b.id !== id))
      return
    }

    if (!confirm("Delete this board permanently?")) return

    try {
      const res = await fetch(`${API}/boards/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Delete failed")

      setBoards((prev) => prev.filter((b) => b.id !== id))
    } catch (err) {
      alert("Failed to delete board")
    }
  }

  // 🔹 Save Changes
  async function saveChanges() {
    try {
      setSaving(true)

      for (const board of boards) {
        // CREATE
        if (board.isNew) {
          const res = await fetch(`${API}/boards/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: board.email || "",
              floor_id: floorId,
            }),
          })

          if (!res.ok) {
            alert("Board create failed")
            setSaving(false)
            return
          }
        }
        // UPDATE
        else {
          const res = await fetch(`${API}/boards/${board.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: board.email,
              enabled: board.enabled,
            }),
          })

          if (!res.ok) {
            alert("Board update failed")
            setSaving(false)
            return
          }
        }
      }

      alert("Saved successfully ✅")
      window.location.reload()
    } catch (err) {
      console.error(err)
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
    <div className="p-6 space-y-6 text-sm">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Edit Board Data</h1>

        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border rounded-md"
          >
            Back
          </button>

          <button
            onClick={saveChanges}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6 space-y-6">
        <div className="flex justify-end items-center gap-3">
          <input
            type="number"
            min="1"
            value={addCount}
            onChange={(e) => setAddCount(Number(e.target.value))}
            className="w-20 border rounded-md px-3 py-1.5"
          />
          <button
            onClick={addBoards}
            className="px-3 py-1.5 border rounded-md"
          >
            + Add Board(s)
          </button>
        </div>

        {boards.length === 0 ? (
          <div className="text-gray-500">
            No boards assigned to this floor yet
          </div>
        ) : (
          <table className="w-full border text-sm">
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
                      value={board.email || ""}
                      onChange={(e) =>
                        updateBoardField(
                          board.id,
                          "email",
                          e.target.value
                        )
                      }
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
        )}
      </div>
    </div>
  )
}