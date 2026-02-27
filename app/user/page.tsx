"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import ProfileDropdown from "./ProfileDropdown"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

const API = process.env.NEXT_PUBLIC_API_URL

type Board = {
  id: number
  board_uid: string
  serial_number: string
  email: string
  enabled: boolean
  floor_id: number
}

type Floor = {
  id: number
  name: string
}

export default function UserDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [boards, setBoards] = useState<Board[]>([])
  const [floors, setFloors] = useState<Floor[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ NEW STATES (Claim Board)
  const [boardUid, setBoardUid] = useState("")
  const [serialNumber, setSerialNumber] = useState("")
  const [claimLoading, setClaimLoading] = useState(false)

  const jwtToken =
    typeof window !== "undefined"
      ? localStorage.getItem("jwtToken")
      : null

  const userEmail =
    typeof window !== "undefined"
      ? localStorage.getItem("userEmail") || session?.user?.email
      : session?.user?.email

  // 🔐 Protect route
  useEffect(() => {
    if (status === "loading") return

    if (!jwtToken && !session?.user?.email) {
      router.replace("/login")
    }
  }, [session, status, router, jwtToken])

  // 📦 Fetch Boards
  useEffect(() => {
    if (!userEmail) return

    const fetchBoards = async () => {
      try {
        const res = await fetch(`${API}/api/boards`, {
          headers: jwtToken
            ? {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwtToken}`,
              }
            : {},
        })

        if (!res.ok) {
          console.warn("Boards fetch failed:", res.status)
          setBoards([])
          return
        }

        const data: Board[] = await res.json()

        const filteredBoards = data.filter(
          (board) =>
            board.email === userEmail &&
            board.enabled === true
        )

        setBoards(filteredBoards)
      } catch (error) {
        console.error("Error fetching boards:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBoards()
  }, [session, jwtToken, userEmail])

  // 🏢 Fetch Floors
  useEffect(() => {
    const fetchFloors = async () => {
      try {
        const res = await fetch(`${API}/api/floors`)
        const data = await res.json()
        setFloors(data)
      } catch (error) {
        console.error("Error fetching floors:", error)
      }
    }

    fetchFloors()
  }, [])

  // ✅ NEW FUNCTION (Claim Board)
  const handleClaimBoard = async () => {
    if (!boardUid || !serialNumber) {
      alert("Please enter both Board UID and Serial Number")
      return
    }

    if (!jwtToken) {
      alert("Not authenticated")
      return
    }

    try {
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
        alert(data.error || "Claim failed")
        return
      }

      alert("Board claimed successfully")

      setBoardUid("")
      setSerialNumber("")

      // Refresh boards
      const refresh = await fetch(`${API}/api/boards`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      })

      const refreshedData: Board[] = await refresh.json()

      const filteredBoards = refreshedData.filter(
        (board) =>
          board.email === userEmail &&
          board.enabled === true
      )

      setBoards(filteredBoards)

    } catch (err) {
      console.error("Claim error:", err)
      alert("Something went wrong")
    } finally {
      setClaimLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!userEmail) return

    try {
      const res = await fetch(
        `${API}/api/boards/export/user-data/${userEmail}`,
        {
          headers: jwtToken
            ? { Authorization: `Bearer ${jwtToken}` }
            : {},
        }
      )

      if (!res.ok) {
        alert("Download failed")
        return
      }

      const data = await res.json()

      if (!data.length) {
        alert("No data available for download")
        return
      }

      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "User Data")

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      })

      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      saveAs(blob, "My_Data.xlsx")
    } catch (error) {
      console.error("Download failed:", error)
      alert("Download failed")
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  const grouped = boards.reduce((acc: any, board) => {
    const floorObj = floors.find(
      (f) => f.id === board.floor_id
    )
    const floorName = floorObj?.name || "Unassigned"

    if (!acc[floorName]) acc[floorName] = []
    acc[floorName].push(board)
    return acc
  }, {})

  return (
    <div className="space-y-8">
      <div className="flex justify-between mb-10">
        <div>
          <h1 className="text-3xl font-semibold">My Dashboard</h1>
          <p className="text-gray-500 mt-2">
            Email: {userEmail}
          </p>
          <p className="mt-1 font-medium">
            Total Boards: {boards.length}
          </p>
        </div>

        <ProfileDropdown email={userEmail || ""} />
      </div>

      {/* ✅ CLAIM BOARD UI */}
      <div className="bg-white p-6 rounded-lg shadow border mb-8">
        <h2 className="text-lg font-semibold mb-4">Add New Board</h2>

        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Board UID"
            value={boardUid}
            onChange={(e) => setBoardUid(e.target.value)}
            className="flex-1 border rounded-md px-4 py-2"
          />

          <input
            type="text"
            placeholder="Serial Number"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            className="flex-1 border rounded-md px-4 py-2"
          />

          <button
            onClick={handleClaimBoard}
            disabled={claimLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {claimLoading ? "Claiming..." : "Claim Board"}
          </button>
        </div>
      </div>

      {boards.length > 0 && (
        <button
          onClick={handleDownload}
          className="mb-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Download My Data
        </button>
      )}

      <div className="space-y-8">
        {Object.entries(grouped).map(([floor, boards]: any) => (
          <div key={floor} className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-xl font-semibold mb-4">{floor}</h2>

            <div className="space-y-3">
              {boards.map((board: Board) => (
                <div
                  key={board.id}
                  className="flex justify-between items-center bg-gray-100 p-4 rounded-md"
                >
                  <div>
                    <p className="font-medium">{board.board_uid}</p>
                    <p className="text-sm text-gray-500">
                      Serial: {board.serial_number}
                    </p>
                  </div>

                  <span className="text-green-600 font-semibold">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}