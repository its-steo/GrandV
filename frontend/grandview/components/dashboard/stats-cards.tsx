"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, TrendingUp, Package, Users } from "lucide-react"
import type { WalletBalance } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"

interface StatsCardsProps {
  walletBalance: WalletBalance | null
}

export function StatsCards({ walletBalance }: StatsCardsProps) {
  const mainBalance = walletBalance
    ? (
        Number.parseFloat(walletBalance.deposit_balance || "0") +
        Number.parseFloat(walletBalance.views_earnings_balance || "0")
      ).toFixed(2)
    : "0.00"

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="glass-card border-white/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Main Balance</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{formatCurrency(mainBalance)}</div>
          <p className="text-xs text-muted-foreground">Available for withdrawal</p>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Views Earnings</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-secondary">
             {formatCurrency(walletBalance?.views_earnings_balance || "0.00")}
          </div>
          <p className="text-xs text-muted-foreground">From ad views</p>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Referral Balance</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">
             {formatCurrency(walletBalance?.referral_balance || "0.00")}
          </div>
          <p className="text-xs text-muted-foreground">From referrals</p>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Deposit Balance</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-chart-3">
            {formatCurrency(walletBalance?.deposit_balance || "0.00")}
          </div>
          <p className="text-xs text-muted-foreground">Available funds</p>
        </CardContent>
      </Card>
    </div>
  )
}
