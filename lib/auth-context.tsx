"use client"

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react"

export type UserRole = "admin" | "user"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

const API = process.env.NEXT_PUBLIC_API_URL

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 🔁 Restore user from localStorage on refresh
  useEffect(() => {
    if (typeof window === "undefined") return

    const token = localStorage.getItem("jwtToken")
    const email = localStorage.getItem("userEmail")
    const role = localStorage.getItem("userRole") as UserRole | null

    if (token && email && role) {
      setUser({
        id: email,
        email,
        name: email,
        role,
      })
    }

    setIsLoading(false)
  }, [])

  // 🔐 Manual Login (Backend)
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)

    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      setIsLoading(false)
      throw new Error("Invalid credentials")
    }

    const data = await res.json()

    // ✅ Save JWT + role
    localStorage.setItem("jwtToken", data.token)
    localStorage.setItem("userEmail", data.user.email)
    localStorage.setItem("userRole", data.user.role)

    const loggedUser: User = {
      id: data.user.email,
      email: data.user.email,
      name: data.user.email,
      role: data.user.role,
    }

    setUser(loggedUser)
    setIsLoading(false)
  }, [])

  // 🌐 Google handled via NextAuth
  const loginWithGoogle = useCallback(() => {
    // Google login handled separately
  }, [])

  // 🚪 Logout
  const logout = useCallback(() => {
    localStorage.removeItem("jwtToken")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userRole")
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}