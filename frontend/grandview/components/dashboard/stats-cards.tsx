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
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="neon-card neon-glow-cyan scale-on-hover float-animation bg-cyan-500 dark:bg-cyan-600 border-cyan-400 dark:border-cyan-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-white">Main Balance</CardTitle>
          <div className="p-1.5 sm:p-2 rounded-lg bg-white/20 border border-white/30">
            <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="text-2xl sm:text-3xl font-bold text-white">{formatCurrency(mainBalance)}</div>
          <p className="text-xs text-white/80 mt-1">Available for withdrawal</p>
          <div className="mt-2 sm:mt-3 h-1 bg-white/30 rounded-full">
            <div className="h-full w-3/4 bg-white rounded-full animate-pulse"></div>
          </div>
        </CardContent>
      </Card>

      <Card
        className="neon-card neon-glow-pink scale-on-hover float-animation bg-pink-500 dark:bg-pink-600 border-pink-400 dark:border-pink-500"
        style={{ animationDelay: "0.2s" }}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-white">Views Earnings</CardTitle>
          <div className="p-1.5 sm:p-2 rounded-lg bg-white/20 border border-white/30">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="text-2xl sm:text-3xl font-bold text-white">
            {formatCurrency(walletBalance?.views_earnings_balance || "0.00")}
          </div>
          <p className="text-xs text-white/80 mt-1">From ad views</p>
          <div className="mt-2 sm:mt-3 h-1 bg-white/30 rounded-full">
            <div className="h-full w-2/3 bg-white rounded-full animate-pulse"></div>
          </div>
        </CardContent>
      </Card>

      <Card
        className="neon-card neon-glow-green scale-on-hover float-animation bg-green-500 dark:bg-green-600 border-green-400 dark:border-green-500"
        style={{ animationDelay: "0.4s" }}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-white">Agent Balance</CardTitle>
          <div className="p-1.5 sm:p-2 rounded-lg bg-white/20 border border-white/30">
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="text-2xl sm:text-3xl font-bold text-white">
            {formatCurrency(walletBalance?.referral_balance || "0.00")}
          </div>
          <p className="text-xs text-white/80 mt-1">From Advertisements</p>
          <div className="mt-2 sm:mt-3 h-1 bg-white/30 rounded-full">
            <div className="h-full w-1/2 bg-white rounded-full animate-pulse"></div>
          </div>
        </CardContent>
      </Card>

      <Card
        className="neon-card neon-glow-purple scale-on-hover float-animation bg-purple-500 dark:bg-purple-600 border-purple-400 dark:border-purple-500"
        style={{ animationDelay: "0.6s" }}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-white">Deposit Balance</CardTitle>
          <div className="p-1.5 sm:p-2 rounded-lg bg-white/20 border border-white/30">
            <Package className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="text-2xl sm:text-3xl font-bold text-white">
            {formatCurrency(walletBalance?.deposit_balance || "0.00")}
          </div>
          <p className="text-xs text-white/80 mt-1">Available funds</p>
          <div className="mt-2 sm:mt-3 h-1 bg-white/30 rounded-full">
            <div className="h-full w-5/6 bg-white rounded-full animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
