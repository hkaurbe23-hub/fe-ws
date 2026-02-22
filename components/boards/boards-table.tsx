"use client"

import { useState, useMemo } from "react"
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBoards } from "@/hooks/use-boards"
import { BoardRow } from "./board-row"
import { AddBoardDialog } from "./add-board-dialog"
import { toast } from "sonner"

const PAGE_SIZE = 8

export function BoardsTable() {
  const { boards, isLoading, createBoards, updateBoard, deleteBoard } =
    useBoards()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!search.trim()) return boards
    const q = search.toLowerCase()
    return boards.filter(
      (b) =>
        b.id.toLowerCase().includes(q) ||
        b.serialNumber.includes(q) ||
        b.email.toLowerCase().includes(q) ||
        (b.groupName && b.groupName.toLowerCase().includes(q))
    )
  }, [boards, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  // Reset page on search
  const handleSearch = (val: string) => {
    setSearch(val)
    setPage(0)
  }

  const handleCreate = async (count: number, groupName?: string) => {
    const created = await createBoards(count, groupName)
    toast.success(`${created.length} board(s) created successfully.`)
  }

  const handleUpdate = async (
    id: string,
    data: Partial<(typeof boards)[0]>
  ) => {
    await updateBoard(id, data)
    toast.success("Board updated.")
  }

  const handleDelete = async (id: string) => {
    await deleteBoard(id)
    toast.success("Board deleted.")
    // If current page is now empty, go back
    if (paged.length === 1 && page > 0) setPage(page - 1)
  }

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-foreground">Board Fleet</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search boards..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="h-9 w-56 pl-8 text-sm"
              />
            </div>
            <Button
              onClick={() => setDialogOpen(true)}
              className="h-9 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">Add Board</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Board ID</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right pr-6">Status</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-sm text-muted-foreground"
                    >
                      {search
                        ? "No boards match your search."
                        : "No boards yet. Click 'Add Board' to get started."}
                    </td>
                  </TableRow>
                ) : (
                  paged.map((board) => (
                    <BoardRow
                      key={board.id}
                      board={board}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border px-6 py-3">
            <p className="text-xs text-muted-foreground">
              Showing {filtered.length === 0 ? 0 : page * PAGE_SIZE + 1}-
              {Math.min((page + 1) * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="size-7"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="px-2 text-xs text-muted-foreground">
                {page + 1} / {totalPages}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="size-7"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddBoardDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreate}
      />
    </>
  )
}
