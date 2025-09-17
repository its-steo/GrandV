"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, CheckCircle } from "lucide-react"

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
      <Card className="glass-card border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <Clock className="h-5 w-5" />
            No Active Package
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-600">
            You dont have an active package. Purchase one below to start earning from advertisements.
          </p>
        </CardContent>
      </Card>
    )
  }

  const isExpiringSoon = pkg.days_remaining <= 3
  const getRateColor = (rate: number) => {
    switch (rate) {
      case 90:
        return "bg-blue-500"
      case 100:
        return "bg-green-500"
      case 120:
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card
      className={`glass-card ${isExpiringSoon ? "border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50" : "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50"}`}
    >
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isExpiringSoon ? "text-orange-700" : "text-green-700"}`}>
          <CheckCircle className="h-5 w-5" />
          Current Package
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-semibold ${isExpiringSoon ? "text-orange-800" : "text-green-800"}`}>
            {pkg.name}
          </h3>
          <Badge className={`${getRateColor(pkg.rate_per_view)} text-white`}>KSH {pkg.rate_per_view}/view</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className={`h-4 w-4 ${isExpiringSoon ? "text-orange-600" : "text-green-600"}`} />
            <div>
              <p className="text-xs text-muted-foreground">Expires</p>
              <p className={`text-sm font-medium ${isExpiringSoon ? "text-orange-700" : "text-green-700"}`}>
                {new Date(pkg.expiry_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className={`h-4 w-4 ${isExpiringSoon ? "text-orange-600" : "text-green-600"}`} />
            <div>
              <p className="text-xs text-muted-foreground">Days Left</p>
              <p className={`text-sm font-medium ${isExpiringSoon ? "text-orange-700" : "text-green-700"}`}>
                {pkg.days_remaining} days
              </p>
            </div>
          </div>
        </div>

        {isExpiringSoon && (
          <div className="bg-orange-100 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-700">
              ⚠️ Your package expires soon! Purchase a new package to continue earning.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
