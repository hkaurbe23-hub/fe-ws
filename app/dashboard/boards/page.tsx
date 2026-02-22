"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useFloorsContext } from "@/lib/floor-context"

export default function BoardsPage() {
  const { boards, addBoard } = useFloorsContext()

  const [loading, setLoading] = useState(false)

  const handleAddBoard = async () => {
    setLoading(true)
    await addBoard()
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Boards
        </h1>

        <p className="text-sm text-muted-foreground">
          Manage all registered boards.
        </p>
      </div>

      {/* CARD */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">
            Boards List
          </CardTitle>

          <Button size="sm" onClick={handleAddBoard} disabled={loading}>
            {loading ? "Adding..." : "+ Add Board"}
          </Button>
        </CardHeader>

        <CardContent>
          {boards.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No boards found.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-2 text-left">#</th>
                    <th className="p-2 text-left">Board UID</th>
                    <th className="p-2 text-left">Serial Number</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-right">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {boards.map((board, index) => (
                    <tr
                      key={board.id}
                      className="border-t"
                    >
                      <td className="p-2">{index + 1}</td>

                      <td className="p-2 font-mono text-xs">
                        {board.board_uid}
                      </td>

                      <td className="p-2 font-mono text-xs">
                        {board.serial_number}
                      </td>

                      <td className="p-2">
                        {board.email || "—"}
                      </td>

                      <td className="p-2 text-right">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}