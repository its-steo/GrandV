"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, LogIn,TrendingUp, Users, Shield } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

interface LoginFormProps {
  onToggleMode: () => void
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const { login, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(formData)
      toast.success("Welcome back!", {
        description: "Successfully signed in to your account",
      })
    } catch (error) {
      toast.error("Sign in failed", {
        description: error instanceof Error ? error.message : "Please check your credentials",
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <Card className="bg-gray-800/90 backdrop-blur-xl border-gray-700 shadow-2xl hover:shadow-3xl transition-all duration-300">
        <CardHeader className="text-center pb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center justify-center mb-2"
          >
            <img src="/images/grandvlogo.png" alt="Grandview Logo" className="w-60 h-auto" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <CardTitle className="text-3xl font-bold text-white mb-2">
              Welcome to Grandview
            </CardTitle>
            <CardDescription className="text-gray-300 text-base">
              Sign in to your <span className="font-semibold text-cyan-300">Grandview account</span>
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <Label htmlFor="username" className="text-gray-200 font-medium">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                required
                className="h-12 border-gray-600 focus:border-cyan-400 focus:ring-cyan-400/20 bg-gray-700/50 text-white placeholder-gray-400"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <Label htmlFor="password" className="text-gray-200 font-medium">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className="h-12 border-gray-600 focus:border-cyan-400 focus:ring-cyan-400/20 bg-gray-700/50 text-white placeholder-gray-400"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-500 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center pt-4"
          >
            <p className="text-gray-300">
              Dont have an account?{" "}
              <button
                onClick={onToggleMode}
                className="text-cyan-300 hover:text-cyan-400 font-semibold transition-colors"
              >
                Create account
              </button>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-700"
          >
            {[
              { icon: TrendingUp, text: "Advanced Analytics", color: "text-cyan-300" },
              { icon: Users, text: "Team Management", color: "text-blue-300" },
              { icon: Shield, text: "Secure Platform", color: "text-white" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="text-center p-3 rounded-lg bg-gray-700/50 border border-gray-600 hover:border-cyan-300/50 transition-all"
              >
                <feature.icon className={`h-5 w-5 ${feature.color} mx-auto mb-2`} />
                <p className="text-xs text-gray-300 font-medium">{feature.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}