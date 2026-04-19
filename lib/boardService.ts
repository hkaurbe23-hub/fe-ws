const API = "https://api.wattsense.in/api"

export async function getBoardsByFloor(floorId: number) {
  try {
    const res = await fetch(`${API}/boards`, {
      cache: "no-store"
    })

    if (!res.ok) {
      throw new Error("Failed to fetch boards")
    }

    const data = await res.json()

    return data.filter(
      (board: any) => Number(board.floor_id) === Number(floorId)
    )

  } catch (err) {
    console.error("Board fetch error:", err)
    return []
  }
}