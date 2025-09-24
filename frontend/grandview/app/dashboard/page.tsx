"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Sidebar } from "@/components/layout/sidebar"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { FeaturedProducts } from "@/components/dashboard/featured-products"
import { ApiService, type WalletBalance } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Package, Eye, Users } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null)

  useEffect(() => {
    fetchWalletBalance()
  }, [])

  const fetchWalletBalance = async () => {
    try {
      const balance = await ApiService.getWalletBalance()
      setWalletBalance(balance)
    } catch (error) {
      console.error("Failed to fetch wallet balance:", error)
    }
  }

  return (
    <div className="min-h-screen">
      <Sidebar />

      <div className="lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          <div className="flex flex-col gap-2 sm:gap-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold rainbow-text animate-pulse">
              Welcome back, {user?.username}! ✨
            </h1>
            <p className="text-base sm:text-lg bright-text-purple font-medium">
              Here is what is happening with your account today.
            </p>
          </div>

          {/* Enhanced Stats Cards */}
          <StatsCards walletBalance={walletBalance} />

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="neon-card neon-glow-cyan scale-on-hover cursor-pointer group bg-cyan-500 dark:bg-cyan-600 border-cyan-400 dark:border-cyan-500">
              <Link href="/ads">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 rounded-xl bg-white/20 shadow-lg group-hover:bg-white/30 transition-all duration-300">
                      <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-white">View Ads</h3>
                      <p className="text-xs sm:text-sm text-white/80 font-medium">Start earning now</p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 h-2 bg-white/30 rounded-full">
                    <div className="h-full w-0 group-hover:w-full bg-white rounded-full transition-all duration-500"></div>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="neon-card neon-glow-orange scale-on-hover cursor-pointer group bg-orange-500 dark:bg-orange-600 border-orange-400 dark:border-orange-500">
              <Link href="/packages">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 rounded-xl bg-white/20 shadow-lg group-hover:bg-white/30 transition-all duration-300">
                      <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-white">Packages</h3>
                      <p className="text-xs sm:text-sm text-white/80 font-medium">Upgrade your plan</p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 h-2 bg-white/30 rounded-full">
                    <div className="h-full w-0 group-hover:w-full bg-white rounded-full transition-all duration-500"></div>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="neon-card neon-glow-green scale-on-hover cursor-pointer group bg-green-500 dark:bg-green-600 border-green-400 dark:border-green-500">
              <Link href="/wallet">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 rounded-xl bg-white/20 shadow-lg group-hover:bg-white/30 transition-all duration-300">
                      <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-white">Wallet</h3>
                      <p className="text-xs sm:text-sm text-white/80 font-medium">Manage funds</p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 h-2 bg-white/30 rounded-full">
                    <div className="h-full w-0 group-hover:w-full bg-white rounded-full transition-all duration-500"></div>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="neon-card neon-glow-pink scale-on-hover cursor-pointer group bg-pink-500 dark:bg-pink-600 border-pink-400 dark:border-pink-500">
              <Link href="/profile">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 rounded-xl bg-white/20 shadow-lg group-hover:bg-white/30 transition-all duration-300">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-white">Referrals</h3>
                      <p className="text-xs sm:text-sm text-white/80 font-medium">Invite friends</p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 h-2 bg-white/30 rounded-full">
                    <div className="h-full w-0 group-hover:w-full bg-white rounded-full transition-all duration-500"></div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>

          {/* Featured Products */}
          <FeaturedProducts />
        </div>
      </div>
    </div>
  )
}
