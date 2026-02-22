"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import { useFloorsContext } from "@/lib/floor-context"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"

export default function EditFloorPage() {
  const params = useParams<{ floorId: string }>()
  const floorId = params.floorId

  const {
    floors,
    updateFloor,
    addBoard,
    toggleBoard,
    deleteBoard,
  } = useFloorsContext()

  const floor = useMemo(
    () => floors.find((item) => item.id === floorId),
    [floors, floorId]
  )

  const [remarks, setRemarks] = useState("")
  const [boardsToAdd, setBoardsToAdd] = useState<number>(1)
  const [emailErrors, setEmailErrors] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (floor) {
      setRemarks(floor.remarks ?? "")
    }
  }, [floor])

  if (!floor) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        Floor not found
      </div>
    )
  }

  // ✅ Email validation
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleSave = () => {
    let hasError = false
    const newErrors: Record<string, boolean> = {}

    floor.boards.forEach((board) => {
      if (board.email && !validateEmail(board.email)) {
        newErrors[board.id] = true
        hasError = true
      }
    })

    if (hasError) {
      setEmailErrors(newErrors)
      toast.error("Please fix invalid emails before saving.")
      return
    }

    updateFloor(floor.id, { remarks })
    toast.success("Floor updated successfully")
  }

  const handleBulkAdd = () => {
    const count = boardsToAdd < 1 ? 1 : boardsToAdd

    for (let i = 0; i < count; i++) {
      addBoard(floor.id)
    }

    setBoardsToAdd(1)
  }

  const handleDeleteBoard = (boardId: string) => {
    deleteBoard(floor.id, boardId)
    toast.success("Board deleted")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
        <div>
          <h1 className="text-base font-semibold text-sky-900">
            Edit Board Data
          </h1>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/boards">Back</Link>
          </Button>
          <Button
            size="sm"
            className="bg-emerald-500 text-white hover:bg-emerald-600"
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Floor Details
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Floor Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Floor ID</Label>
              <Input
                value={floor.id}
                disabled
                className="font-mono text-xs"
              />
            </div>

            <div>
              <Label>Remarks</Label>
              <Input
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>

          {/* Bulk Add Boards */}
          <div className="flex items-center justify-end gap-2">
            <Input
              type="number"
              min={1}
              value={boardsToAdd}
              onChange={(e) =>
                setBoardsToAdd(
                  Math.max(1, parseInt(e.target.value || "1", 10))
                )
              }
              className="w-20 h-8 text-sm"
            />

            <Button
              onClick={handleBulkAdd}
              size="sm"
              variant="outline"
            >
              + Add Board(s)
            </Button>
          </div>

          {/* Boards Table */}
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Board ID</TableHead>
                  <TableHead>Serial</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {floor.boards.map((board, index) => (
                  <TableRow key={board.id}>
                    <TableCell>{index + 1}</TableCell>

                    <TableCell className="font-mono text-xs">
                      {board.id}
                    </TableCell>

                    <TableCell className="font-mono text-xs">
                      {board.serial}
                    </TableCell>

                    <TableCell>
                      <Input
                        value={board.email}
                        onChange={(e) => {
                          const value = e.target.value
                          updateFloor(floor.id, {
                            boards: floor.boards.map((b) =>
                              b.id === board.id
                                ? { ...b, email: value }
                                : b
                            ),
                          })
                        }}
                        className={`h-8 text-xs ${
                          emailErrors[board.id]
                            ? "border-red-500"
                            : ""
                        }`}
                      />
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={board.enabled}
                          onCheckedChange={() =>
                            toggleBoard(floor.id, board.id)
                          }
                        />
                        <span
                          className={`text-xs font-semibold ${
                            board.enabled
                              ? "text-emerald-600"
                              : "text-red-500"
                          }`}
                        >
                          {board.enabled
                            ? "Enabled"
                            : "Disabled"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          handleDeleteBoard(board.id)
                        }
                        className="text-red-500/80 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button
            onClick={handleSave}
            className="bg-emerald-500 text-white hover:bg-emerald-600"
          >
            Save changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
