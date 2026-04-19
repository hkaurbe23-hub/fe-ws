import type { Board } from "./types"

const API = process.env.NEXT_PUBLIC_API_URL

// ✅ SAFE TOKEN GETTER
const getToken = () => {
  if (typeof window === "undefined") return null

  const token = localStorage.getItem("jwtToken")

  if (!token) {
    console.log("❌ NO TOKEN FOUND")
    return null
  }

  return token
}

export const boardsApi = {
  async getAll(): Promise<Board[]> {
    const token = getToken()

    // ✅ STOP if no token
    if (!token) return []

    const res = await fetch(`${API}/api/boards`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      console.warn("Failed to fetch boards:", res.status)
      return []
    }

    return res.json()
  },

  async update(id: number, data: Partial<Board>): Promise<Board> {
    const token = getToken()
    if (!token) throw new Error("No token")

    const res = await fetch(`${API}/api/boards/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      throw new Error("Update failed")
    }

    const result = await res.json()
    return result.board
  },

  async remove(id: number): Promise<void> {
    const token = getToken()
    if (!token) throw new Error("No token")

    const res = await fetch(`${API}/api/boards/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      throw new Error("Delete failed")
    }
  },
}