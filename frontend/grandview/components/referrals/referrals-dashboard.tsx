"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  TrendingUp,
  DollarSign,
  Share2,
  Copy,
  Award,
  Target,
  Loader2,
  RefreshCw,
  ArrowUpRight,
  UserPlus,
} from "lucide-react"
import { ApiService, type ReferralStats } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { ReferralsList } from "./referrals-list"
import { CommissionHistory } from "./commision-history"

export function ReferralDashboard() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generatingCode, setGeneratingCode] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, dashboardInfo] = await Promise.all([
        ApiService.getReferralStats(),
        ApiService.getMarketerDashboard().catch(() => null),
      ])

      setStats(statsData)
      setDashboardData(dashboardInfo)
    } catch (error) {
      toast.error("Failed to load referral data")
      console.error("Error fetching referral data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyReferralLink = () => {
    if (stats?.referral_link) {
      navigator.clipboard.writeText(stats.referral_link)
      toast.success("Referral link copied to clipboard!")
    }
  }

  const handleCopyReferralCode = () => {
    if (stats?.referral_code) {
      navigator.clipboard.writeText(stats.referral_code)
      toast.success("Referral code copied to clipboard!")
    }
  }

  const handleGenerateNewCode = async () => {
    try {
      setGeneratingCode(true)
      const result = await ApiService.generateReferralCode()

      setStats((prev) =>
        prev
          ? {
              ...prev,
              referral_code: result.referral_code,
              referral_link: result.referral_link,
            }
          : null,
      )

      toast.success("New referral code generated!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate new code")
    } finally {
      setGeneratingCode(false)
    }
  }

  const handleWithdrawCommission = async () => {
    if (!stats) return

    const availableAmount = Number.parseFloat(stats.total_commission)
    if (availableAmount < 100) {
      toast.error("Minimum withdrawal amount is KSh 100")
      return
    }

    try {
      const result = await ApiService.withdrawCommission(availableAmount)
      toast.success("Commission withdrawal initiated!")
      toast.info(`Estimated completion: ${new Date(result.estimated_completion).toLocaleDateString()}`)
      fetchDashboardData() // Refresh data
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Withdrawal failed")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats?.total_referrals || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.active_referrals || 0} active users</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats?.total_commission || "0")}</div>
            <p className="text-xs text-muted-foreground">All time earnings</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats?.this_month_commission || "0")}
            </div>
            <p className="text-xs text-muted-foreground">Current month earnings</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats?.commission_rate || 0}%</div>
            <p className="text-xs text-muted-foreground">Per successful referral</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      {dashboardData?.performance_metrics && (
        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {dashboardData.performance_metrics.conversion_rate.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(dashboardData.performance_metrics.average_commission)}
                </div>
                <p className="text-sm text-muted-foreground">Avg Commission</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {dashboardData.performance_metrics.top_performing_month}
                </div>
                <p className="text-sm text-muted-foreground">Best Month</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {dashboardData.performance_metrics.growth_rate > 0 ? "+" : ""}
                  {dashboardData.performance_metrics.growth_rate.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">Growth Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referral Tools */}
      <Card className="glass-card border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Referral Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Referral Code</label>
              <div className="flex gap-2">
                <Input value={stats?.referral_code || ""} readOnly className="glass border-white/20 font-mono" />
                <Button variant="outline" size="sm" onClick={handleCopyReferralCode} className="glass bg-transparent">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Your Referral Link</label>
              <div className="flex gap-2">
                <Input value={stats?.referral_link || ""} readOnly className="glass border-white/20 text-sm" />
                <Button variant="outline" size="sm" onClick={handleCopyReferralLink} className="glass bg-transparent">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleGenerateNewCode}
                disabled={generatingCode}
                variant="outline"
                className="glass bg-transparent"
              >
                {generatingCode ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Generate New Code
              </Button>

              <Button
                onClick={handleWithdrawCommission}
                disabled={!stats || Number.parseFloat(stats.total_commission) < 100}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Withdraw Commission
              </Button>
            </div>

            <Button onClick={fetchDashboardData} variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Referral Program Info */}
      <Card className="glass-card border-white/20">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                <Share2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Share Your Link</h3>
              <p className="text-sm text-muted-foreground">Share your unique referral link with friends and family</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center mx-auto mb-3">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">They Sign Up</h3>
              <p className="text-sm text-muted-foreground">
                When someone signs up using your link, they become your referral
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-accent to-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Earn Commission</h3>
              <p className="text-sm text-muted-foreground">
                Earn {stats?.commission_rate || 0}% commission on their purchases and activities
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Views */}
      <Tabs defaultValue="referrals" className="space-y-4">
        <TabsList className="glass">
          <TabsTrigger value="referrals" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            My Referrals
          </TabsTrigger>
          <TabsTrigger value="commissions" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Commission History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="referrals">
          <ReferralsList />
        </TabsContent>

        <TabsContent value="commissions">
          <CommissionHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}
