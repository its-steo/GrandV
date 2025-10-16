"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Calendar, Clock } from "lucide-react"
import type { AgentPurchase } from "@/lib/api"

interface AgentPurchaseCardProps {
  purchase: AgentPurchase
}

export function AgentPurchaseCard({ purchase }: AgentPurchaseCardProps) {
  const isActive = purchase.status === "ACTIVE"
  const daysRemaining = purchase.days_remaining

  return (
    <Card className={`glass-card ${isActive ? "border-green-500/30" : "border-red-500/30"}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className={`h-5 w-5 ${isActive ? "text-green-500" : "text-red-500"}`} />
            {purchase.package.name}
          </CardTitle>
          <Badge className={isActive ? "bg-green-500" : "bg-red-500"}>{purchase.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Package Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Purchase Date</span>
            </div>
            <p className="text-sm font-medium">{new Date(purchase.purchase_date).toLocaleDateString()}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Expiry Date</span>
            </div>
            <p className="text-sm font-medium">{new Date(purchase.expiry_date).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Days Remaining */}
        {isActive && (
          <div className="p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Days Remaining</span>
              </div>
              <span className="text-2xl font-bold text-green-500">{daysRemaining}</span>
            </div>
          </div>
        )}

        {/* Package Info */}
        <div className="text-sm text-muted-foreground">
          <p>{purchase.package.description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
