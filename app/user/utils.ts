export type Board = {
  id: number
  board_uid: string
  serial_number: string
  email: string
  enabled: boolean
  floor_id: string | number
}

export const groupBoardsByFloor = (boards: Board[]) => {
  return boards.reduce((acc: Record<string, Board[]>, board) => {
    const floor = board.floor_id?.toString() || 'Unassigned'

    if (!acc[floor]) {
      acc[floor] = []
    }

    acc[floor].push(board)
    return acc
  }, {})
}