"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"

export type UserRole = "admin" | "user"

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
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

const MOCK_USER: User = {
  id: "usr_001",
  email: "admin@wattsense.io",
  name: "Admin User",
  role: "admin",
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = typeof window !== "undefined" ? sessionStorage.getItem("ws_user") : null
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        sessionStorage.removeItem("ws_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, _password: string) => {
    setIsLoading(true)
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 800))
    const loggedUser: User = { ...MOCK_USER, email }
    setUser(loggedUser)
    sessionStorage.setItem("ws_user", JSON.stringify(loggedUser))
    setIsLoading(false)
  }, [])

  const loginWithGoogle = useCallback(() => {
    // In production, this would redirect to Google OAuth
    // For demo, simulate a Google sign-in
    const googleUser: User = {
      ...MOCK_USER,
      email: "admin@gmail.com",
      name: "Google Admin",
    }
    setUser(googleUser)
    sessionStorage.setItem("ws_user", JSON.stringify(googleUser))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    sessionStorage.removeItem("ws_user")
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
