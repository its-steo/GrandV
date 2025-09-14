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
  const [isWithdrawingMain, setIsWithdrawingMain] = useState(false)
  const [isWithdrawingReferral, setIsWithdrawingReferral] = useState(false)

  const mainBalance = walletBalance
    ? (Number.parseFloat(walletBalance.deposit_balance) || 0) +
      (Number.parseFloat(walletBalance.views_earnings_balance) || 0)
    : 0

  const referralBalance = walletBalance ? Number.parseFloat(walletBalance.referral_balance) || 0 : 0

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

    if (withdrawAmount < 5) {
      toast.error("Minimum withdrawal amount is KSH 5.00")
      return
    }

    try {
      setIsWithdrawingMain(true)
      await ApiService.withdrawMain(withdrawAmount)

      toast.success(` ${formatCurrency(withdrawAmount)} withdrawal is pending approval`)

      setMainAmount("")
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

    if (withdrawAmount < 5) {
      toast.error("Minimum withdrawal amount is KSH 5.00")
      return
    }

    try {
      setIsWithdrawingReferral(true)
      await ApiService.withdrawReferral(withdrawAmount)

      toast.success(` ${formatCurrency(withdrawAmount)} referral withdrawal is pending approval`)

      setReferralAmount("")
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
            <TabsTrigger
              value="main"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
            >
              Main Balance
            </TabsTrigger>
            <TabsTrigger
              value="referral"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              Referral Balance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="main" className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-800">Main Balance</span>
              </div>
              <p className="text-sm text-green-700">
                Available: {formatCurrency(mainBalance)} (Deposit + Views Earnings)
              </p>
            </div>

            <form onSubmit={handleMainWithdrawal} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="main-amount">Amount (KSH)</Label>
                <Input
                  id="main-amount"
                  type="number"
                  step="0.01"
                  min="5"
                  max={mainBalance > 0 ? mainBalance : undefined}
                  placeholder="Enter amount to withdraw"
                  value={mainAmount}
                  onChange={(e) => setMainAmount(e.target.value)}
                  className="glass border-white/20"
                  required
                />
                <p className="text-xs text-muted-foreground">Minimum withdrawal: KSH 5.00</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                disabled={isWithdrawingMain || mainBalance < 5}
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
                  min="5"
                  max={referralBalance > 0 ? referralBalance : undefined}
                  placeholder="Enter amount to withdraw"
                  value={referralAmount}
                  onChange={(e) => setReferralAmount(e.target.value)}
                  className="glass border-white/20"
                  required
                />
                <p className="text-xs text-muted-foreground">Minimum withdrawal: KSH 5.00</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                disabled={isWithdrawingReferral || referralBalance < 5}
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
            ℹ️ All withdrawals require admin approval and may take 1-3 business days to process.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
