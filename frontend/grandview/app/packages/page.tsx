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
import { Loader2, TrendingUp, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
      toast.error("Failed to load packages data")
    } finally {
      setLoading(false)
    }
  }

  const handlePurchaseSuccess = () => {
    fetchData() // Refresh all data
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex flex-col">
        <Sidebar />
        <div className="flex-1 p-4 sm:p-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex flex-col">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6 lg:ml-64">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Packages
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Choose a package to start earning from advertisements
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <Card className="glass-card border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 w-full sm:w-auto">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">
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
                  <p className="text-xs text-green-600">Available Balance</p>
                </CardContent>
              </Card>
              {userPackage && (
                <Card className="glass-card border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 w-full sm:w-auto">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">{userPackage.days_remaining} days</span>
                    </div>
                    <p className="text-xs text-blue-600">Package Expires</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Current Package Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <Card className="glass-card border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50 md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700 text-lg sm:text-xl">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                  Your Earnings Rate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 font-semibold">
                  <span className="text-xl sm:text-2xl">
                    {userPackage ? formatCurrency(userPackage.rate_per_view) : "No Package"}
                  </span>
                  <span className="text-base sm:text-lg">/view</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {userPackage ? "Days remaining" : "No active package"}
                </p>
              </CardContent>
            </Card>

            {/* Current Package */}
            <CurrentPackage package={userPackage} />
          </div>

          {/* Available Packages */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold">Available Packages</h2>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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

          {/* Package Comparison */}
          <PackageComparison />

          {/* Info Card */}
          <Card className="glass-card border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-semibold text-blue-800 text-base sm:text-lg mb-2">How Packages Work</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Each package gives you access to advertisements for a specific duration</li>
                <li>• Higher-tier packages offer better rates per view (KSH 90, KSH 100, or KSH 120)</li>
                <li>• You can only have one active package at a time</li>
                <li>
                  •{" "}
                  {user?.is_marketer
                    ? "As a marketer, you can use both deposit and earnings balance"
                    : "You can only use your deposit balance for purchases"}
                </li>
                <li>• Packages automatically expire after the validity period</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
