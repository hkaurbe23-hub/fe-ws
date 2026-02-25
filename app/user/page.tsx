"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import ProfileDropdown from "./ProfileDropdown"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

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

  // 🔐 If not logged in → redirect
  useEffect(() => {
    if (status === "loading") return

    if (!session?.user?.email) {
      router.replace("/login")
    }
  }, [session, status, router])

  // 📦 Fetch boards from backend
  useEffect(() => {
    if (!session?.user?.email) return

    const fetchBoards = async () => {
      try {
        const res = await fetch(
          "https://api.wattsense.in/api/boards"
        )

        const data: Board[] = await res.json()

        const userEmail = session.user.email

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
  }, [session])

  // 🏢 Fetch floors (for correct floor name mapping)
  useEffect(() => {
    const fetchFloors = async () => {
      try {
        const res = await fetch(
          "https://api.wattsense.in/api/floors"
        )
        const data = await res.json()
        setFloors(data)
      } catch (error) {
        console.error("Error fetching floors:", error)
      }
    }

    fetchFloors()
  }, [])

  // ✅ UPDATED DOWNLOAD FUNCTION (Excel from backend export API)
  const handleDownload = async () => {
    if (!session?.user?.email) return

    try {
      const res = await fetch(
        `https://api.wattsense.in/api/boards/export/user-data/${session.user.email}`
      )

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

  if (!session?.user?.email) return null

  // ✅ FIXED GROUPING (floor_id → floor.name mapping)
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
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex justify-between mb-10">
        <div>
          <h1 className="text-3xl font-semibold">
            My Dashboard
          </h1>
          <p className="text-gray-500 mt-2">
            Email: {session.user.email}
          </p>
          <p className="mt-1 font-medium">
            Total Boards: {boards.length}
          </p>
        </div>

        <ProfileDropdown email={session.user.email} />
      </div>

      {boards.length > 0 && (
        <button
          onClick={handleDownload}
          className="mb-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Download My Data
        </button>
      )}

      {boards.length === 0 && (
        <div className="bg-white p-6 rounded-lg shadow border text-gray-500">
          No boards assigned to your account.
        </div>
      )}

      <div className="space-y-8">
        {Object.entries(grouped).map(([floor, boards]: any) => (
          <div
            key={floor}
            className="bg-white rounded-lg shadow border p-6"
          >
            <h2 className="text-xl font-semibold mb-4">
              {floor}
            </h2>

            <div className="space-y-3">
              {boards.map((board: Board) => (
                <div
                  key={board.id}
                  className="flex justify-between items-center bg-gray-100 p-4 rounded-md"
                >
                  <div>
                    <p className="font-medium">
                      {board.board_uid}
                    </p>
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