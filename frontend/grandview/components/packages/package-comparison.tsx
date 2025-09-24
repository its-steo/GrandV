"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X, Star } from "lucide-react"
import { ApiService } from "@/lib/api"

interface PackageFeature {
  name: string
  basic: boolean
  standard: boolean
  premium: boolean
}

export function PackageComparison() {
  const [features, setFeatures] = useState<PackageFeature[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPackageFeatures = async () => {
      try {
        const data = await ApiService.getPackageFeatures()
        setFeatures(data)
      } catch (error) {
        console.error("Failed to fetch package features:", error)
        setFeatures([
          { name: "Access to premium advertisements", basic: true, standard: true, premium: true },
          { name: "Instant earnings processing", basic: true, standard: true, premium: true },
          { name: "24/7 customer support", basic: true, standard: true, premium: true },
          { name: "Priority ad queue access", basic: false, standard: true, premium: true },
          { name: "Exclusive high-rate campaigns", basic: false, standard: false, premium: true },
          { name: "Dedicated account manager", basic: false, standard: false, premium: true },
          { name: "Advanced analytics dashboard", basic: false, standard: true, premium: true },
          { name: "Early access to new features", basic: false, standard: false, premium: true },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchPackageFeatures()
  }, [])

  if (loading) {
    return (
      <Card className="professional-card">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Package Comparison</CardTitle>
          <p className="text-center text-muted-foreground">Compare features across all packages</p>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex justify-between items-center py-3">
                <div className="w-48 h-4 bg-muted rounded" />
                <div className="flex gap-12">
                  <div className="w-6 h-6 bg-muted rounded" />
                  <div className="w-6 h-6 bg-muted rounded" />
                  <div className="w-6 h-6 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="professional-card">
      <CardHeader className="text-center space-y-4">
        <CardTitle className="text-3xl font-bold">Package Comparison</CardTitle>
        <p className="text-muted-foreground text-lg">Compare features across all packages to find your perfect fit</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-6 px-6 font-semibold text-lg">Features</th>
                <th className="text-center py-6 px-6 min-w-[140px]">
                  <div className="space-y-2">
                    <div className="text-blue-600 font-bold text-lg">Starter</div>
                    <div className="text-sm text-muted-foreground">KSH 90/view</div>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <Star className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                </th>
                <th className="text-center py-6 px-6 min-w-[140px] relative">
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-chart-1 to-chart-2 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      POPULAR
                    </span>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="text-chart-1 font-bold text-lg">Standard</div>
                    <div className="text-sm text-muted-foreground">KSH 100/view</div>
                    <div className="w-8 h-8 bg-chart-1/20 rounded-full flex items-center justify-center mx-auto">
                      <Star className="h-4 w-4 text-chart-1" />
                    </div>
                  </div>
                </th>
                <th className="text-center py-6 px-6 min-w-[140px]">
                  <div className="space-y-2">
                    <div className="text-primary font-bold text-lg">Premium</div>
                    <div className="text-sm text-muted-foreground">KSH 120/view</div>
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                      <Star className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={index} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="py-4 px-6 font-medium">{feature.name}</td>
                  <td className="py-4 px-6 text-center">
                    {feature.basic ? (
                      <div className="w-6 h-6 bg-chart-1/20 rounded-full flex items-center justify-center mx-auto">
                        <Check className="h-4 w-4 text-chart-1" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
                        <X className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {feature.standard ? (
                      <div className="w-6 h-6 bg-chart-1/20 rounded-full flex items-center justify-center mx-auto">
                        <Check className="h-4 w-4 text-chart-1" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
                        <X className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {feature.premium ? (
                      <div className="w-6 h-6 bg-chart-1/20 rounded-full flex items-center justify-center mx-auto">
                        <Check className="h-4 w-4 text-chart-1" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
                        <X className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
