"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { boardsApi } from "@/lib/api"
import type { Board } from "@/lib/types"   // ✅ use shared type

type FloorsContextValue = {
  boards: Board[]
  refreshBoards: () => Promise<void>
  addBoard: () => Promise<void>
  toggleBoard: (id: number, enabled: boolean) => Promise<void>
  deleteBoard: (id: number) => Promise<void>
}

const FloorsContext = createContext<FloorsContextValue | undefined>(
  undefined
)

export function FloorsProvider({
  children,
}: {
  children: ReactNode
}) {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(false)

  // ✅ Load boards safely
  const refreshBoards = async () => {
    try {
      setLoading(true)
      const data = await boardsApi.getAll()
      setBoards(data || [])
    } catch (err) {
      console.error("Failed to fetch boards:", err)
      setBoards([]) // prevent undefined crash
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshBoards()
  }, [])

  // ✅ Add board
  const addBoard = async () => {
    try {
      await boardsApi.create(1)
      await refreshBoards()
    } catch (err) {
      console.error("Failed to add board:", err)
    }
  }

  // ✅ Toggle enable / disable
  const toggleBoard = async (
    id: number,
    enabled: boolean
  ) => {
    try {
      await boardsApi.update(id, { enabled })
      await refreshBoards()
    } catch (err) {
      console.error("Failed to update board:", err)
    }
  }

  // ✅ Delete board
  const deleteBoard = async (id: number) => {
    try {
      await boardsApi.remove(id)
      await refreshBoards()
    } catch (err) {
      console.error("Failed to delete board:", err)
    }
  }

  const value = useMemo(
    () => ({
      boards,
      refreshBoards,
      addBoard,
      toggleBoard,
      deleteBoard,
    }),
    [boards]
  )

  return (
    <FloorsContext.Provider value={value}>
      {children}
    </FloorsContext.Provider>
  )
}

export function useFloorsContext(): FloorsContextValue {
  const ctx = useContext(FloorsContext)

  if (!ctx) {
    throw new Error(
      "useFloorsContext must be used within FloorsProvider"
    )
  }

  return ctx
}