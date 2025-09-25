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

  const stats = [
    {
      title: "Main Balance",
      value: mainBalance,
      icon: Wallet,
      gradient: "from-cyan-500 to-cyan-600",
      description: "Available for withdrawal",
    },
    {
      title: "Views Earnings",
      value: walletBalance?.views_earnings_balance || "0.00",
      icon: TrendingUp,
      gradient: "from-pink-500 to-pink-600",
      description: "From ad views",
    },
    {
      title: "Agent Balance",
      value: walletBalance?.referral_balance || "0.00",
      icon: Users,
      gradient: "from-green-500 to-green-600",
      description: "From Advertisements",
    },
    {
      title: "Deposit Balance",
      value: walletBalance?.deposit_balance || "0.00",
      icon: Package,
      gradient: "from-purple-500 to-purple-600",
      description: "Available funds",
    },
  ]

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="glass-card border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.gradient}`}>
              <stat.icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stat.value)}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
