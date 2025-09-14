"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, UserPlus } from "lucide-react"
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
    <Card className="glass-card w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
          Join GrandView
        </CardTitle>
        <CardDescription>Create your account and start earning today</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              required
              className="glass border-white/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="glass border-white/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              name="phone_number"
              type="tel"
              placeholder="e.g., +254123456789"
              value={formData.phone_number}
              onChange={handleChange}
              required
              className="glass border-white/20"
            />
            <p className="text-xs text-muted-foreground">Use international format (e.g., +254123456789)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
              className="glass border-white/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password2">Confirm Password</Label>
            <Input
              id="password2"
              name="password2"
              type="password"
              placeholder="Confirm your password"
              value={formData.password2}
              onChange={handleChange}
              required
              className="glass border-white/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="referral_code">
              Referral Code
              {formData.referral_code && <span className="text-green-500 text-xs ml-2">(Auto-filled)</span>}
            </Label>
            <Input
              id="referral_code"
              name="referral_code"
              type="text"
              placeholder="Enter referral code if you have one"
              value={formData.referral_code}
              onChange={handleChange}
              className="glass border-white/20"
              readOnly={!!getReferralCodeFromUrl()}
            />
            {formData.referral_code && getReferralCodeFromUrl() && (
              <p className="text-xs text-green-400">Referral code automatically applied from your invitation link</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 transition-all duration-300"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={onToggleMode}
              className="text-secondary hover:text-secondary/80 font-medium transition-colors"
            >
              Sign in here
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
