"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { BalanceCards } from "@/components/wallet/balance-cards"
import { DepositForm } from "@/components/wallet/deposit-form"
import { WithdrawalForm } from "@/components/wallet/withdrawal-form"
import { TransactionHistory } from "@/components/wallet/transaction-history"
import { ApiService, type WalletBalance } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { Loader2, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function WalletPage() {
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWalletBalance()
  }, [])

  const fetchWalletBalance = async () => {
    try {
      const balance = await ApiService.getWalletBalance()
      setWalletBalance(balance)
    } catch (error) {
      toast.error("Failed to load wallet balance")
    } finally {
      setLoading(false)
    }
  }

  const handleTransactionSuccess = () => {
    fetchWalletBalance() // Refresh wallet balance
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <Sidebar />
        <div className="md:ml-64 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading wallet...</p>
          </div>
        </div>
      </div>
    )
  }

  const totalBalance = walletBalance
    ? (
        Number.parseFloat(walletBalance.deposit_balance || "0") +
        Number.parseFloat(walletBalance.views_earnings_balance || "0") +
        Number.parseFloat(walletBalance.referral_balance || "0")
      ).toFixed(2)
    : "0.00"

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <Sidebar />
      <div className="md:ml-64 p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Wallet
              </h1>
              <p className="text-muted-foreground">Manage your balances and transactions</p>
            </div>
            <div className="flex items-center gap-4">
              <Card className="glass-card border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">{formatCurrency(totalBalance)}</span>
                </div>
                <p className="text-xs text-green-600">Total Balance</p>
              </Card>
            </div>
          </div>

          {/* Balance Cards */}
          <BalanceCards
            walletBalance={
              walletBalance
                ? {
                    deposit_balance: walletBalance.deposit_balance ?? "0",
                    views_earnings_balance: walletBalance.views_earnings_balance ?? "0",
                    referral_balance: walletBalance.referral_balance ?? "0",
                  }
                : null
            }
          />

          {/* Deposit and Withdrawal Forms */}
          <div className="grid gap-6 lg:grid-cols-2">
            <DepositForm onSuccess={handleTransactionSuccess} />
            <WithdrawalForm
              walletBalance={
                walletBalance
                  ? {
                      deposit_balance: walletBalance.deposit_balance ?? "0",
                      views_earnings_balance: walletBalance.views_earnings_balance ?? "0",
                      referral_balance: walletBalance.referral_balance ?? "0",
                    }
                  : null
              }
              onSuccess={handleTransactionSuccess}
            />
          </div>

          {/* Transaction History */}
          <TransactionHistory />

          {/* Info Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="glass-card border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-blue-800 mb-2">How Your Wallet Works</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>
                    • <strong>Deposit Balance:</strong> Funds you add manually
                  </li>
                  <li>
                    • <strong>Views Earnings:</strong> Money earned from viewing ads
                  </li>
                  <li>
                    • <strong>Referral Earnings:</strong> Commissions from your referrals
                  </li>
                  <li>• You can withdraw from any balance (minimum KSH 50.00)</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="glass-card border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-orange-800 mb-2">Withdrawal Information</h3>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• All withdrawals require admin approval</li>
                  <li>• Processing time: 1-3 business days</li>
                  <li>• Minimum withdrawal amount: KSH 50.00</li>
                  <li>• You'll receive email notifications on status updates</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
