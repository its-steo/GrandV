"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Sidebar } from "@/components/layout/sidebar"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { FeaturedProducts } from "@/components/dashboard/featured-products"
import { ApiService, type WalletBalance } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, BarChart3, MessageCircle } from "lucide-react"
import { motion } from "framer-motion"
import { AnalyticsChart } from "@/components/dashboard/analytics-chart"

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
  const [activities, setActivities] = useState<unknown[]>([])
  const [loadingActivities, setLoadingActivities] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 20

  useEffect(() => {
    if (isAuthenticated) {
      fetchWalletBalance()
      fetchActivities(currentPage)
    }
  }, [isAuthenticated, currentPage])

  const fetchWalletBalance = async () => {
    try {
      const balance = await ApiService.getWalletBalance()
      setWalletBalance(balance)
    } catch (error) {
      console.error("Failed to fetch wallet balance:", error)
    }
  }

  const fetchActivities = async (page: number) => {
    setLoadingActivities(true)
    try {
      const response = await ApiService.getRecentActivities(page, pageSize)
      setActivities(response.results)
      setTotalPages(Math.ceil(response.count / pageSize))
    } catch (error) {
      console.error("Failed to fetch activities:", error)
    } finally {
      setLoadingActivities(false)
    }
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
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
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <StatsCards walletBalance={walletBalance} />
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
                  {loadingActivities ? (
                    <p className="text-white">Loading activities...</p>
                  ) : activities.length > 0 ? (
                    <div className="space-y-4">
                      {activities.map((activity) => {
                        const act = activity as {
                          id: string | number
                          action_display: string
                          timestamp: string
                          related_object_detail?: string
                        }
                        return (
                          <div
                            key={act.id}
                            className="flex items-center justify-between py-2 border-b border-white border-opacity-20 last:border-0"
                          >
                            <div>
                              <p className="font-bold text-sm sm:text-base text-white">{act.action_display}</p>
                              <p className="text-xs sm:text-sm text-white font-medium">
                                {new Date(act.timestamp).toLocaleString()}
                              </p>
                              {act.related_object_detail && (
                                <p className="text-xs sm:text-sm text-gray-300">{act.related_object_detail}</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                      {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-4">
                          <Button
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                          >
                            Previous
                          </Button>
                          <span className="text-white">
                            Page {currentPage} of {totalPages}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-white">No recent activities found.</p>
                  )}
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
                  <AnalyticsChart />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
