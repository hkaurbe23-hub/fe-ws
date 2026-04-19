"use client"

import { useState } from "react"
import { Check, Pencil, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TableRow, TableCell } from "@/components/ui/table"
import type { Board } from "@/lib/types"

interface BoardRowProps {
  board: Board
  onUpdate: (id: string, data: Partial<Board>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function isValidEmail(email: string) {
  if (!email) return true // empty is okay
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function BoardRow({ board, onUpdate, onDelete }: BoardRowProps) {
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [emailDraft, setEmailDraft] = useState(board.email)
  const [emailError, setEmailError] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isEnabled, setIsEnabled] = useState(board.enable=== "enabled")

  const handleToggle = async () => {
    const next = !isEnabled
    setIsEnabled(next)
    setIsUpdating(true)
    await onUpdate(board.id, { status: next ? "enabled" : "disabled" })
    setIsUpdating(false)
  }

  const handleEmailSave = async () => {
    if (!isValidEmail(emailDraft)) {
      setEmailError("Invalid email format")
      return
    }
    setEmailError("")
    setIsUpdating(true)
    await onUpdate(board.id, { email: emailDraft })
    setIsEditingEmail(false)
    setIsUpdating(false)
  }

  const handleEmailCancel = () => {
    setEmailDraft(board.email)
    setEmailError("")
    setIsEditingEmail(false)
  }

  const handleDelete = async () => {
    setIsUpdating(true)
    await onDelete(board.id)
    setIsUpdating(false)
  }

  return (
    <TableRow className={isUpdating ? "opacity-60 pointer-events-none" : ""}>
      <TableCell className="pl-6 font-mono text-xs text-foreground">
        {board.id}
      </TableCell>
      <TableCell className="font-mono text-xs text-foreground">
        {board.serial}
      </TableCell>
      <TableCell>
        {isEditingEmail ? (
          <div className="flex items-center gap-1.5">
            <div className="flex flex-col gap-0.5">
              <Input
                value={emailDraft}
                onChange={(e) => {
                  setEmailDraft(e.target.value)
                  setEmailError("")
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEmailSave()
                  if (e.key === "Escape") handleEmailCancel()
                }}
                className="h-7 w-48 text-xs"
                placeholder="email@example.com"
                autoFocus
              />
              {emailError && (
                <span className="text-[10px] text-destructive">{emailError}</span>
              )}
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="size-6"
              onClick={handleEmailSave}
              aria-label="Save email"
            >
              <Check className="size-3 text-success" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-6"
              onClick={handleEmailCancel}
              aria-label="Cancel editing"
            >
              <X className="size-3 text-muted-foreground" />
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditingEmail(true)}
            className="group flex items-center gap-1.5 text-sm text-foreground hover:text-primary transition-colors"
            aria-label="Edit email"
          >
            <span className={board.email ? "" : "text-muted-foreground italic"}>
              {board.email || "No email"}
            </span>
            <Pencil className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
      </TableCell>
      <TableCell className="pr-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleToggle}
            className={`relative h-6 w-12 rounded-full transition ${
              isEnabled ? "bg-emerald-500" : "bg-slate-400"
            }`}
            aria-label={`Toggle board ${board.id}`}
          >
            <span
              className={`absolute top-0 left-0 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                isEnabled ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {board.groupName || "-"}
      </TableCell>
      <TableCell>
        <Button
          size="icon"
          variant="ghost"
          className="size-7 text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
          aria-label={`Delete board ${board.id}`}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </TableCell>
    </TableRow>
  )
}
