"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, LogIn, Zap, Eye } from "lucide-react"
import { toast } from "sonner"

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
      toast.success("Login Successful", {
        description: "Welcome back! Redirecting to dashboard...",
      })
    } catch (error) {
      toast.error("Login Failed", {
        description: error instanceof Error ? error.message : "Invalid credentials",
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
    <div className="relative">
      {/* Floating particles background */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <Card className="glass-card w-full max-w-md relative overflow-hidden">
        {/* Animated border glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-20 blur-xl animate-pulse" />

        <CardHeader className="text-center relative z-10">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center neon-glow">
              <Zap className="h-8 w-8 text-black" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent neon-text">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-muted-foreground text-lg">
            Sign in to your account and start earning with <span className="text-primary font-semibold">GrandView</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground font-medium">
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
                className="input-neon h-12 text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
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
                className="input-neon h-12 text-lg"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold btn-neon bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-black transition-all duration-300"
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
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Dont have an account?{" "}
              <button
                onClick={onToggleMode}
                className="text-primary hover:text-secondary font-semibold transition-colors duration-300 neon-text"
              >
                Sign up here
              </button>
            </p>
          </div>

          {/* Feature highlights */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
              <Eye className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Earn by viewing ads</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-gradient-to-r from-secondary/10 to-transparent border border-secondary/20">
              <Zap className="h-6 w-6 text-secondary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Instant withdrawals</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
