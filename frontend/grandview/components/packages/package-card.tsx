"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Clock, DollarSign, Loader2, Crown, Zap } from "lucide-react"
import { ApiService } from "@/lib/api"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import Image from "next/image"

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
            "Access to premium advertisements",
            "Instant earnings processing",
            "24/7 priority support",
            `${formatCurrency(pkg.rate_per_view)} per view guaranteed`,
          ]

          if (pkg.rate_per_view === 100) {
            basicFeatures.push("Priority ad queue access", "Enhanced earning opportunities")
          } else if (pkg.rate_per_view === 120) {
            basicFeatures.push("VIP ad access", "Exclusive high-rate campaigns", "Dedicated account manager")
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
        `Insufficient balance. You need ${formatCurrency(packagePrice)} but only have ${formatCurrency(availableBalance)} available`,
      )
      return
    }

    try {
      setIsPurchasing(true)
      await ApiService.purchasePackage(pkg.id)

      toast.success(`Successfully purchased ${pkg.name} package`)
      onPurchaseSuccess()
    } catch (error) {
      console.error("Purchase error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to purchase package")
    } finally {
      setIsPurchasing(false)
    }
  }

  const getPackageTheme = (rate: number) => {
    switch (rate) {
      case 90:
        return {
          gradient: "from-blue-500 to-blue-600",
          badge: "from-blue-500 to-blue-600",
          border: "border-blue-200",
          bg: "from-blue-50 to-blue-100",
          icon: Zap,
          tier: "Starter",
        }
      case 100:
        return {
          gradient: "from-chart-1 to-chart-2",
          badge: "from-chart-1 to-chart-2",
          border: "border-chart-1/30",
          bg: "from-chart-1/10 to-chart-2/10",
          icon: Star,
          tier: "Popular",
        }
      case 120:
        return {
          gradient: "from-primary to-accent",
          badge: "from-primary to-accent",
          border: "border-primary/30",
          bg: "from-primary/10 to-accent/10",
          icon: Crown,
          tier: "Premium",
        }
      default:
        return {
          gradient: "from-muted to-muted-foreground",
          badge: "from-muted to-muted-foreground",
          border: "border-border",
          bg: "from-muted/10 to-muted/20",
          icon: Zap,
          tier: "Basic",
        }
    }
  }

  const theme = getPackageTheme(pkg.rate_per_view)
 // const IconComponent = theme.icon
  const isPopular = pkg.rate_per_view === 100
  const isPremium = pkg.rate_per_view === 120

  return (
    <Card
      className={`professional-card relative overflow-hidden hover:scale-[1.02] hover:shadow-xl transition-all duration-300 ${
        isActive ? "ring-2 ring-primary shadow-xl" : ""
      } ${isPremium ? "border-primary/30" : ""}`}
    >
      {isPopular && (
        <Badge
          className={`absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r ${theme.badge} text-white px-4 py-1 shadow-lg z-10`}
        >
          <Star className="h-4 w-4 mr-1" />
          Most Popular
        </Badge>
      )}

      {isPremium && (
        <Badge
          className={`absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r ${theme.badge} text-white px-4 py-1 shadow-lg z-10`}
        >
          <Crown className="h-4 w-4 mr-1" />
          Premium
        </Badge>
      )}

      {isActive && (
        <Badge className="absolute -top-3 right-4 bg-gradient-to-r from-primary to-accent text-white px-4 py-1 shadow-lg z-10">
          Active
        </Badge>
      )}

      <div className="relative w-full h-48 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg} opacity-90`} />
        <Image
          src={pkg.image.startsWith("http") ? pkg.image : `http://localhost:8000${pkg.image}`}
          alt={pkg.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <CardHeader className="text-center pb-4 space-y-4">
        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>
          <div className={`text-4xl font-bold bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
            {formatCurrency(pkg.price)}
          </div>
          <p className="text-muted-foreground text-balance">{pkg.description}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 px-6 pb-6">
        <div className={`p-4 rounded-xl bg-gradient-to-r ${theme.gradient} text-white text-center shadow-lg`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <DollarSign className="h-5 w-5" />
            <span className="text-xl font-bold">{formatCurrency(pkg.rate_per_view)} per view</span>
          </div>
          <p className="text-sm opacity-90">Guaranteed earning rate</p>
        </div>

        <div className="flex items-center justify-center gap-2 text-muted-foreground bg-muted/20 rounded-lg p-3">
          <Clock className="h-4 w-4" />
          <span className="font-medium">Valid for {pkg.validity_days} days</span>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Whats Included</h4>
          {packageFeatures.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="feature-check mt-0.5">
                <Check className="h-3 w-3" />
              </div>
              <span className="text-sm leading-relaxed">{feature}</span>
            </div>
          ))}
        </div>

        <Button
          onClick={handlePurchase}
          disabled={isPurchasing || isActive}
          className={`w-full h-12 text-base font-semibold transition-all duration-300 ${
            isActive
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : `professional-button bg-gradient-to-r ${theme.gradient} hover:opacity-90`
          }`}
        >
          {isPurchasing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing Purchase...
            </>
          ) : isActive ? (
            "Currently Active"
          ) : (
            `Purchase for ${formatCurrency(pkg.price)}`
          )}
        </Button>

        {walletBalance && !isActive && (
          <div className="text-center p-3 bg-muted/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Available Balance:{" "}
              <span className="font-semibold text-foreground">
                {formatCurrency(
                  isMarketer
                    ? Number.parseFloat(walletBalance.deposit_balance) +
                        Number.parseFloat(walletBalance.views_earnings_balance)
                    : Number.parseFloat(walletBalance.deposit_balance),
                )}
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
