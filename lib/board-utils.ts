export function generateBoardId() {
  return "BRD-" + Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function generateSerial() {
  return Math.floor(100000000 + Math.random() * 900000000).toString()
}

