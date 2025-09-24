"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface CurrentPackageProps {
  package: {
    name: string
    rate_per_view: number
    expiry_date: string
    days_remaining: number
  } | null
}

export function CurrentPackage({ package: pkg }: CurrentPackageProps) {
  if (!pkg) {
    return (
      <Card className="professional-card border-orange-200 bg-gradient-to-r from-orange-50/50 to-yellow-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-orange-700">
            <AlertTriangle className="h-6 w-6" />
            No Active Package
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-orange-600 text-balance">
            You dont have an active package. Purchase one below to start earning from premium advertisements.
          </p>
          <div className="bg-orange-100 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-700 font-medium">
              💡 Choose a package to unlock earning opportunities and start viewing ads immediately.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isExpiringSoon = pkg.days_remaining <= 3
  const getRateTheme = (rate: number) => {
    switch (rate) {
      case 90:
        return { color: "blue", bg: "from-blue-50 to-blue-100", text: "text-blue-700", badge: "bg-blue-500" }
      case 100:
        return { color: "green", bg: "from-chart-1/10 to-chart-2/10", text: "text-chart-1", badge: "bg-chart-1" }
      case 120:
        return { color: "purple", bg: "from-primary/10 to-accent/10", text: "text-primary", badge: "bg-primary" }
      default:
        return { color: "gray", bg: "from-muted/10 to-muted/20", text: "text-muted-foreground", badge: "bg-muted" }
    }
  }

  const theme = getRateTheme(pkg.rate_per_view)

  return (
    <Card
      className={`professional-card elegant-shadow-lg ${
        isExpiringSoon
          ? "border-orange-200 bg-gradient-to-r from-orange-50/50 to-yellow-50/50"
          : `border-${theme.color}-200 bg-gradient-to-r ${theme.bg}`
      }`}
    >
      <CardHeader>
        <CardTitle className={`flex items-center gap-3 ${isExpiringSoon ? "text-orange-700" : theme.text}`}>
          <CheckCircle className="h-6 w-6" />
          Active Package
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-xl font-bold ${isExpiringSoon ? "text-orange-800" : theme.text}`}>{pkg.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">Your current earning package</p>
          </div>
          <Badge className={`${theme.badge} text-white px-3 py-1 font-semibold`}>
            {formatCurrency(pkg.rate_per_view)}/view
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div
            className={`p-4 rounded-lg ${isExpiringSoon ? "bg-orange-100" : "bg-background/50"} border ${isExpiringSoon ? "border-orange-200" : "border-border/50"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar className={`h-4 w-4 ${isExpiringSoon ? "text-orange-600" : theme.text}`} />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Expires On</span>
            </div>
            <p className={`font-semibold ${isExpiringSoon ? "text-orange-700" : theme.text}`}>
              {new Date(pkg.expiry_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <div
            className={`p-4 rounded-lg ${isExpiringSoon ? "bg-orange-100" : "bg-background/50"} border ${isExpiringSoon ? "border-orange-200" : "border-border/50"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className={`h-4 w-4 ${isExpiringSoon ? "text-orange-600" : theme.text}`} />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Days Left</span>
            </div>
            <p className={`font-semibold ${isExpiringSoon ? "text-orange-700" : theme.text}`}>
              {pkg.days_remaining} days
            </p>
          </div>
        </div>

        {isExpiringSoon && (
          <div className="bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-orange-800 mb-1">Package Expiring Soon!</h4>
                <p className="text-sm text-orange-700">
                  Your package expires in {pkg.days_remaining} day{pkg.days_remaining !== 1 ? "s" : ""}. Purchase a new
                  package to continue earning without interruption.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
