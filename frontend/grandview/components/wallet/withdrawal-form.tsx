// Updated withdrawal-form.tsx to add mpesa_number input
"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Minus, Loader2, TrendingDown, Users} from "lucide-react"
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
        mpesa_number: mainMpesaNumber
      }
      const response = await ApiService.withdrawMain(payload)
      toast.success(response.message || `Withdrawal of ${formatCurrency(withdrawAmount)} is pending approval. You'll receive an email once processed.`)

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
        mpesa_number: referralMpesaNumber
      }
      const response = await ApiService.withdrawReferral(payload)
      toast.success(response.message || `Referral withdrawal of ${formatCurrency(withdrawAmount)} is pending approval. You'll receive an email once processed.`)

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
    <Card className="glass-card border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Minus className="h-5 w-5 text-orange-500" />
          Withdraw Funds
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="main" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 glass">
            <TabsTrigger value="main">Main Balance</TabsTrigger>
            <TabsTrigger value="referral">Referral Balance</TabsTrigger>
          </TabsList>

          <TabsContent value="main" className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-800">Main Balance</span>
              </div>
              <p className="text-sm text-green-700">Available: {formatCurrency(mainBalance)}</p>
            </div>

            <form onSubmit={handleMainWithdrawal} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="main-amount">Amount (KSH)</Label>
                <Input
                  id="main-amount"
                  type="number"
                  step="0.01"
                  min="50"
                  max={mainBalance > 0 ? mainBalance : undefined}
                  placeholder="Enter amount to withdraw"
                  value={mainAmount}
                  onChange={(e) => setMainAmount(e.target.value)}
                  className="glass border-white/20"
                  required
                />
                <p className="text-xs text-muted-foreground">Minimum withdrawal: KSH 50.00</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="main-mpesa">M-Pesa Number</Label>
                <Input
                  id="main-mpesa"
                  type="text"
                  placeholder="254xxxxxxxxx"
                  value={mainMpesaNumber}
                  onChange={(e) => setMainMpesaNumber(e.target.value)}
                  className="glass border-white/20"
                  required
                />
                <p className="text-xs text-muted-foreground">Enter your M-Pesa number (254xxxxxxxxx)</p>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                disabled={isWithdrawingMain || mainBalance < 50}
              >
                {isWithdrawingMain ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 mr-2" />
                    Withdraw {formatCurrency(mainAmount || "0.00")}
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="referral" className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="font-semibold text-purple-800">Referral Balance</span>
              </div>
              <p className="text-sm text-purple-700">Available: {formatCurrency(referralBalance)}</p>
            </div>

            <form onSubmit={handleReferralWithdrawal} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="referral-amount">Amount (KSH)</Label>
                <Input
                  id="referral-amount"
                  type="number"
                  step="0.01"
                  min="50"
                  max={referralBalance > 0 ? referralBalance : undefined}
                  placeholder="Enter amount to withdraw"
                  value={referralAmount}
                  onChange={(e) => setReferralAmount(e.target.value)}
                  className="glass border-white/20"
                  required
                />
                <p className="text-xs text-muted-foreground">Minimum withdrawal: KSH 50.00 (5% fee for marketers)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="referral-mpesa">M-Pesa Number</Label>
                <Input
                  id="referral-mpesa"
                  type="text"
                  placeholder="254xxxxxxxxx"
                  value={referralMpesaNumber}
                  onChange={(e) => setReferralMpesaNumber(e.target.value)}
                  className="glass border-white/20"
                  required
                />
                <p className="text-xs text-muted-foreground">Enter your M-Pesa number (254xxxxxxxxx)</p>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                disabled={isWithdrawingReferral || referralBalance < 50}
              >
                {isWithdrawingReferral ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Withdraw {formatCurrency(referralAmount || "0.00")}
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-700">
            ℹ️ All withdrawals require admin approval (1-3 business days). You will receive an email once processed.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}