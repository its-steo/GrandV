"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Minus, Loader2, TrendingDown, Users } from "lucide-react"
import { ApiService } from "@/lib/api"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

interface WithdrawalFormProps {
  walletBalance: {
    deposit_balance: string
    views_earnings_balance: string
    referral_balance: string
  } | null
  onSuccess: () => void
}

export function WithdrawalForm({ walletBalance, onSuccess }: WithdrawalFormProps) {
  const [mainAmount, setMainAmount] = useState("")
  const [referralAmount, setReferralAmount] = useState("")
  const [mainMpesaNumber, setMainMpesaNumber] = useState("")
  const [referralMpesaNumber, setReferralMpesaNumber] = useState("")
  const [isWithdrawingMain, setIsWithdrawingMain] = useState(false)
  const [isWithdrawingReferral, setIsWithdrawingReferral] = useState(false)

  const mainBalance = walletBalance
    ? (Number.parseFloat(walletBalance.deposit_balance) || 0) +
      (Number.parseFloat(walletBalance.views_earnings_balance) || 0)
    : 0

  const referralBalance = walletBalance ? Number.parseFloat(walletBalance.referral_balance) || 0 : 0

  const validateMpesaNumber = (number: string) => {
    return number.match(/^254\d{9}$/)
  }

  const handleMainWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault()

    const withdrawAmount = Number.parseFloat(mainAmount)
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast.error("Please enter a valid amount greater than 0")
      return
    }

    if (withdrawAmount > mainBalance) {
      toast.error(`You can only withdraw up to ${formatCurrency(mainBalance)}`)
      return
    }

    if (withdrawAmount < 50) {
      toast.error("Minimum withdrawal amount is KSH 50.00")
      return
    }

    if (!validateMpesaNumber(mainMpesaNumber)) {
      toast.error("Please enter a valid M-Pesa number (254xxxxxxxxx)")
      return
    }

    try {
      setIsWithdrawingMain(true)
      const payload = {
        amount: withdrawAmount,
        mpesa_number: mainMpesaNumber,
      }
      const response = await ApiService.withdrawMain(payload)
      toast.success(
        response.message ||
          `Withdrawal of ${formatCurrency(withdrawAmount)} is pending approval. You'll receive an email once processed.`,
      )

      setMainAmount("")
      setMainMpesaNumber("")
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to process withdrawal")
    } finally {
      setIsWithdrawingMain(false)
    }
  }

  const handleReferralWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault()

    const withdrawAmount = Number.parseFloat(referralAmount)
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast.error("Please enter a valid amount greater than 0")
      return
    }

    if (withdrawAmount > referralBalance) {
      toast.error(`You can only withdraw up to ${formatCurrency(referralBalance)}`)
      return
    }

    if (withdrawAmount < 50) {
      toast.error("Minimum withdrawal amount is KSH 50.00")
      return
    }

    if (!validateMpesaNumber(referralMpesaNumber)) {
      toast.error("Please enter a valid M-Pesa number (254xxxxxxxxx)")
      return
    }

    try {
      setIsWithdrawingReferral(true)
      const payload = {
        amount: withdrawAmount,
        mpesa_number: referralMpesaNumber,
      }
      const response = await ApiService.withdrawReferral(payload)
      toast.success(
        response.message ||
          `Referral withdrawal of ${formatCurrency(withdrawAmount)} is pending approval. You'll receive an email once processed.`,
      )

      setReferralAmount("")
      setReferralMpesaNumber("")
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to process withdrawal")
    } finally {
      setIsWithdrawingReferral(false)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Minus className="h-6 w-6 text-orange-400" />
          <span className="font-bold">Withdraw Funds</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="main" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 glass-card border-white/20">
            <TabsTrigger value="main" className="bg-green-500/20 hover:bg-green-500/30 text-white">
              Main Balance
            </TabsTrigger>
            <TabsTrigger value="referral" className="bg-purple-500/20 hover:bg-purple-500/30 text-white">
              Agent Balance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="main" className="space-y-4">
            <div className="glass-card border-white/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5 text-green-400" />
                <span className="font-semibold text-white text-lg">Main Balance</span>
              </div>
              <p className="text-gray-300 font-medium">Available: {formatCurrency(mainBalance)}</p>
            </div>

            <form onSubmit={handleMainWithdrawal} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="main-amount" className="text-white font-medium">
                  Amount (KSH)
                </Label>
                <Input
                  id="main-amount"
                  type="number"
                  step="0.01"
                  min="50"
                  max={mainBalance > 0 ? mainBalance : undefined}
                  placeholder="Enter amount to withdraw"
                  value={mainAmount}
                  onChange={(e) => setMainAmount(e.target.value)}
                  className="glass-card border-white/20 text-white placeholder:text-gray-300 text-lg"
                  required
                />
                <p className="text-xs text-gray-300">Minimum withdrawal: KSH 50.00</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="main-mpesa" className="text-white font-medium">
                  M-Pesa Number
                </Label>
                <Input
                  id="main-mpesa"
                  type="text"
                  placeholder="254xxxxxxxxx"
                  value={mainMpesaNumber}
                  onChange={(e) => setMainMpesaNumber(e.target.value)}
                  className="glass-card border-white/20 text-white placeholder:text-gray-300 text-lg"
                  required
                />
                <p className="text-xs text-gray-300">Enter your M-Pesa number (254xxxxxxxxx)</p>
              </div>
              <Button
                type="submit"
                className="w-full bg-green-500 text-white hover:bg-green-600 text-lg py-6 font-semibold"
                disabled={isWithdrawingMain || mainBalance < 50}
              >
                {isWithdrawingMain ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-5 w-5 mr-2" />
                    Withdraw {formatCurrency(mainAmount || "0.00")}
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="referral" className="space-y-4">
            <div className="glass-card border-white/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-purple-400" />
                <span className="font-semibold text-white text-lg">Agent Balance</span>
              </div>
              <p className="text-gray-300 font-medium">Available: {formatCurrency(referralBalance)}</p>
            </div>

            <form onSubmit={handleReferralWithdrawal} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="referral-amount" className="text-white font-medium">
                  Amount (KSH)
                </Label>
                <Input
                  id="referral-amount"
                  type="number"
                  step="0.01"
                  min="50"
                  max={referralBalance > 0 ? referralBalance : undefined}
                  placeholder="Enter amount to withdraw"
                  value={referralAmount}
                  onChange={(e) => setReferralAmount(e.target.value)}
                  className="glass-card border-white/20 text-white placeholder:text-gray-300 text-lg"
                  required
                />
                <p className="text-xs text-gray-300">Minimum withdrawal: KSH 50.00 (5% fee for marketers)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="referral-mpesa" className="text-white font-medium">
                  M-Pesa Number
                </Label>
                <Input
                  id="referral-mpesa"
                  type="text"
                  placeholder="254xxxxxxxxx"
                  value={referralMpesaNumber}
                  onChange={(e) => setReferralMpesaNumber(e.target.value)}
                  className="glass-card border-white/20 text-white placeholder:text-gray-300 text-lg"
                  required
                />
                <p className="text-xs text-gray-300">Enter your M-Pesa number (254xxxxxxxxx)</p>
              </div>
              <Button
                type="submit"
                className="w-full bg-purple-500 text-white hover:bg-purple-600 text-lg py-6 font-semibold"
                disabled={isWithdrawingReferral || referralBalance < 50}
              >
                {isWithdrawingReferral ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Users className="h-5 w-5 mr-2" />
                    Withdraw {formatCurrency(referralAmount || "0.00")}
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 glass-card border-white/20">
          <p className="text-sm text-gray-300">
            ℹ️ All withdrawals require admin approval (1-3 business days). You will receive an email once processed.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
