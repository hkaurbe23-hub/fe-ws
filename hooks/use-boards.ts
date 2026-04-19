"use client"

import useSWR from "swr"
import { boardsApi } from "@/lib/api"
import type { Board } from "@/lib/types"

export function useBoards() {
  const { data, error, isLoading, mutate } = useSWR<Board[]>(
    "boards",
    () => boardsApi.getAll(),
    { revalidateOnFocus: false }
  )

  const createBoards = async (count: number, groupName?: string) => {
    const newBoards = await boardsApi.create(count, groupName)
    await mutate()
    return newBoards
  }

  const updateBoard = async (id: string, updates: Partial<Board>) => {
    await boardsApi.update(id, updates)
    await mutate()
  }

  const deleteBoard = async (id: string) => {
    await boardsApi.remove(id)
    await mutate()
  }

  return {
    boards: data ?? [],
    isLoading,
    error,
    createBoards,
    updateBoard,
    deleteBoard,
    refresh: mutate,
  }
}
