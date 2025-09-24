"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

interface PackageStatusProps {
  hasActivePackage: boolean
  packageRate?: number
  packageName?: string
  expiryDate?: string
}

export function PackageStatus({ hasActivePackage, packageRate, packageName, expiryDate }: PackageStatusProps) {
  if (!hasActivePackage) {
    return (
      <Card className="glass-bright border-orange-200/50 bg-gradient-to-r from-orange-50/80 to-yellow-50/80 dark:from-orange-900/20 dark:to-yellow-900/20 mb-4 sm:mb-6 shadow-xl">
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-3 text-orange-700 dark:text-orange-300">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg w-fit">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span className="text-lg sm:text-xl">No Active Package</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-600 dark:text-orange-400 mb-4 sm:mb-6 text-base sm:text-lg text-balance">
            You need an active package to view and earn from advertisements.
          </p>
          <Link href="/packages">
            <Button className="neon-button-primary text-white px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg font-semibold w-full sm:w-auto">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Browse Packages
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-bright border-green-200/50 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 mb-4 sm:mb-6 shadow-xl pulse-neon">
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-3 text-green-700 dark:text-green-300">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg w-fit">
            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <span className="text-lg sm:text-xl">Active Package</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
          <span className="font-bold text-green-800 dark:text-green-200 text-base sm:text-lg">{packageName}</span>
          <Badge className="neon-badge-green text-white px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-lg font-bold w-fit">
            KSH {packageRate}/view
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">
          Expires: {expiryDate ? new Date(expiryDate).toLocaleDateString() : "N/A"}
        </p>
      </CardContent>
    </Card>
  )
}
