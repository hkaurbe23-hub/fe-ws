import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateBoardId(): string {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `BRD-${random}`
}


export function generateSerial(): string {
  return Math.floor(100000000 + Math.random() * 900000000).toString()
}


