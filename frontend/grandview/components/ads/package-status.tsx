"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, AlertCircle, CheckCircle, Sparkles, Zap } from "lucide-react"
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
      <Card className="bright-card border-2 border-warning/30 bg-gradient-to-r from-warning/10 to-secondary/10 mb-6 neon-glow">
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-4 text-warning">
            <div className="w-12 h-12 bg-gradient-to-r from-warning to-secondary rounded-xl flex items-center justify-center pulse-bright">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold gradient-text">⚠️ No Active Package</span>
              <p className="text-sm text-muted-foreground font-normal mt-1">Unlock your earning potential!</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6 text-lg text-pretty">
            🚀 Get ready to earn big! Choose a package and start making money with our premium advertisements.
          </p>
          <Link href="/packages">
            <Button className="btn-bright-primary text-white px-6 py-3 text-lg font-semibold w-full sm:w-auto">
              <Package className="h-5 w-5 mr-2" />
              <Sparkles className="h-4 w-4 mr-1" />
              Browse Packages
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bright-card border-2 border-success/30 bg-gradient-to-r from-success/10 to-accent/10 mb-6 neon-glow-success pulse-bright">
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-4 text-success">
          <div className="w-12 h-12 bg-gradient-to-r from-success to-accent rounded-xl flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-bold gradient-text">✅ Package Active!</span>
            <p className="text-sm text-muted-foreground font-normal mt-1">You are earning money! 🎉</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-success" />
            <span className="font-bold text-success text-lg">{packageName}</span>
          </div>
          <Badge className="bg-gradient-to-r from-success to-accent text-white px-4 py-2 text-lg font-bold w-fit neon-glow-success">
            💰 KSH {packageRate}/view
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>⏰ Expires:</span>
          <span className="font-semibold">{expiryDate ? new Date(expiryDate).toLocaleDateString() : "N/A"}</span>
        </div>
      </CardContent>
    </Card>
  )
}
