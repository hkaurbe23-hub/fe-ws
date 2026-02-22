"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useFloorsContext } from "@/lib/floor-context"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Input } from "@/components/ui/input"

export default function FloorDetailsPage() {
  const params = useParams<{ floorId: string }>()
  const floorId = params.floorId

  // 🔥 NEW → boards directly from backend context
  const { boards } = useFloorsContext()

  /**
   * NOTE:
   * Backend me ab floors exist nahi karte.
   * Agar future me floor mapping add karni ho to
   * boards me floor_id add hoga.
   *
   * Filhaal → sab boards show kar rahe.
   */
  const floorBoards = useMemo(() => {
    return boards
  }, [boards])

  const boardCount = floorBoards.length

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER */}
      <div className="flex items-center justify-between rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
        <div>
          <h1 className="text-base font-semibold text-sky-900">
            Board Details
          </h1>
        </div>

        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/boards">Back</Link>
        </Button>
      </div>

      {/* DETAILS CARD */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Details
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs text-muted-foreground">
                Floor
              </label>

              <Input
                value={floorId}
                readOnly
                className="h-9 text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">
                No. of Boards
              </label>

              <Input
                value={boardCount}
                readOnly
                className="h-9 w-32 text-sm"
              />
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Board UID</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {floorBoards.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="p-6 text-center text-sm text-muted-foreground"
                    >
                      No boards found.
                    </TableCell>
                  </TableRow>
                ) : (
                  floorBoards.map((board, index) => (
                    <TableRow key={board.id}>
                      <TableCell>{index + 1}</TableCell>

                      {/* UID */}
                      <TableCell className="font-mono text-xs">
                        {board.board_uid}
                      </TableCell>

                      {/* SERIAL */}
                      <TableCell className="font-mono text-xs">
                        {board.serial_number}
                      </TableCell>

                      {/* EMAIL */}
                      <TableCell className="text-sm">
                        {board.email || (
                          <span className="italic text-muted-foreground">
                            No email
                          </span>
                        )}
                      </TableCell>

                      {/* STATUS */}
                      <TableCell className="text-right">
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}