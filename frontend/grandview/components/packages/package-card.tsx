"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Clock, DollarSign, Loader2 } from "lucide-react"
import { ApiService } from "@/lib/api"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

interface Package {
  id: number
  name: string
  image: string
  validity_days: number
  rate_per_view: number
  description: string
  price: string
  features?: string[]
}

interface PackageCardProps {
  package: Package
  isActive?: boolean
  onPurchaseSuccess: () => void
  walletBalance: {
    deposit_balance: string
    views_earnings_balance: string
    referral_balance: string
  } | null
  isMarketer: boolean
}

export function PackageCard({
  package: pkg,
  isActive,
  onPurchaseSuccess,
  walletBalance,
  isMarketer,
}: PackageCardProps) {
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [packageFeatures, setPackageFeatures] = useState<string[]>([])

  useEffect(() => {
    const loadFeatures = async () => {
      try {
        if (pkg.features && pkg.features.length > 0) {
          setPackageFeatures(pkg.features)
        } else {
          const basicFeatures = [
            "Access to advertisements",
            "Instant earnings",
            "24/7 support",
            `KSH ${pkg.rate_per_view} per view rate`,
          ]

          if (pkg.rate_per_view === 100) {
            basicFeatures.push("Priority ad access")
          } else if (pkg.rate_per_view === 120) {
            basicFeatures.push("Priority ad access", "Exclusive high-rate ads", "VIP support")
          }

          setPackageFeatures(basicFeatures)
        }
      } catch (error) {
        console.error("Failed to load package features:", error)
      }
    }

    loadFeatures()
  }, [pkg])

  const handlePurchase = async () => {
    if (!walletBalance) {
      toast.error("Unable to load wallet balance")
      return
    }

    const availableBalance = isMarketer
      ? Number.parseFloat(walletBalance.deposit_balance) + Number.parseFloat(walletBalance.views_earnings_balance)
      : Number.parseFloat(walletBalance.deposit_balance)

    const packagePrice = Number.parseFloat(pkg.price)

    if (availableBalance < packagePrice) {
      toast.error(
        `You need ${formatCurrency(packagePrice)} but only have ${formatCurrency(availableBalance)} available`,
      )
      return
    }

    try {
      setIsPurchasing(true)
      const response = await ApiService.purchasePackage(pkg.id)

      toast.success(`Successfully purchased ${pkg.name} package`)

      onPurchaseSuccess()
    } catch (error) {
      console.error("Purchase error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to purchase package")
    } finally {
      setIsPurchasing(false)
    }
  }

  const getRateColor = (rate: number) => {
    switch (rate) {
      case 90:
        return "from-blue-500 to-blue-600"
      case 100:
        return "from-green-500 to-green-600"
      case 120:
        return "from-purple-500 to-purple-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  const isPopular = pkg.rate_per_view === 100
  const isPremium = pkg.rate_per_view === 120

  return (
    <Card
      className={`glass-card border-white/20 relative w-full max-w-md mx-auto ${isActive ? "ring-2 ring-primary" : ""} ${isPremium ? "border-purple-300" : ""}`}
    >
      {isPopular && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs sm:text-sm px-2 sm:px-3 py-1">
          <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          Most Popular
        </Badge>
      )}

      {isPremium && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs sm:text-sm px-2 sm:px-3 py-1">
          <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          Premium
        </Badge>
      )}

      {isActive && (
        <Badge className="absolute -top-2 right-2 sm:right-4 bg-gradient-to-r from-primary to-secondary text-white text-xs sm:text-sm px-2 sm:px-3 py-1">
          Active
        </Badge>
      )}

      <CardHeader className="text-center pb-2 sm:pb-4">
        <div className="mx-auto mb-2 sm:mb-4 relative">
          <img
            src={pkg.image || "/placeholder.svg?height=80&width=80&query=package"}
            alt={pkg.name}
            className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover mx-auto"
          />
        </div>
        <CardTitle className="text-lg sm:text-xl md:text-2xl mb-1 sm:mb-2">{pkg.name}</CardTitle>
        <div
          className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${getRateColor(pkg.rate_per_view)} bg-clip-text text-transparent`}
        >
         {formatCurrency(pkg.price)}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">{pkg.description}</p>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
        {/* Rate Highlight */}
        <div
          className={`p-3 sm:p-4 rounded-lg bg-gradient-to-r ${getRateColor(pkg.rate_per_view)} text-white text-center`}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-base sm:text-lg font-bold"> {formatCurrency(pkg.rate_per_view)} per view</span>
          </div>
          <p className="text-xs sm:text-sm opacity-90">Earn more with each ad you watch</p>
        </div>

        {/* Validity */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm">Valid for {pkg.validity_days} days</span>
        </div>

        {/* Features */}
        <div className="space-y-2">
          {packageFeatures.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {/* Purchase Button */}
        <Button
          onClick={handlePurchase}
          disabled={isPurchasing || isActive}
          className={`w-full text-xs sm:text-sm ${
            isActive
              ? "bg-gray-400 cursor-not-allowed"
              : `bg-gradient-to-r ${getRateColor(pkg.rate_per_view)} hover:opacity-90`
          } transition-all duration-300 py-2 sm:py-3`}
        >
          {isPurchasing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : isActive ? (
            "Currently Active"
          ) : (
            `Purchase for KSH ${formatCurrency(pkg.price)}`
          )}
        </Button>

        {/* Balance Info */}
        {walletBalance && !isActive && (
          <div className="text-xs sm:text-sm text-muted-foreground text-center">
            Available: KSH{" "}
            {formatCurrency(
              isMarketer
                ? Number.parseFloat(walletBalance.deposit_balance) +
                    Number.parseFloat(walletBalance.views_earnings_balance)
                : Number.parseFloat(walletBalance.deposit_balance),
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
