import type { Board, Floor } from "./types"

// In-memory mock store for floors and their boards.
// Structured so it can later be replaced with real API calls
// (e.g. fetch("/api/floors")) without touching UI components.

function generateBoardId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return "BRD-" + crypto.randomUUID().slice(0, 8).toUpperCase()
  }

  // Fallback for environments without crypto.randomUUID
  return (
    "BRD-" +
    Math.random().toString(16).slice(2, 10).toUpperCase()
  )
}

function generateSerialNumber() {
  return String(Math.floor(100000000 + Math.random() * 900000000))
}

function createBoard(overrides: Partial<Board> = {}): Board {
  return {
    id: generateBoardId(),
    serialNumber: generateSerialNumber(),
    email: "",
    status: "enabled",
    ...overrides,
  }
}

let floorsStore: Floor[] = [
  {
    id: "floor-a",
    name: "Floor A",
    remarks: "Main office and control room.",
    boards: [
      createBoard({ email: "panel-a1@wattsense.io" }),
      createBoard({ email: "panel-a2@wattsense.io" }),
      createBoard({ email: "panel-a3@wattsense.io", status: "disabled" }),
    ],
  },
  {
    id: "floor-b",
    name: "Floor B",
    remarks: "Secondary monitoring floor.",
    boards: [
      createBoard({ email: "panel-b1@wattsense.io" }),
      createBoard({ email: "panel-b2@wattsense.io" }),
    ],
  },
]

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

function cloneFloor(floor: Floor): Floor {
  return {
    ...floor,
    boards: floor.boards.map((b) => ({ ...b })),
  }
}

export async function getFloors(): Promise<Floor[]> {
  await delay()
  return floorsStore.map(cloneFloor)
}

export async function getFloorById(
  floorId: string
): Promise<Floor | undefined> {
  await delay()
  const floor = floorsStore.find((f) => f.id === floorId)
  return floor ? cloneFloor(floor) : undefined
}

export async function updateFloor(
  floorId: string,
  updates: Partial<Pick<Floor, "name" | "remarks" | "boards">>
): Promise<Floor> {
  await delay(200)
  const index = floorsStore.findIndex((f) => f.id === floorId)

  if (index === -1) {
    throw new Error("Floor not found")
  }

  const current = floorsStore[index]
  const next: Floor = {
    ...current,
    ...updates,
    boards: updates.boards ?? current.boards,
  }

  floorsStore[index] = next
  return cloneFloor(next)
}

export async function setFloorBoardCount(
  floorId: string,
  count: number
): Promise<Floor> {
  await delay(200)
  const index = floorsStore.findIndex((f) => f.id === floorId)

  if (index === -1) {
    throw new Error("Floor not found")
  }

  const current = floorsStore[index]
  const nextCount = Math.max(0, Math.floor(count))
  let boards = [...current.boards]

  if (nextCount > boards.length) {
    const toAdd = nextCount - boards.length
    const newBoards: Board[] = Array.from({ length: toAdd }, () =>
      createBoard()
    )
    boards = boards.concat(newBoards)
  } else if (nextCount < boards.length) {
    boards = boards.slice(0, nextCount)
  }

  const updated: Floor = {
    ...current,
    boards,
  }

  floorsStore[index] = updated
  return cloneFloor(updated)
}

export async function deleteFloor(floorId: string): Promise<void> {
  await delay(200)
  floorsStore = floorsStore.filter((f) => f.id !== floorId)
}


