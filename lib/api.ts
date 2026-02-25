import type { Board } from "./types"

const API = process.env.NEXT_PUBLIC_API_URL

const headers = {
  "Content-Type": "application/json",
  "x-user-email": "mishkaautomator@gmail.com"
}

export const boardsApi = {

  async getAll(): Promise<Board[]> {
    const res = await fetch(`${API}/api/boards`, { headers })

    if (!res.ok) throw new Error("Failed to fetch boards")

    return res.json()
  },

  async update(id: number, data: Partial<Board>): Promise<Board> {
    const res = await fetch(`${API}/api/boards/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data)
    })

    if (!res.ok) throw new Error("Update failed")

    const result = await res.json()
    return result.board
  },

  async remove(id: number): Promise<void> {
    const res = await fetch(`${API}/api/boards/${id}`, {
      method: "DELETE",
      headers
    })

    if (!res.ok) throw new Error("Delete failed")
  },
}