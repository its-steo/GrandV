"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Check, Loader2 } from "lucide-react"
import { ApiService, type AgentVerificationPackage } from "@/lib/api"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

interface AgentPackageCardProps {
  package: AgentVerificationPackage
  onPurchaseSuccess: () => void
}

export function AgentPackageCard({ package: pkg, onPurchaseSuccess }: AgentPackageCardProps) {
  const [isPurchasing, setIsPurchasing] = useState(false)

  const handlePurchase = async () => {
    try {
      setIsPurchasing(true)
      console.log("[v0] Starting purchase for package:", pkg.id)
      console.log("[v0] Package details:", pkg)

      const result = await ApiService.purchaseAgentPackage(pkg.id)
      console.log("[v0] Purchase result:", result)

      toast.success(result.message || "Package purchased successfully!")
      onPurchaseSuccess()
    } catch (error) {
      console.error("[v0] Purchase error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to purchase package"
      toast.error(errorMessage)

      if (errorMessage.includes("500")) {
        toast.error("Server error. Please check: 1) Sufficient balance 2) No active purchase 3) Backend logs", {
          duration: 8000,
        })
      }
    } finally {
      setIsPurchasing(false)
    }
  }

  return (
    <Card className="glass-card border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
            <Crown className="h-3 w-3 mr-1" />
            Premium
          </Badge>
          <div className="text-2xl font-bold text-yellow-500">{formatCurrency(pkg.price)}</div>
        </div>
        <CardTitle className="text-xl">{pkg.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">Valid for {pkg.validity_days} days</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Package Image */}
        <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
          <img src={pkg.image || "/placeholder.svg"} alt={pkg.name} className="w-full h-full object-cover" />
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground">{pkg.description}</p>

        {/* Benefits */}
        <div className="space-y-2">
          <p className="text-sm font-semibold">Benefits:</p>
          <ul className="space-y-1">
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              <span>Verified Agent Badge</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              <span>KSh 21,000 Cashback Bonus</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              <span>KSh 10,000 Weekly Bonus</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              <span>Priority Support</span>
            </li>
          </ul>
        </div>

        {/* Purchase Button */}
        <Button
          onClick={handlePurchase}
          disabled={isPurchasing}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
        >
          {isPurchasing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Crown className="h-4 w-4 mr-2" />
              Purchase Package
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
