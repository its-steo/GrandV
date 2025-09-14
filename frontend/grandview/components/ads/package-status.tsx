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
      <Card className="glass-card border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <AlertCircle className="h-5 w-5" />
            No Active Package
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-600 mb-4">You need an active package to view and earn from advertisements.</p>
          <Link href="/packages">
            <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white">
              <Package className="h-4 w-4 mr-2" />
              Browse Packages
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <CheckCircle className="h-5 w-5" />
          Active Package
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-green-800">{packageName}</span>
          <Badge className="bg-green-500 text-white">KSH {packageRate}/view</Badge>
        </div>
        <p className="text-sm text-green-600">
          Expires: {expiryDate ? new Date(expiryDate).toLocaleDateString() : "N/A"}
        </p>
      </CardContent>
    </Card>
  )
}
