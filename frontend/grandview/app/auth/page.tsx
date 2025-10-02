"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-600/30 to-cyan-400">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <p className="text-white text-lg font-medium">Verifying your session...</p>
        </motion.div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-900 via-blue-600/30 to-cyan-400 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {isLogin ? (
          <LoginForm onToggleMode={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onToggleMode={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  )
}