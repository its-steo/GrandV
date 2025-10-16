"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gift, CheckCircle } from "lucide-react"
import type { CashbackBonus, WeeklyBonus } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"

interface BonusClaimCardProps {
  bonus: CashbackBonus | WeeklyBonus
  type: "cashback" | "weekly"
  onClaimClick: () => void
}

export function BonusClaimCard({ bonus, type, onClaimClick }: BonusClaimCardProps) {
  const isClaimed = bonus.claimed
  const bonusTitle = type === "cashback" ? "Cashback Bonus" : "Weekly Bonus"
  const bonusDescription =
    type === "cashback" ? "One-time bonus for purchasing agent package" : "Recurring weekly bonus for verified agents"

  return (
    <Card className={`glass-card ${isClaimed ? "border-gray-500/30" : "border-purple-500/30"}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gift className={`h-5 w-5 ${isClaimed ? "text-gray-500" : "text-purple-500"}`} />
            {bonusTitle}
          </CardTitle>
          <Badge className={isClaimed ? "bg-gray-500" : "bg-purple-500"}>{isClaimed ? "Claimed" : "Available"}</Badge>
        </div>
        <CardDescription>{bonusDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bonus Amount */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Bonus Amount</p>
            <p className="text-3xl font-bold text-purple-500">{formatCurrency(bonus.amount)}</p>
          </div>
        </div>

        {/* Claim Cost */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Claim Cost:</span>
          <span className="font-semibold">{formatCurrency(bonus.claim_cost)}</span>
        </div>

        {/* Claimed Info */}
        {isClaimed && bonus.claimed_at && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Claimed on {new Date(bonus.claimed_at).toLocaleDateString()}</span>
          </div>
        )}

        <Button
          onClick={onClaimClick}
          disabled={isClaimed}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isClaimed ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Already Claimed
            </>
          ) : (
            <>
              <Gift className="h-4 w-4 mr-2" />
              Claim Bonus
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
