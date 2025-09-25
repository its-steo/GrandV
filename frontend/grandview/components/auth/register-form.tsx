"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, UserPlus, Zap, Gift, Users, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { getReferralCodeFromUrl } from "@/lib/auth"

interface RegisterFormProps {
  onToggleMode: () => void
}

export function RegisterForm({ onToggleMode }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    phone_number: "",
    referral_code: "",
  })
  const { register, isLoading } = useAuth()

  useEffect(() => {
    const referralCode = getReferralCodeFromUrl()
    if (referralCode) {
      setFormData((prev) => ({
        ...prev,
        referral_code: referralCode,
      }))
      toast.success(`Referral code ${referralCode} has been applied!`)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.password2) {
      toast.error("Passwords do not match")
      return
    }
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone_number,
        referral_code: formData.referral_code || undefined,
      })
      toast.success("Account Created Successfully! Welcome to GrandView!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed")
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
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <Card className="glass-card w-full max-w-md relative overflow-hidden">
        {/* Animated border glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-secondary via-accent to-primary opacity-20 blur-xl animate-pulse" />

        <CardHeader className="text-center relative z-10">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-secondary to-accent flex items-center justify-center neon-glow">
              <Gift className="h-8 w-8 text-black" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent neon-text">
            Join GrandView
          </CardTitle>
          <CardDescription className="text-muted-foreground text-lg">
            Create your account and start earning money today with our{" "}
            <span className="text-accent font-semibold">amazing platform</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="relative z-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="input-neon h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-neon h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number" className="text-foreground font-medium">
                Phone Number
              </Label>
              <Input
                id="phone_number"
                name="phone_number"
                type="tel"
                placeholder="e.g., +254123456789"
                value={formData.phone_number}
                onChange={handleChange}
                required
                className="input-neon h-11"
              />
              <p className="text-xs text-muted-foreground">Use international format (e.g., +254123456789)</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-neon h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password2" className="text-foreground font-medium">
                  Confirm
                </Label>
                <Input
                  id="password2"
                  name="password2"
                  type="password"
                  placeholder="Confirm"
                  value={formData.password2}
                  onChange={handleChange}
                  required
                  className="input-neon h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referral_code" className="text-foreground font-medium">
                Referral Code
                {formData.referral_code && <span className="text-accent text-xs ml-2">(Auto-filled)</span>}
              </Label>
              <Input
                id="referral_code"
                name="referral_code"
                type="text"
                placeholder="Enter referral code if you have one"
                value={formData.referral_code}
                onChange={handleChange}
                className="input-neon h-11"
                readOnly={!!getReferralCodeFromUrl()}
              />
              {formData.referral_code && getReferralCodeFromUrl() && (
                <p className="text-xs text-accent">Referral code automatically applied from your invitation link</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold btn-neon bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-black transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <button
                onClick={onToggleMode}
                className="text-secondary hover:text-accent font-semibold transition-colors duration-300 neon-text"
              >
                Sign in here
              </button>
            </p>
          </div>

          {/* Feature highlights */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="text-center p-2 rounded-lg bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
              <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">High Earnings</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-gradient-to-r from-secondary/10 to-transparent border border-secondary/20">
              <Users className="h-5 w-5 text-secondary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Referral Bonus</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-gradient-to-r from-accent/10 to-transparent border border-accent/20">
              <Zap className="h-5 w-5 text-accent mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Instant Start</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
