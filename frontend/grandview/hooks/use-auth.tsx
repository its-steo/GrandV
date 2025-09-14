"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { AuthService, type User, type LoginData, type RegisterData } from "@/lib/auth"
import { toast } from "sonner"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (data: LoginData) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = AuthService.getToken()
    const savedUser = AuthService.getUser()
    if (token && savedUser) {
      setUser(savedUser)
    }
    setIsLoading(false)
  }, [])

  const login = async (data: LoginData) => {
    try {
      setIsLoading(true)
      const response = await AuthService.login(data)
      setUser(response.user)
      toast.success(`Welcome back, ${response.user.username}!`)
    } catch (error) {
      throw error // Handled in form
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true)
      const response = await AuthService.register(data)
      setUser(response.user)
      toast.success(`Welcome ${response.user.username}! Your referral code: ${response.user.referral_code}`)
    } catch (error) {
      throw error // Handled in form
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    AuthService.logout()
    setUser(null)
    toast.success("You have been successfully logged out")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
