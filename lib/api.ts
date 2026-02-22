import type { Board } from "./types"

const API = process.env.NEXT_PUBLIC_API_URL

// GET ALL BOARDS
export const boardsApi = {
  async getAll(): Promise<Board[]> {
    const res = await fetch(`${API}/api/boards`, {
      headers: {
        "x-user-email": "mishkaautomator@gmail.com"
      }
    })

    if (!res.ok) throw new Error("Failed to fetch boards")

    return res.json()
  },

  // CREATE BOARD(S)
  async create(count: number, groupName?: string): Promise<Board[]> {
    const createdBoards: Board[] = []

    for (let i = 0; i < count; i++) {
      const res = await fetch(`${API}/api/boards/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": "mishkaautomator@gmail.com"
        },
        body: JSON.stringify({
          email: "",
          groupName
        })
      })

      if (!res.ok) throw new Error("Board creation failed")

      const data = await res.json()
      createdBoards.push(data.board)
    }

    return createdBoards
  },

  // UPDATE BOARD
  async update(id: number, data: Partial<Board>): Promise<Board> {
    const res = await fetch(`${API}/api/boards/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-user-email": "mishkaautomator@gmail.com"
      },
      body: JSON.stringify(data)
    })

    if (!res.ok) throw new Error("Update failed")

    const result = await res.json()
    return result.board
  },

  // DELETE BOARD
  async remove(id: number): Promise<void> {
    const res = await fetch(`${API}/api/boards/${id}`, {
      method: "DELETE",
      headers: {
        "x-user-email": "mishkaautomator@gmail.com"
      }
    })

    if (!res.ok) throw new Error("Delete failed")
  },
}