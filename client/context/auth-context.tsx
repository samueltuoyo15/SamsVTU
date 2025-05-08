"use client"
import { createContext, useContext, useState, useEffect } from "react"

type User = {
  id: string
  fullName: string
  username: string
  email: string
  phone?: string
  profilePicture?: string
  address?: string
  isVerified?: boolean
  createdAt?: string
  token?: string
}

type AuthContextType = {
  user: User | null
  login: (userData: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("auth-user")
    if (stored) {
      setUser(JSON.parse(stored))
    }
  }, [])

  const login = (userData: User) => {
    localStorage.setItem("auth-user", JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem("auth-user")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}