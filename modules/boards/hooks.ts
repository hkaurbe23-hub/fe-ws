import useSWR from "swr"
import type { Floor } from "./types"
import {
  deleteFloor as deleteFloorService,
  getFloors,
  setFloorBoardCount,
  updateFloor as updateFloorService,
} from "./service"

export function useFloors() {
  const { data, error, isLoading, mutate } = useSWR<Floor[]>(
    "floors",
    () => getFloors(),
    {
      revalidateOnFocus: false,
    }
  )

  const deleteFloor = async (floorId: string) => {
    await deleteFloorService(floorId)
    await mutate()
  }

  const updateFloor = async (
    floorId: string,
    updates: Partial<Pick<Floor, "name" | "remarks" | "boards">>
  ) => {
    await updateFloorService(floorId, updates)
    await mutate()
  }

  const updateBoardCount = async (floorId: string, count: number) => {
    await setFloorBoardCount(floorId, count)
    await mutate()
  }

  const findFloor = (floorId: string) =>
    (data ?? []).find((floor) => floor.id === floorId)

  return {
    floors: data ?? [],
    isLoading,
    error,
    deleteFloor,
    updateFloor,
    updateBoardCount,
    findFloor,
    refresh: mutate,
  }
}


