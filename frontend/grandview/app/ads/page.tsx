"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { AdvertCard } from "@/components/ads/advert-card"
import { SubmissionModal } from "@/components/ads/submission-modal"
import { PackageStatus } from "@/components/ads/package-status"
import { ApiService, type Advert, type UserPackage } from "@/lib/api"
import { toast } from "sonner"
import { Loader2, Play, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdsPage() {
  const [adverts, setAdverts] = useState<Advert[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAdvert, setSelectedAdvert] = useState<Advert | null>(null)
  const [userPackage, setUserPackage] = useState<UserPackage | null>(null)

  useEffect(() => {
    fetchAdverts()
  }, [])

  const fetchAdverts = async () => {
    try {
      setLoading(true)
      const response = await ApiService.getAdverts()
      setAdverts(response.adverts || [])
      setUserPackage(response.user_package)
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : "Failed to load advertisements"}`)
      setUserPackage(null)
      setAdverts([])
    } finally {
      setLoading(false)
    }
  }

 const handleSubmissionSuccess = (advertId: number) => {
  console.log(`Advert ${advertId} submitted successfully`); // Example usage
  setSelectedAdvert(null);
  fetchAdverts();
};

  const availableAdverts = adverts.filter((ad) => ad.can_submit && !ad.has_submitted)
  const submittedAdverts = adverts.filter((ad) => ad.has_submitted)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <Sidebar />
        <div className="md:ml-64 p-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <Sidebar />
      <div className="md:ml-64 p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Advertisements
              </h1>
              <p className="text-muted-foreground">View ads and earn money based on your package</p>
            </div>
            {userPackage && (
              <div className="flex items-center gap-4">
                <Card className="glass-card border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">KSH {userPackage.rate_per_view}</span>
                  </div>
                  <p className="text-xs text-green-600">Per View</p>
                </Card>
              </div>
            )}
          </div>

          {/* Package Status */}
          <PackageStatus
            hasActivePackage={!!userPackage}
            packageRate={userPackage?.rate_per_view}
            packageName={userPackage?.name}
            expiryDate={userPackage?.expiry_date}
          />

          {!userPackage && (
            <Card className="glass-card border-white/20 text-center py-12">
              <CardContent>
                <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Get Started with Ads</h3>
                <p className="text-muted-foreground mb-4">
                  Purchase a package to unlock advertisements and start earning.
                </p>
                <Link href="/packages">
                  <Button className="bg-gradient-to-r from-primary to-secondary">Choose Package</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {userPackage && availableAdverts.length > 0 && (
            <div className="space-y-4 mb-8">
              <h2 className="text-xl font-semibold">Available Advertisements</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availableAdverts.map((advert) => (
                  <AdvertCard key={advert.id} advert={advert} onSubmissionSuccess={() => setSelectedAdvert(advert)} />
                ))}
              </div>
            </div>
          )}

          {submittedAdverts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Completed Today</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {submittedAdverts.map((advert) => (
                  <AdvertCard key={advert.id} advert={advert} onSubmissionSuccess={() => {}} />
                ))}
              </div>
            </div>
          )}

          {userPackage && availableAdverts.length === 0 && submittedAdverts.length === 0 && (
            <Card className="glass-card border-white/20 text-center py-12">
              <CardContent>
                <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Advertisements Available</h3>
                <p className="text-muted-foreground">Check back later for new advertisements to view and earn from.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {selectedAdvert && (
        <SubmissionModal
          isOpen={!!selectedAdvert}
          onClose={() => setSelectedAdvert(null)}
          advertId={selectedAdvert.id} // Restored advertId prop
          advertTitle={selectedAdvert.title}
          ratePerView={selectedAdvert.rate_category}
          onSuccess={() => handleSubmissionSuccess(selectedAdvert.id)}
        />
      )}
    </div>
  )
}