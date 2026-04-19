/** 
 * Clean frontend-only data sync strategy for boards
 * - Uses NextAuth session instead of localStorage
 * - Always sends correct user identity to backend
 */
/*
export interface Board {
  id: number
  board_uid: string
  serial_number: string
  floor_id: number | null
  email: string | null
  enabled: boolean
}

const API = "https://api.wattsense.in/api"

/**
 * Load all boards for a specific floor.
 */
/*
export async function loadBoardsForFloor(
  floorId: number,
  session: any
): Promise<Board[]> {
  const response = await fetch(`${API}/boards`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.user?.email}`, // ✅ FIX
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized - Please login again")
    }
    throw new Error(`Failed to load boards: ${response.statusText}`)
  }

  const allBoards: Board[] = await response.json()

  return allBoards.filter(
    (board) => Number(board.floor_id) === Number(floorId)
  )
}

/**
 * Load ALL boards (no filtering).
 */
/*
export async function loadAllBoards(session: any): Promise<Board[]> {
  const response = await fetch(`${API}/boards`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.user?.email}`, // ✅ FIX
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized - Please login again")
    }
    throw new Error(`Failed to load boards: ${response.statusText}`)
  }

  return await response.json()
}*/
// ❌ DISABLED OLD FILE (DO NOT USE)

export const loadAllBoards = async () => {
  console.warn("⚠️ loadAllBoards is deprecated. Use boardsApi instead.")
  return []
}

export const loadBoardsForFloor = async () => {
  console.warn("⚠️ loadBoardsForFloor is deprecated. Use boardsApi instead.")
  return []
}