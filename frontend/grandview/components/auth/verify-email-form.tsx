"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Loader2, CheckCircle2, AlertCircle, Mail } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

interface VerifyEmailFormProps {
  email: string
}

export function VerifyEmailForm({ email }: VerifyEmailFormProps) {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      //const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://grandview-shop.onrender.com/api"
      const token = localStorage.getItem("auth_token")

      const response = await fetch(`${API_BASE_URL}/accounts/users/verify-email/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Token ${token}` }),
        },
        body: JSON.stringify({
          verification_code: code,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.verification_code?.[0] || data.non_field_errors?.[0] || "Invalid verification code")
        setCode("")
        return
      }

      setIsVerified(true)
      toast.success("Email verified successfully!")

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsLoading(true)
    try {
      //const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://grandview-shop.onrender.com/api"
      const token = localStorage.getItem("auth_token")

      const response = await fetch(`${API_BASE_URL}/accounts/users/verify-email/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Token ${token}` }),
        },
        body: JSON.stringify({ resend: true }),
      })

      if (response.ok) {
        toast.success("Verification code sent to your email!")
      } else {
        const data = await response.json()
        toast.error(data.message || data.error || "Failed to resend code")
      }
    } catch (err) {
      toast.error("An error occurred")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerified) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gray-800/90 backdrop-blur-xl border-gray-700 shadow-2xl">
          <CardContent className="pt-12 pb-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <CheckCircle2 className="h-16 w-16 text-cyan-400" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">Account Verified!</h3>
            <p className="text-gray-300">Redirecting you to your dashboard...</p>
          </CardContent>
        </Card>
      </motion.div>
    )
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
            <CardTitle className="text-3xl font-bold text-white mb-2">Verify Your Email</CardTitle>
            <CardDescription className="text-gray-300 text-base">
              Enter the 6-digit code sent to <span className="text-cyan-300">{email}</span>
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center mb-8"
          >
            <Mail className="h-12 w-12 text-cyan-400" />
          </motion.div>

          <form onSubmit={handleVerify} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center"
            >
              <InputOTP maxLength={6} value={code} onChange={setCode} disabled={isLoading} className="gap-2">
                <InputOTPGroup className="gap-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="h-14 w-12 text-2xl font-bold border-2 border-gray-600 rounded-lg bg-gray-700/50 text-white focus:border-cyan-400 focus:ring-cyan-400/20 transition-all"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30"
              >
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm font-medium">{error}</p>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-500 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={isLoading || code.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Verify Code
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center pt-4 border-t border-gray-700"
          >
            <p className="text-gray-400 text-sm mb-3">Did not receive the code?</p>
            <button
              onClick={handleResendCode}
              disabled={isLoading}
              className="text-cyan-300 hover:text-cyan-400 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Resend verification code
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30"
          >
            <p className="text-blue-300 text-xs text-center">
              Check your email for the 6-digit verification code. It may take a few moments to arrive.
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}