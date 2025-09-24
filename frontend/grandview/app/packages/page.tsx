"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { PackageCard } from "@/components/packages/package-card"
import { CurrentPackage } from "@/components/packages/current-package"
import { PackageComparison } from "@/components/packages/package-comparison"
import { ApiService, type WalletBalance, type PackageType, type UserPackage } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { Loader2, TrendingUp, Clock, Wallet, Star, Shield, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageType[]>([])
  const [userPackage, setUserPackage] = useState<UserPackage | null>(null)
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [packagesRes, userPackageRes, walletData] = await Promise.all([
        ApiService.getPackages(),
        ApiService.getCurrentUserPackage(),
        ApiService.getWalletBalance(),
      ])

      setPackages(packagesRes.packages || [])
      setUserPackage(userPackageRes)
      setWalletBalance(walletData)
    } catch (error) {
      toast.error(`Failed to load packages data: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchaseSuccess = () => {
    fetchData() // Refresh all data
  }

  if (loading) {
    return (
      <div className="min-h-screen premium-gradient flex flex-col">
        <Sidebar />
        <div className="flex-1 p-6 lg:ml-64">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Loading packages...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen premium-gradient flex flex-col">
      <Sidebar />
      <div className="flex-1 p-6 lg:ml-64">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-6 py-8">
            <div className="space-y-4">
              <Badge className="professional-badge">
                <Star className="h-4 w-4 mr-2" />
                Premium Advertising Platform
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-balance">
                Choose Your <span className="pricing-highlight">Earning Package</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
                Select the perfect package to maximize your earnings from premium advertisements
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="stats-card">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Wallet className="h-5 w-5 text-chart-1" />
                    <span className="text-2xl font-bold text-chart-1">
                      {formatCurrency(
                        walletBalance
                          ? (
                              Number.parseFloat(walletBalance.deposit_balance || "0") +
                              Number.parseFloat(walletBalance.views_earnings_balance || "0")
                            ).toFixed(2)
                          : "0.00",
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Available Balance</p>
                </CardContent>
              </Card>

              {userPackage && (
                <Card className="stats-card">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold text-primary">{userPackage.days_remaining}</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Days Remaining</p>
                  </CardContent>
                </Card>
              )}

              <Card className="stats-card">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-accent" />
                    <span className="text-2xl font-bold text-accent">
                      {userPackage ? formatCurrency(userPackage.rate_per_view) : "0"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Current Rate/View</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {userPackage && (
            <div className="max-w-2xl mx-auto">
              <CurrentPackage package={userPackage} />
            </div>
          )}

          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Available Packages</h2>
              <p className="text-muted-foreground">Choose the package that fits your earning goals</p>
            </div>

            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {packages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  package={pkg}
                  isActive={userPackage?.rate_per_view === pkg.rate_per_view}
                  onPurchaseSuccess={handlePurchaseSuccess}
                  walletBalance={
                    walletBalance
                      ? {
                          deposit_balance: walletBalance.deposit_balance ?? "0",
                          views_earnings_balance: walletBalance.views_earnings_balance ?? "0",
                          referral_balance: walletBalance.referral_balance ?? "0",
                        }
                      : null
                  }
                  isMarketer={user?.is_marketer || false}
                />
              ))}
            </div>
          </div>

          <div className="max-w-5xl mx-auto">
            <PackageComparison />
          </div>

          <Card className="professional-card max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">How Our Platform Works</h3>
                <p className="text-muted-foreground">Everything you need to know about earning with our packages</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="feature-check">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Instant Activation</h4>
                      <p className="text-sm text-muted-foreground">Your package activates immediately after purchase</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="feature-check">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Higher Tier Benefits</h4>
                      <p className="text-sm text-muted-foreground">
                        Premium packages offer better rates and exclusive ads
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="feature-check">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Secure Payments</h4>
                      <p className="text-sm text-muted-foreground">
                        {user?.is_marketer
                          ? "Use both deposit and earnings balance for purchases"
                          : "Secure transactions using your deposit balance"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="feature-check">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Flexible Duration</h4>
                      <p className="text-sm text-muted-foreground">
                        Packages automatically renew or you can upgrade anytime
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
