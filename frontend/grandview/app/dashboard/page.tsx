"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Sidebar } from "@/components/layout/sidebar"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { FeaturedProducts } from "@/components/dashboard/featured-products"
import { ApiService, type WalletBalance } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Eye, Users, Wallet, Crown, BarChart3, ArrowRight, MessageCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

// Define glassmorphism styles
const glassmorphismStyles = `
  .glass-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
  }
  .glass-card:hover {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
  .dark .glass-card {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }
  .dark .glass-card:hover {
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.25);
  }
`

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null)
  //const [setShowBonusPopup] = useState(false)
  //const [setShowPremiumWelcome] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchWalletBalance()
      //const bonusTimer = setTimeout(() => setShowBonusPopup(true), 2000)
      //const premiumTimer = setTimeout(() => setShowPremiumWelcome(true), 5000)

      return () => {
        //clearTimeout(bonusTimer)
        //clearTimeout(premiumTimer)
      }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-16 h-16 rounded-2xl gradient-electric-blue flex items-center justify-center mx-auto mb-6 glow-blue animate-pulse-glow"
          >
            <MessageCircle className="h-8 w-8 text-white" />
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient-rainbow neon-text">Loading Dashboard</h2>
            <p className="text-white text-base sm:text-lg md:text-xl">Preparing your vibrant workspace...</p>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <style>{glassmorphismStyles}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <Sidebar />

        <div className="lg:ml-72">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col gap-4 sm:gap-6"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-12 h-12 rounded-xl gradient-electric-blue flex items-center justify-center glow-electric-blue animate-pulse-glow"
                  >
                    <BarChart3 className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                      Welcome back, {user?.username}
                    </h1>
                    <p className="text-gray-300 text-sm sm:text-base md:text-lg mt-1 font-semibold">Your dashboard is ready</p>
                  </div>
                </div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                  <Button className="gradient-purple text-white glow-purple hover-lift mt-4 sm:mt-0">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <StatsCards walletBalance={walletBalance} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            >
              {[
                {
                  href: "/ads",
                  icon: Eye,
                  title: "View Advertisements",
                  subtitle: "Start earning from ads",
                  bgColor: "glass-card",
                  description: "Browse and interact with targeted advertisements",
                },
                {
                  href: "/packages",
                  icon: Crown,
                  title: "Premium Plans",
                  subtitle: "Upgrade your account",
                  bgColor: "glass-card",
                  description: "Access exclusive features and higher earnings",
                },
                {
                  href: "/wallet",
                  icon: Wallet,
                  title: "Wallet Management",
                  subtitle: "Manage your funds",
                  bgColor: "glass-card",
                  description: "View balance, withdraw earnings, and transactions",
                },
                {
                  href: "/profile",
                  icon: Users,
                  title: "Referral Program",
                  subtitle: "Earn bonus income",
                  bgColor: "glass-card",
                  description: "Invite friends and earn referral commissions",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -8 }}
                  className="group"
                >
                  <Card className={`h-full ${item.bgColor} text-white shadow-lg hover:shadow-xl transition-shadow`}>
                    <Link href={item.href} className="block h-full">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-3">
                          <motion.div
                            whileHover={{ rotate: 15, scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                            className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center"
                          >
                            <item.icon className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
                          </motion.div>
                          <ArrowRight className="h-4 w-4 text-white group-hover:text-white transition-colors animate-pulse" />
                        </div>
                        <CardTitle className="text-sm sm:text-base md:text-lg font-bold">{item.title}</CardTitle>
                        <p className="text-xs sm:text-sm font-bold">{item.subtitle}</p>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-xs sm:text-sm text-white leading-relaxed font-medium">{item.description}</p>
                      </CardContent>
                    </Link>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <FeaturedProducts />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2"
            >
              <Card className="glass-card text-white shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm sm:text-base md:text-lg">Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: "Ad viewed", time: "2 minutes ago", earnings: "+KSH 15" },
                      { action: "Referral bonus", time: "1 hour ago", earnings: "+KSH 250" },
                      { action: "Daily login bonus", time: "Today", earnings: "+KSH 50" },
                    ].map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b border-white border-opacity-20 last:border-0"
                      >
                        <div>
                          <p className="font-bold text-sm sm:text-base text-white">{activity.action}</p>
                          <p className="text-xs sm:text-sm text-white font-medium">{activity.time}</p>
                        </div>
                        <span className="text-sm sm:text-base font-bold text-white">{activity.earnings}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card text-white shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm sm:text-base md:text-lg">Performance Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { metric: "Ads Viewed Today", value: "24", change: "+12%" },
                      { metric: "Weekly Earnings", value: "KSH 1,250", change: "+8%" },
                      { metric: "Referrals Active", value: "8", change: "+2" },
                    ].map((metric, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-bold text-sm sm:text-base text-white">{metric.metric}</p>
                          <p className="text-base sm:text-lg font-bold text-white">{metric.value}</p>
                        </div>
                        <span className="text-white font-bold text-xs sm:text-sm bg-teal-500 px-3 py-1 rounded-full">
                          {metric.change}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}