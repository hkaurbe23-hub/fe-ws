import type { Board } from "./types"

const API = process.env.NEXT_PUBLIC_API_URL

// 🔐 Correct Bearer token header
const getHeaders = () => {
  if (typeof window !== "undefined") {
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

  return {
    "Content-Type": "application/json",
  }
}

export const boardsApi = {
  async getAll(): Promise<Board[]> {
    const res = await fetch(`${API}/api/boards`, {
      headers: getHeaders(),
    })

    if (!res.ok) {
      console.warn("Failed to fetch boards:", res.status)
      return []
    }

    return res.json()
  },

  async update(id: number, data: Partial<Board>): Promise<Board> {
    const res = await fetch(`${API}/api/boards/${id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      console.warn("Update failed:", res.status)
      throw new Error("Update failed")
    }

    const result = await res.json()
    return result.board
  },

  async remove(id: number): Promise<void> {
    const res = await fetch(`${API}/api/boards/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    })

    if (!res.ok) {
      console.warn("Delete failed:", res.status)
      throw new Error("Delete failed")
    }
  },
}