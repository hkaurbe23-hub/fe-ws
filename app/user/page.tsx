"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Trash2, Pencil } from "lucide-react"

const ProfileDropdown = dynamic(() => import("./ProfileDropdown"), {
  ssr: false,
})

const API = process.env.NEXT_PUBLIC_API_URL

type Board = {
  id: number
  board_uid: string
  serial_number: string
  email: string
  enabled: boolean
  floor_id: number
}

export default function UserDashboard() {
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
    const role = localStorage.getItem("userRole")

    if (!token) return router.replace("/login")
    if (role === "admin") return router.replace("/dashboard")

    setJwtToken(token)
    setUserEmail(email)
  }, [router])

  const fetchSlaves = async (boardId: number) => {
    const res = await fetch(`${API}/api/boards/${boardId}/slaves`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    })
    const data = await res.json()

    setBoardSlaves((prev: any) => ({
      ...prev,
      [boardId]: data,
    }))
  }

  useEffect(() => {
    if (!jwtToken || hasInitialized.current) return
    hasInitialized.current = true

    const fetchBoards = async () => {
      setLoading(true)

      const res = await fetch(`${API}/api/boards`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      })

      const data = await res.json()
      setBoards(data)
      data.forEach((b: Board) => fetchSlaves(b.id))

      setLoading(false)
    }

    fetchBoards()
  }, [jwtToken])

  const handleClaimBoard = async () => {
    if (!boardUid || !serialNumber) return alert("Fill all fields")

    setClaimLoading(true)

    const res = await fetch(`${API}/api/boards/claim`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        board_uid: boardUid,
        serial_number: serialNumber,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error)
      setClaimLoading(false)
      return
    }

    alert("Board claimed!")

    const refresh = await fetch(`${API}/api/boards`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    })

    const updated = await refresh.json()
    setBoards(updated)

    setBoardUid("")
    setSerialNumber("")
    setClaimLoading(false)
  }

  const handleRemoveBoard = async (boardId: number) => {
    if (!confirm("Remove this board?")) return

    await fetch(`${API}/api/boards/${boardId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ email: null }),
    })

    setBoards((prev) => prev.filter((b) => b.id !== boardId))
  }

  const handleSaveSlaveName = async (boardId: number, slaveId: number) => {
    const key = `${boardId}_${slaveId}`
    const name = slaveNames[key]

    await fetch(`${API}/api/boards/${boardId}/slaves/${slaveId}/name`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ name }),
    })

    fetchSlaves(boardId)
    setEditingSlave(null)
  }

  if (loading) return <div className="p-10">Loading...</div>

  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-semibold">My Dashboard</h1>
          <p>{userEmail}</p>

          <p className="mt-2 text-sm font-medium text-blue-600">
            Total Boards: {boards.length}
          </p>
        </div>
        <ProfileDropdown email={userEmail || ""} />
      </div>

      {/* CLAIM */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="mb-4 font-semibold">Claim Board</h2>
        <div className="grid grid-cols-3 gap-4">
          <input
            value={boardUid}
            onChange={(e) => setBoardUid(e.target.value)}
            placeholder="Board UID"
            className="border p-2"
          />
          <input
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            placeholder="Serial"
            className="border p-2"
          />
          <button onClick={handleClaimBoard} className="bg-blue-600 text-white">
            {claimLoading ? "..." : "Claim"}
          </button>
        </div>
      </div>

      {/* BOARDS */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="mb-4 font-semibold">My Boards</h2>

        {boards.map((board) => (
          <div key={board.id} className="flex justify-between p-3 bg-gray-100 mb-2">
            <div>
              <p>{board.board_uid}</p>
              <p className="text-sm">{board.serial_number}</p>

              {boardSlaves[board.id]?.map((s: any) => {
                const key = `${board.id}_${s.slave_id}`
                const isEditing = editingSlave === key

                return (
                  <div key={s.slave_id} className="flex gap-2 text-xs items-center">

                    {isEditing ? (
                      <>
                        <input
                          className="border px-1 text-xs"
                          value={slaveNames[key] || ""}
                          onChange={(e) =>
                            setSlaveNames((prev: any) => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                          autoFocus
                        />

                        <button
                          onClick={() => handleSaveSlaveName(board.id, s.slave_id)}
                          className="bg-green-600 text-white px-2 py-0.5 rounded text-xs"
                        >
                          Save
                        </button>

                        <button
                          onClick={() => setEditingSlave(null)}
                          className="bg-gray-400 text-white px-2 py-0.5 rounded text-xs"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span>
                          {s.display_name || `Slave ${s.slave_id}`}
                        </span>

                        <Pencil
                          size={12}
                          className="cursor-pointer"
                          onClick={() => {
                            setEditingSlave(key)
                            setSlaveNames((prev: any) => ({
                              ...prev,
                              [key]: s.display_name || "",
                            }))
                          }}
                        />
                      </>
                    )}

                  </div>
                )
              })}
            </div>

            <div className="flex gap-3 items-center">
              <Trash2
                className="text-red-600 cursor-pointer"
                onClick={() => handleRemoveBoard(board.id)}
              />

              <span
                className={`px-2 py-1 rounded text-white text-sm ${
                  board.enabled ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {board.enabled ? "Active" : "Disabled"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}