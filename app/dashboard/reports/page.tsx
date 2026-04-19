"use client"

import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"

const API = process.env.NEXT_PUBLIC_API_URL

export default function ReportsPage() {
  const [boards, setBoards] = useState<any[]>([])
  const [boardSlaves, setBoardSlaves] = useState<any>({})

  const [selectedBoards, setSelectedBoards] = useState<number[]>([])
  const [selectedSlaves, setSelectedSlaves] = useState<any>({})

  const [openBoards, setOpenBoards] = useState(false)
  const [openSlaves, setOpenSlaves] = useState(false)

  // ✅ separate loading states
  const [loadingNormal, setLoadingNormal] = useState(false)
  const [loadingSingle, setLoadingSingle] = useState(false)

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("jwtToken")
      : null

  const userEmail =
    typeof window !== "undefined"
      ? localStorage.getItem("userEmail")?.toLowerCase()
      : null

  useEffect(() => {
    fetchBoards()
  }, [])

  const fetchBoards = async () => {
    const res = await fetch(`${API}/api/boards`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const json = await res.json()

    const myBoards = json.filter(
      (b: any) => b.email?.toLowerCase() === userEmail
    )

    setBoards(myBoards)
    setSelectedBoards([])

    myBoards.forEach((b: any) => fetchSlaves(b.id))
  }

  const fetchSlaves = async (boardId: number) => {
    const res = await fetch(`${API}/api/boards/${boardId}/slaves`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const json = await res.json()

    setBoardSlaves((prev: any) => ({
      ...prev,
      [boardId]: json,
    }))

    setSelectedSlaves((prev: any) => ({
      ...prev,
      [boardId]: [],
    }))
  }

  const toggleBoard = (id: number) => {
    if (selectedBoards.includes(id)) {
      setSelectedBoards(selectedBoards.filter((b) => b !== id))

      setSelectedSlaves((prev: any) => ({
        ...prev,
        [id]: [],
      }))
    } else {
      const slaves = boardSlaves[id] || []

      setSelectedBoards([...selectedBoards, id])

      setSelectedSlaves((prev: any) => ({
        ...prev,
        [id]: slaves.map((s: any) => s.slave_id),
      }))
    }
  }

  const toggleSlave = (boardId: number, slaveId: number) => {
    const current = selectedSlaves[boardId] || []

    if (current.includes(slaveId)) {
      setSelectedSlaves({
        ...selectedSlaves,
        [boardId]: current.filter((s: number) => s !== slaveId),
      })
    } else {
      setSelectedSlaves({
        ...selectedSlaves,
        [boardId]: [...current, slaveId],
      })
    }
  }

  const handleDownload = async () => {
    if (selectedBoards.length === 0) {
      alert("Select at least one board")
      return
    }

    const payload = selectedBoards.map((bid) => ({
      board_id: bid,
      slave_ids: selectedSlaves[bid] || [],
    }))

    setOpenBoards(false)
setOpenSlaves(false)
setLoadingNormal(true)

    const res = await fetch(`${API}/api/reports/export`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ boards: payload }),
    })

    if (!res.ok) {
      const err = await res.json()
      alert(err.error || "Download failed")
      setLoadingNormal(false)
      return
    }

    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "Energy_Report.xlsx"
    a.click()

    setLoadingNormal(false)
  }

  // ✅ FIXED SINGLE SHEET
  const handleSingleSheetDownload = async () => {
    // 🚀 take ALL boards automatically
    const payload = boards.map((b) => ({
      board_id: b.id,
      slave_ids: [],
    }))

    setOpenBoards(false)
setOpenSlaves(false)
setLoadingSingle(true)

    const res = await fetch(`${API}/api/reports/export-single`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ boards: payload }),
    })

    if (!res.ok) {
      const err = await res.json()
      alert(err.error || "Download failed")
      setLoadingSingle(false)
      return
    }

    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "Single_Sheet_Report.xlsx"
    a.click()

    setLoadingSingle(false)
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        Reports Dashboard
      </h1>

      <div className="bg-white p-4 rounded shadow flex items-center gap-4 flex-wrap">

        {/* BOARDS */}
        <div className="relative">
          <button
            onClick={() => setOpenBoards(!openBoards)}
            className="px-4 py-2 border rounded-md bg-gray-100 flex gap-2"
          >
            Boards ({selectedBoards.length || "All"})
            <ChevronDown size={16} />
          </button>

          {openBoards && (
            <div className="absolute top-12 left-0 bg-white border shadow rounded p-3 z-50 max-h-60 overflow-auto">

              <label className="block text-sm font-semibold mb-2 border-b pb-1">
                <input
                  type="checkbox"
                  checked={
                    selectedBoards.length === boards.length &&
                    boards.length > 0
                  }
                  onChange={() => {
                    if (selectedBoards.length === boards.length) {
                      setSelectedBoards([])
                      setSelectedSlaves({})
                    } else {
                      const allBoardIds = boards.map((b) => b.id)

                      const allSlaves: any = {}

                      boards.forEach((b) => {
                        const slaves = boardSlaves[b.id] || []
                        allSlaves[b.id] = slaves.map((s: any) => s.slave_id)
                      })

                      setSelectedBoards(allBoardIds)
                      setSelectedSlaves(allSlaves)
                    }
                  }}
                />
                All Boards
              </label>

              {boards.map((b) => (
                <label key={b.id} className="block text-sm">
                  <input
                    type="checkbox"
                    checked={selectedBoards.includes(b.id)}
                    onChange={() => toggleBoard(b.id)}
                  />
                  {b.board_uid}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* SLAVES */}
        <div className="relative">
          <button
            onClick={() => setOpenSlaves(!openSlaves)}
            className="px-4 py-2 border rounded-md bg-gray-100 flex gap-2"
          >
            Slave IDs
            <ChevronDown size={16} />
          </button>

          {openSlaves && (
            <div className="absolute top-12 left-0 bg-white border shadow rounded p-3 z-50 max-h-60 overflow-auto w-64">
              {selectedBoards.map((bid) => {
                const slaves = boardSlaves[bid] || []

                return (
                  <div key={bid} className="mb-2">
                    <p className="text-xs font-semibold text-gray-500">
                      {boards.find((b) => b.id === bid)?.board_uid}
                    </p>

                    {slaves.length === 0 && (
                      <p className="text-xs text-gray-400">No Slaves</p>
                    )}

                    {slaves.length > 0 && (
                      <label className="block text-xs font-semibold mb-1">
                        <input
                          type="checkbox"
                          checked={
                            (selectedSlaves[bid]?.length || 0) ===
                            slaves.length
                          }
                          onChange={() => {
                            if (
                              (selectedSlaves[bid]?.length || 0) ===
                              slaves.length
                            ) {
                              setSelectedSlaves({
                                ...selectedSlaves,
                                [bid]: [],
                              })
                            } else {
                              setSelectedSlaves({
                                ...selectedSlaves,
                                [bid]: slaves.map((s: any) => s.slave_id),
                              })
                            }
                          }}
                        />
                        All Slaves
                      </label>
                    )}

                    {slaves.map((s: any) => (
                      <label key={s.slave_id} className="block text-sm">
                        <input
                          type="checkbox"
                          checked={
                            selectedSlaves[bid]?.includes(s.slave_id) || false
                          }
                          onChange={() => toggleSlave(bid, s.slave_id)}
                        />
                        {s.display_name || `Slave ${s.slave_id}`}
                      </label>
                    ))}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* BUTTONS */}
        <button
          onClick={handleDownload}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          {loadingNormal ? "Downloading..." : "Download Report"}
        </button>

        <button
          onClick={handleSingleSheetDownload}
          className="bg-green-600 text-white px-4 py-2 rounded-md"
        >
          {loadingSingle ? "Downloading..." : "Download Single Sheet"}
        </button>

      </div>
    </div>
  )
}