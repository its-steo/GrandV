"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, TrendingUp, Users, Plus } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface BalanceCardsProps {
  walletBalance: {
    deposit_balance: string
    views_earnings_balance: string
    referral_balance: string
  } | null
}

export function BalanceCards({ walletBalance }: BalanceCardsProps) {
  const balances = [
    {
      title: "Deposit Balance",
      value: walletBalance?.deposit_balance || "0.00",
      icon: Plus,
      gradient: "from-blue-600 to-cyan-600",
      description: "Funds you've deposited",
    },
    {
      title: "Views Earnings",
      value: walletBalance?.views_earnings_balance || "0.00",
      icon: TrendingUp,
      gradient: "from-green-600 to-lime-600",
      description: "Earned from viewing ads",
    },
    {
      title: "Agent Earnings",
      value: walletBalance?.referral_balance || "0.00",
      icon: Users,
      gradient: "from-purple-600 to-pink-600",
      description: "Earned from advertisements",
    },
  ]

  const totalBalance = walletBalance
    ? (
        Number.parseFloat(walletBalance.deposit_balance || "0") +
        Number.parseFloat(walletBalance.views_earnings_balance || "0") +
        Number.parseFloat(walletBalance.referral_balance || "0")
      ).toFixed(2)
    : "0.00"

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 border-white/20 neon-glow animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl text-white">
            <Wallet className="h-6 w-6 text-white" />
            Total Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-4xl font-bold bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
            {formatCurrency(totalBalance)}
          </div>
          <p className="text-white/80 mt-2">Available across all balances</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {balances.map((balance) => (
          <Card
            key={balance.title}
            className={`bg-gradient-to-r ${balance.gradient} border-white/20 scale-on-hover neon-glow animate-slide-up`}
            style={{ animationDelay: `${balances.indexOf(balance) * 0.2}s` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">{balance.title}</CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-r ${balance.gradient}`}>
                <balance.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(balance.value)}</div>
              <p className="text-xs text-white/80 mt-1">{balance.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}