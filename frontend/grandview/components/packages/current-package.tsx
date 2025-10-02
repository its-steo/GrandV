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
      <Card className="bg-orange-500 border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white font-extrabold text-xl sm:text-2xl">
            <AlertTriangle className="h-6 w-6" />
            No Active Package
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-white/90 text-base sm:text-lg">
            You dont have an active package. Purchase one below to start earning from premium advertisements.
          </p>
          <div className="bg-white/20 border border-white/30 rounded-lg p-4">
            <p className="text-sm text-white font-medium">
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
        return { color: "blue-600", bg: "bg-blue-600", text: "text-white", badge: "bg-blue-600" }
      case 100:
        return { color: "green-500", bg: "bg-green-500", text: "text-white", badge: "bg-green-500" }
      case 120:
        return { color: "pink-600", bg: "bg-pink-600", text: "text-white", badge: "bg-pink-600" }
      default:
        return { color: "gray-500", bg: "bg-gray-500", text: "text-white", badge: "bg-gray-500" }
    }
  }

  const theme = getRateTheme(pkg.rate_per_view)

  return (
    <Card
      className={`${isExpiringSoon ? "bg-orange-500" : theme.bg} border-0`}
    >
      <CardHeader>
        <CardTitle className={`flex items-center gap-3 ${isExpiringSoon ? "text-white" : theme.text} font-extrabold text-xl sm:text-2xl`}>
          <CheckCircle className="h-6 w-6" />
          Active Package
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className={`text-xl sm:text-2xl font-extrabold ${isExpiringSoon ? "text-white" : theme.text}`}>{pkg.name}</h3>
            <p className="text-sm text-white/80 mt-1">Your current earning package</p>
          </div>
          <Badge className={`${theme.badge} text-white px-4 py-1.5 font-semibold text-sm`}>
            {formatCurrency(pkg.rate_per_view)}/view
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg bg-white/20 border border-white/30`}>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className={`h-4 w-4 ${isExpiringSoon ? "text-white" : theme.text}`} />
              <span className="text-xs font-medium text-white/80 uppercase tracking-wide">Expires On</span>
            </div>
            <p className={`font-semibold ${isExpiringSoon ? "text-white" : theme.text} text-sm sm:text-base`}>
              {new Date(pkg.expiry_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <div className={`p-4 rounded-lg bg-white/20 border border-white/30`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className={`h-4 w-4 ${isExpiringSoon ? "text-white" : theme.text}`} />
              <span className="text-xs font-medium text-white/80 uppercase tracking-wide">Days Left</span>
            </div>
            <p className={`font-semibold ${isExpiringSoon ? "text-white" : theme.text} text-sm sm:text-base`}>
              {pkg.days_remaining} days
            </p>
          </div>
        </div>

        {isExpiringSoon && (
          <div className="bg-white/20 border border-white/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-white text-base sm:text-lg mb-1">Package Expiring Soon!</h4>
                <p className="text-sm text-white/90">
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