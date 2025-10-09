"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, UserPlus,Users, TrendingUp, Zap } from "lucide-react"
import { toast } from "sonner"
import { getReferralCodeFromUrl } from "@/lib/auth"
import { motion } from "framer-motion"

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
      toast.success(`Referral code ${referralCode} applied!`)
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
      toast.success("Account created successfully!", {
        description: "Welcome to AdConnect Pro!",
      })
    } catch (error) {
      toast.error("Registration failed", {
        description: error instanceof Error ? error.message : "Please try again",
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
              Join Grandview
            </CardTitle>
            <CardDescription className="text-gray-300 text-base">
              Create your account and start advertising with our{" "}
              <span className="font-semibold text-cyan-300">professional platform</span>
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="username" className="text-gray-200 font-medium text-sm">
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
                  className="h-10 border-gray-600 focus:border-cyan-400 focus:ring-cyan-400/20 bg-gray-700/50 text-white placeholder-gray-400"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="email" className="text-gray-200 font-medium text-sm">
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
                  className="h-10 border-gray-600 focus:border-cyan-400 focus:ring-cyan-400/20 bg-gray-700/50 text-white placeholder-gray-400"
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <Label htmlFor="phone_number" className="text-gray-200 font-medium text-sm">
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
                className="h-10 border-gray-600 focus:border-cyan-400 focus:ring-cyan-400/20 bg-gray-700/50 text-white placeholder-gray-400"
              />
              <p className="text-xs text-gray-400">International format (e.g., +254123456789)</p>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-2"
              >
                <Label htmlFor="password" className="text-gray-200 font-medium text-sm">
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
                  className="h-10 border-gray-600 focus:border-cyan-400 focus:ring-cyan-400/20 bg-gray-700/50 text-white placeholder-gray-400"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-2"
              >
                <Label htmlFor="password2" className="text-gray-200 font-medium text-sm">
                  Confirm Password
                </Label>
                <Input
                  id="password2"
                  name="password2"
                  type="password"
                  placeholder="Confirm"
                  value={formData.password2}
                  onChange={handleChange}
                  required
                  className="h-10 border-gray-600 focus:border-cyan-400 focus:ring-cyan-400/20 bg-gray-700/50 text-white placeholder-gray-400"
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-2"
            >
              <Label htmlFor="referral_code" className="text-gray-200 font-medium text-sm">
                Agent Code
                {formData.referral_code && <span className="text-cyan-300 text-xs ml-2">(Applied)</span>}
              </Label>
              <Input
                id="referral_code"
                name="referral_code"
                type="text"
                placeholder="Enter Agent code (optional)"
                value={formData.referral_code}
                onChange={handleChange}
                className="h-10 border-gray-600 focus:border-cyan-400 focus:ring-cyan-400/20 bg-gray-700/50 text-white placeholder-gray-400"
                readOnly={!!getReferralCodeFromUrl()}
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-500 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
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
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-center pt-4"
          >
            <p className="text-gray-300">
              Already have an account?{" "}
              <button
                onClick={onToggleMode}
                className="text-cyan-300 hover:text-cyan-400 font-semibold transition-colors"
              >
                Sign in here
              </button>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1}}
            className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-700"
          >
            {[
              { icon: TrendingUp, text: "High ROI", color: "text-cyan-300" },
              { icon: Users, text: "Team Bonus", color: "text-blue-300" },
              { icon: Zap, text: "Quick Start", color: "text-white" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="text-center p-2 rounded-lg bg-gray-700/50 border border-gray-600 hover:border-cyan-300/50 transition-all"
              >
                <feature.icon className={`h-4 w-4 ${feature.color} mx-auto mb-1`} />
                <p className="text-xs text-gray-300 font-medium">{feature.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}