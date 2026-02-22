"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AddBoardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (count: number, groupName?: string) => Promise<void>
}

export function AddBoardDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddBoardDialogProps) {
  const [count, setCount] = useState("1")
  const [groupName, setGroupName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const num = parseInt(count, 10)
    if (isNaN(num) || num < 1 || num > 100) {
      setError("Please enter a number between 1 and 100.")
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(num, groupName.trim() || undefined)
      setCount("1")
      setGroupName("")
      onOpenChange(false)
    } catch {
      setError("Failed to create boards.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Boards</DialogTitle>
          <DialogDescription>
            Generate new boards with auto-generated IDs and serial numbers.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="count" className="text-sm font-medium text-foreground">
              Number of Boards
            </Label>
            <Input
              id="count"
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(e.target.value)}
              placeholder="e.g. 10"
              className="h-10"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="group" className="text-sm font-medium text-foreground">
              Group Name / Remarks
              <span className="ml-1 text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="group"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Floor C Sensors"
              className="h-10"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? "Creating..." : "Create Boards"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
