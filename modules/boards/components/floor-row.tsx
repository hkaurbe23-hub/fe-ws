"use client"

import type { MouseEvent } from "react"
import { useRouter } from "next/navigation"
import type { Floor } from "@/lib/floor-context"
import { useFloorsContext } from "@/lib/floor-context"

import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreVertical, Eye, Pencil, Printer, Trash2 } from "lucide-react"

type FloorRowProps = {
  floor: Floor
}

export function FloorRow({ floor }: FloorRowProps) {
  const router = useRouter()
  const { deleteFloor } = useFloorsContext()

  const boardCount = floor.boards.length

  const handleView = (event: MouseEvent) => {
    event.stopPropagation()
    router.push(`/dashboard/boards/${floor.id}`)
  }

  const handleEdit = (event: MouseEvent) => {
    event.stopPropagation()
    router.push(`/dashboard/boards/edit/${floor.id}`)
  }

  const handlePrint = (event: MouseEvent) => {
    event.stopPropagation()
    if (typeof window !== "undefined") {
      window.print()
    }
  }

  const handleDelete = async (event: MouseEvent) => {
    event.stopPropagation()
    if (typeof window === "undefined") return
    const confirmed = window.confirm(
      "Delete this floor and all of its boards? This action cannot be undone."
    )
    if (!confirmed) return
    await deleteFloor(floor.id)
  }

  return (
    <AccordionItem
      value={floor.id}
      className="border-border bg-card/40 data-[state=open]:bg-card rounded-md border"
    >
      <div className="flex items-center justify-between gap-4 px-4">
        <AccordionTrigger className="flex-1 border-0 px-0 py-3 hover:no-underline">
          <div className="flex flex-1 items-center justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1 text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {floor.name}
                </span>
                <Badge
                  variant="secondary"
                  className="border-border bg-muted text-xs font-normal"
                >
                  {boardCount} board{boardCount === 1 ? "" : "s"}
                </Badge>
              </div>
              {floor.remarks ? (
                <p className="truncate text-xs text-muted-foreground">
                  {floor.remarks}
                </p>
              ) : (
                <p className="text-xs italic text-muted-foreground">
                  No remarks added.
                </p>
              )}
            </div>
          </div>
        </AccordionTrigger>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="my-1 size-8 text-muted-foreground hover:text-foreground"
              onClick={(event) => event.stopPropagation()}
              aria-label={`Actions for ${floor.name}`}
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={handleView}>
              <Eye className="size-4" />
              <span>View</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit}>
              <Pencil className="size-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePrint}>
              <Printer className="size-4" />
              <span>Print label</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleDelete}>
              <Trash2 className="size-4" />
              <span>Delete floor</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AccordionContent>
        <div className="px-4 pb-4">
          <div className="overflow-x-auto rounded-md border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4">Board ID</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {floor.boards.map((board) => (
                  <TableRow key={board.id} className="hover:bg-muted/40">
                    <TableCell className="pl-4 font-mono text-xs text-foreground">
                      {board.id}
                    </TableCell>

                    {/* ✅ FIXED SERIAL */}
                    <TableCell className="font-mono text-xs text-foreground">
                      {board.serial}
                    </TableCell>

                    <TableCell className="text-sm text-foreground">
                      {board.email || (
                        <span className="italic text-muted-foreground">
                          No email
                        </span>
                      )}
                    </TableCell>

                    {/* ✅ FIXED STATUS */}
                    <TableCell>
                      <Badge
                        variant={board.enabled ? "default" : "secondary"}
                        className={
                          board.enabled
                            ? "bg-sky-100 text-sky-700 border-sky-200"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {board.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}



