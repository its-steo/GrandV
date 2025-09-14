"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X } from "lucide-react"
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
        // Fallback to basic features if API fails
        setFeatures([
          { name: "Access to advertisements", basic: true, standard: true, premium: true },
          { name: "Instant earnings", basic: true, standard: true, premium: true },
          { name: "24/7 support", basic: true, standard: true, premium: true },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchPackageFeatures()
  }, [])

  if (loading) {
    return (
      <Card className="glass-card border-white/20">
        <CardHeader>
          <CardTitle className="text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Package Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="w-32 h-4 bg-muted rounded"></div>
                <div className="flex gap-8">
                  <div className="w-6 h-6 bg-muted rounded"></div>
                  <div className="w-6 h-6 bg-muted rounded"></div>
                  <div className="w-6 h-6 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card border-white/20">
      <CardHeader>
        <CardTitle className="text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Package Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4">Features</th>
                <th className="text-center py-3 px-4">
                  <div className="text-blue-600 font-semibold">Basic</div>
                  <div className="text-sm text-muted-foreground">KSH 90/view</div>
                </th>
                <th className="text-center py-3 px-4">
                  <div className="text-green-600 font-semibold">Standard</div>
                  <div className="text-sm text-muted-foreground">KSH 100/view</div>
                </th>
                <th className="text-center py-3 px-4">
                  <div className="text-purple-600 font-semibold">Premium</div>
                  <div className="text-sm text-muted-foreground">KSH 120/view</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={index} className="border-b border-white/10">
                  <td className="py-3 px-4 text-sm">{feature.name}</td>
                  <td className="py-3 px-4 text-center">
                    {feature.basic ? (
                      <Check className="h-4 w-4 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {feature.standard ? (
                      <Check className="h-4 w-4 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {feature.premium ? (
                      <Check className="h-4 w-4 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400 mx-auto" />
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
