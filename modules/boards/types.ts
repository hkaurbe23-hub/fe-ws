export type BoardStatus = "enabled" | "disabled"

export type Board = {
  id: string
  serialNumber: string
  email: string
  status: BoardStatus
}

export type Floor = {
  id: string
  name: string
  remarks: string
  boards: Board[]
}


