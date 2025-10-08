"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, TrendingUp, Users, CreditCard, ArrowUpRight, ArrowDownRight } from "lucide-react"
import type { WalletBalance } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { motion } from "framer-motion"

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
      title: "Total Balance",
      value: mainBalance,
      icon: Wallet,
      bgColor: "bg-blue-600",
      description: "Available for withdrawal",
      change: "+12.5%",
      changeType: "positive" as const,
      trend: [65, 78, 82, 95, 88, 92, 100],
      solidColor: "bg-blue-600",
    },
    {
      title: "Ad Earnings",
      value: walletBalance?.views_earnings_balance || "0.00",
      icon: TrendingUp,
      bgColor: "bg-green-500",
      description: "From advertisement views",
      change: "+8.2%",
      changeType: "positive" as const,
      trend: [45, 52, 48, 61, 69, 74, 78],
      solidColor: "bg-green-500",
    },
    {
      title: "Agent Bonus",
      value: walletBalance?.referral_balance || "0.00",
      icon: Users,
      bgColor: "bg-pink-600",
      description: "From Advertisements bonuses",
      change: "+15.3%",
      changeType: "positive" as const,
      trend: [20, 25, 30, 28, 35, 42, 48],
      solidColor: "bg-pink-600",
    },
    {
      title: "Deposit Balance",
      value: walletBalance?.deposit_balance || "0.00",
      icon: CreditCard,
      bgColor: "bg-orange-500",
      description: "Available deposit funds",
      change: "-2.1%",
      changeType: "negative" as const,
      trend: [100, 95, 98, 92, 88, 85, 82],
      solidColor: "bg-orange-500",
    },
  ]

  const MiniChart = ({ data, positive }: { data: number[]; positive: boolean }) => {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min

    return (
      <div className="flex items-end gap-0.5 h-8 w-16">
        {data.map((value, index) => {
          const height = range === 0 ? 50 : ((value - min) / range) * 100
          return (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(height, 10)}%` }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className={`flex-1 rounded-sm ${positive ? "bg-green-400" : "bg-orange-400"}`}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          whileHover={{ scale: 1.05, y: -8 }}
          className="group"
        >
          <Card
            className={`${stat.bgColor} border-0 transition-all duration-300 overflow-hidden relative backdrop-blur-sm`}
          >
            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all duration-300"></div>

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <div className="space-y-1">
                <CardTitle className="text-sm font-bold text-white/95">{stat.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                    className="w-8 h-8 rounded-lg bg-white/25 backdrop-blur-sm flex items-center justify-center border border-white/40"
                  >
                    <stat.icon className="h-4 w-4 text-white" />
                  </motion.div>
                  <Badge
                    className={`text-xs font-bold ${stat.changeType === "positive" ? "bg-white/25 text-white" : "bg-white/25 text-white"} border border-white/40 backdrop-blur-sm`}
                  >
                    {stat.changeType === "positive" ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {stat.change}
                  </Badge>
                </div>
              </div>
              <MiniChart data={stat.trend} positive={stat.changeType === "positive"} />
            </CardHeader>

            <CardContent className="relative z-10 pt-0">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
                className="space-y-2"
              >
                <div className="text-3xl font-bold text-white drop-shadow-lg">{formatCurrency(stat.value)}</div>
                <p className="text-sm text-white/85 font-medium">{stat.description}</p>
              </motion.div>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: index * 0.1 + 0.7, duration: 1 }}
                className="mt-4 h-2 bg-white/35 rounded-full overflow-hidden backdrop-blur-sm"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((Number.parseFloat(stat.value) / 1000) * 100, 100)}%` }}
                  transition={{ delay: index * 0.1 + 0.8, duration: 1.2 }}
                  className="h-full bg-white/70 rounded-full shadow-sm"
                />
              </motion.div>
            </CardContent>

            <motion.div
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent"
            />
          </Card>
        </motion.div>
      ))}
    </div>
  )
}