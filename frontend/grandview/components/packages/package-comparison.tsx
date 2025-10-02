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
      <Card className="bg-blue-600 border-0">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-2xl font-extrabold text-white">Package Comparison</CardTitle>
          <p className="text-center text-white/80 text-sm sm:text-base">Compare features across all packages</p>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex justify-between items-center py-3">
                <div className="w-48 h-4 bg-white/20 rounded" />
                <div className="flex gap-8 sm:gap-12">
                  <div className="w-6 h-6 bg-white/20 rounded-full" />
                  <div className="w-6 h-6 bg-white/20 rounded-full" />
                  <div className="w-6 h-6 bg-white/20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-blue-600 border-0">
      <CardHeader className="text-center space-y-4">
        <CardTitle className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-md">Package Comparison</CardTitle>
        <p className="text-white/80 text-base sm:text-lg">Compare features across all packages to find your perfect fit</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-white/30">
                <th className="text-left py-4 sm:py-6 px-4 sm:px-6 font-semibold text-base sm:text-lg text-white">Features</th>
                <th className="text-center py-4 sm:py-6 px-4 sm:px-6 min-w-[120px] sm:min-w-[140px]">
                  <div className="space-y-2">
                    <div className="text-white font-extrabold text-base sm:text-lg">Starter</div>
                    <div className="text-sm text-white/80">KSH 90/view</div>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </th>
                <th className="text-center py-4 sm:py-6 px-4 sm:px-6 min-w-[120px] sm:min-w-[140px] relative">
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      POPULAR
                    </span>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="text-white font-extrabold text-base sm:text-lg">Standard</div>
                    <div className="text-sm text-white/80">KSH 100/view</div>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </th>
                <th className="text-center py-4 sm:py-6 px-4 sm:px-6 min-w-[120px] sm:min-w-[140px]">
                  <div className="space-y-2">
                    <div className="text-white font-extrabold text-base sm:text-lg">Premium</div>
                    <div className="text-sm text-white/80">KSH 120/view</div>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={index} className="border-b border-white/20 hover:bg-white/10 transition-colors">
                  <td className="py-3 sm:py-4 px-4 sm:px-6 font-medium text-white text-sm sm:text-base">{feature.name}</td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6 text-center">
                    {feature.basic ? (
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                        <X className="h-4 w-4 text-white/60" />
                      </div>
                    )}
                  </td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6 text-center">
                    {feature.standard ? (
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                        <X className="h-4 w-4 text-white/60" />
                      </div>
                    )}
                  </td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6 text-center">
                    {feature.premium ? (
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                        <X className="h-4 w-4 text-white/60" />
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