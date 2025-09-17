"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Sidebar } from "@/components/layout/sidebar"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { FeaturedProducts } from "@/components/dashboard/featured-products" // Updated import to use dashboard-specific FeaturedProducts component
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <Sidebar />

      <div className="md:ml-64">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-muted-foreground">Here is what is happening with your account today.</p>
          </div>

          {/* Stats Cards */}
          <StatsCards walletBalance={walletBalance} />

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="glass-card border-white/20 hover:border-primary/30 transition-colors cursor-pointer">
              <Link href="/ads">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-primary to-primary/80">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">View Ads</h3>
                      <p className="text-sm text-muted-foreground">Start earning now</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="glass-card border-white/20 hover:border-secondary/30 transition-colors cursor-pointer">
              <Link href="/packages">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-secondary to-secondary/80">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Packages</h3>
                      <p className="text-sm text-muted-foreground">Upgrade your plan</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="glass-card border-white/20 hover:border-accent/30 transition-colors cursor-pointer">
              <Link href="/wallet">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-accent to-accent/80">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Wallet</h3>
                      <p className="text-sm text-muted-foreground">Manage funds</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="glass-card border-white/20 hover:border-chart-3/30 transition-colors cursor-pointer">
              <Link href="/profile">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-chart-3 to-chart-3/80">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Referrals</h3>
                      <p className="text-sm text-muted-foreground">Invite friends</p>
                    </div>
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
