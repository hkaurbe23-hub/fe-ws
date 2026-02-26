/**
 * Clean frontend-only data sync strategy for boards
 * - Single source of truth: Always fetch from backend
 * - Simple, no race conditions in critical paths
 * - No stale state: Caller decides when to refetch
 */

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
 * Helper to attach JWT token (Bearer format)
 */
function getAuthHeaders() {
  if (typeof window === "undefined") {
    return {
      "Content-Type": "application/json",
    }
  }

  const token = localStorage.getItem("jwtToken")

  return token
    ? {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    : {
        "Content-Type": "application/json",
      }
}

/**
 * Load all boards for a specific floor.
 */
export async function loadBoardsForFloor(
  floorId: number
): Promise<Board[]> {
  const response = await fetch(`${API}/boards`, {
    headers: getAuthHeaders(),
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
export async function loadAllBoards(): Promise<Board[]> {
  const response = await fetch(`${API}/boards`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized - Please login again")
    }
    throw new Error(`Failed to load boards: ${response.statusText}`)
  }

  return await response.json()
}