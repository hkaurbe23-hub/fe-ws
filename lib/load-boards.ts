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
 * Load all boards for a specific floor.
 * - Filters by floor_id on the fly
 * - Proper error handling
 *
 * @param floorId - The floor ID to filter boards by
 * @returns Promise<Board[]> - Array of boards assigned to this floor
 */
export async function loadBoardsForFloor(floorId: number): Promise<Board[]> {
  try {
    console.log(`📡 Fetching all boards from ${API}/boards`)
    const response = await fetch(`${API}/boards`)

    if (!response.ok) {
      throw new Error(`Failed to load boards: ${response.statusText}`)
    }

    const allBoards: Board[] = await response.json()
    console.log(`✅ Received ${allBoards.length} total boards from backend`)

    // Filter by floor_id - only return boards assigned to this floor
    const filtered = allBoards.filter(
      (board) => Number(board.floor_id) === Number(floorId)
    )
    
    console.log(`🔍 Filtered to ${filtered.length} board(s) for floor ${floorId}`)
    console.log(`📊 Filtered boards:`, filtered)

    return filtered
  } catch (error) {
    throw error
  }
}

/**
 * Load ALL boards (no filtering).
 * Useful for pages that show boards across all floors.
 */
export async function loadAllBoards(): Promise<Board[]> {
  try {
    const response = await fetch(`${API}/boards`)

    if (!response.ok) {
      throw new Error(`Failed to load boards: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    throw error
  }
}
