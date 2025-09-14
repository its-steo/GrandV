"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Copy, Share, Gift, TrendingUp } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { ApiService } from "@/lib/api"

interface ReferralStats {
  total_referrals: number
  active_referrals: number
  total_commission: string
  this_month_commission: string
}

export function ReferralCard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReferralStats = async () => {
      try {
        const statsData = await ApiService.getReferralStats()
        setStats(statsData)
      } catch (error) {
        console.error("Failed to fetch referral stats:", error)
        // Set default stats if API fails
        setStats({
          total_referrals: 0,
          active_referrals: 0,
          total_commission: "0.00",
          this_month_commission: "0.00",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchReferralStats()
  }, [])

  const copyReferralCode = () => {
    if (user?.referral_code) {
      navigator.clipboard.writeText(user.referral_code)
      toast.success("Referral code copied to clipboard")
    }
  }

  const shareReferralLink = () => {
    const referralLink = `${window.location.origin}?ref=${user?.referral_code}`
    navigator.clipboard.writeText(referralLink)
    toast.success("Referral link copied to clipboard")
  }

  return (
    <Card className="glass-card border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-purple-500" />
          Referral Program
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Referral Code */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-300/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Your Referral Code</span>
            <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">Active</Badge>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-white/10 rounded text-lg font-mono">{user?.referral_code}</code>
            <Button
              variant="outline"
              size="sm"
              onClick={copyReferralCode}
              className="bg-transparent border-white/20 hover:bg-purple-500/10"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Share Button */}
        <Button
          onClick={shareReferralLink}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Share className="h-4 w-4 mr-2" />
          Share Referral Link
        </Button>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-full h-16 bg-muted/50 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-white/5">
              <div className="flex items-center justify-center mb-1">
                <Users className="h-4 w-4 text-blue-500 mr-1" />
              </div>
              <div className="text-2xl font-bold text-blue-500">{stats?.total_referrals || 0}</div>
              <div className="text-xs text-muted-foreground">Total Referrals</div>
            </div>

            <div className="text-center p-3 rounded-lg bg-white/5">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              </div>
              <div className="text-2xl font-bold text-green-500">{stats?.active_referrals || 0}</div>
              <div className="text-xs text-muted-foreground">Active This Month</div>
            </div>

            <div className="text-center p-3 rounded-lg bg-white/5">
              <div className="text-lg font-bold text-purple-500">KSH {stats?.total_commission || "0.00"}</div>
              <div className="text-xs text-muted-foreground">Total Earned</div>
            </div>

            <div className="text-center p-3 rounded-lg bg-white/5">
              <div className="text-lg font-bold text-orange-500">KSH {stats?.this_month_commission || "0.00"}</div>
              <div className="text-xs text-muted-foreground">This Month</div>
            </div>
          </div>
        )}

        {/* Referral Info */}
        <div className="text-sm text-muted-foreground text-center">
          Earn commissions when your referrals make purchases or upgrade packages
        </div>
      </CardContent>
    </Card>
  )
}
