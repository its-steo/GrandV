"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Sidebar } from "@/components/layout/sidebar"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { FeaturedProducts } from "@/components/dashboard/featured-products"
import { ApiService, type WalletBalance } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Package, Eye, Users, Zap } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      fetchWalletBalance()
    }
  }, [isAuthenticated])

  const fetchWalletBalance = async () => {
    try {
      const balance = await ApiService.getWalletBalance()
      setWalletBalance(balance)
    } catch (error) {
      console.error("Failed to fetch wallet balance:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary via-secondary to-accent flex items-center justify-center mx-auto mb-6 neon-glow animate-pulse">
            <Zap className="h-10 w-10 text-black animate-bounce" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Loading Dashboard
            </h2>
            <p className="text-muted-foreground">Preparing your amazing experience...</p>
          </div>
          {/* Floating particles */}
          <div className="particles">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 6}s`,
                  animationDuration: `${6 + Math.random() * 4}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <svg className="w-full h-full" viewBox="0 0 1200 800" fill="none">
          <defs>
            <linearGradient id="flowGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(0,255,255,0.3)" />
              <stop offset="50%" stopColor="rgba(255,0,255,0.2)" />
              <stop offset="100%" stopColor="rgba(0,255,136,0.1)" />
            </linearGradient>
            <linearGradient id="flowGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,0,255,0.3)" />
              <stop offset="50%" stopColor="rgba(0,255,136,0.2)" />
              <stop offset="100%" stopColor="rgba(0,255,255,0.1)" />
            </linearGradient>
          </defs>

          {/* Flowing lines */}
          <path
            d="M-100,200 Q300,100 600,300 T1300,200"
            stroke="url(#flowGradient1)"
            strokeWidth="2"
            fill="none"
            className="animate-pulse"
          />
          <path
            d="M-100,400 Q400,300 800,500 T1300,400"
            stroke="url(#flowGradient2)"
            strokeWidth="1.5"
            fill="none"
            className="animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <path
            d="M-100,600 Q500,500 900,700 T1300,600"
            stroke="url(#flowGradient1)"
            strokeWidth="1"
            fill="none"
            className="animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </svg>
      </div>

      <Sidebar />

      <div className="lg:ml-64 relative z-10">
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          <div className="flex flex-col gap-2 sm:gap-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent neon-text animate-pulse">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground font-medium">
              Your futuristic marketing dashboard is ready. Track your earnings and dominate the digital space.
            </p>
          </div>

          {/* Enhanced Stats Cards */}
          <StatsCards walletBalance={walletBalance} />

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="glass-card border-primary/30 hover:border-primary/60 transition-all duration-300 group cursor-pointer relative overflow-hidden">
              <Link href="/ads">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 rounded-xl bg-primary/20 border border-primary/30 group-hover:bg-primary/30 transition-all duration-300">
                      <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-foreground">View Ads</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium">Start earning now</p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 h-2 bg-primary/20 rounded-full">
                    <div className="h-full w-0 group-hover:w-full bg-primary rounded-full transition-all duration-500"></div>
                  </div>
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </CardContent>
              </Link>
            </Card>

            <Card className="glass-card border-secondary/30 hover:border-secondary/60 transition-all duration-300 group cursor-pointer relative overflow-hidden">
              <Link href="/packages">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 rounded-xl bg-secondary/20 border border-secondary/30 group-hover:bg-secondary/30 transition-all duration-300">
                      <Package className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-foreground">Packages</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium">Upgrade your plan</p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 h-2 bg-secondary/20 rounded-full">
                    <div className="h-full w-0 group-hover:w-full bg-secondary rounded-full transition-all duration-500"></div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </CardContent>
              </Link>
            </Card>

            <Card className="glass-card border-accent/30 hover:border-accent/60 transition-all duration-300 group cursor-pointer relative overflow-hidden">
              <Link href="/wallet">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 rounded-xl bg-accent/20 border border-accent/30 group-hover:bg-accent/30 transition-all duration-300">
                      <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-foreground">Wallet</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium">Manage funds</p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 h-2 bg-accent/20 rounded-full">
                    <div className="h-full w-0 group-hover:w-full bg-accent rounded-full transition-all duration-500"></div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </CardContent>
              </Link>
            </Card>

            <Card className="glass-card border-primary/30 hover:border-primary/60 transition-all duration-300 group cursor-pointer relative overflow-hidden">
              <Link href="/profile">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 rounded-xl bg-primary/20 border border-primary/30 group-hover:bg-primary/30 transition-all duration-300">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-foreground">Agents</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium">Bonus Earning</p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 h-2 bg-primary/20 rounded-full">
                    <div className="h-full w-0 group-hover:w-full bg-primary rounded-full transition-all duration-500"></div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </CardContent>
              </Link>
            </Card>
          </div>

          {/* Featured Products */}
          <FeaturedProducts />
        </div>
      </div>

      <div className="particles">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
