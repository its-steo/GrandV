"use client"

import { useState, useEffect, useCallback, memo } from "react"
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
import { Badge } from "@/components/ui/badge"

// Error Boundary Component
import { ErrorBoundary } from "react-error-boundary"

const ErrorFallback = ({ error }: { error: Error }) => (
  <Card className="glass-bright text-center py-12">
    <CardContent>
      <h3 className="text-xl font-bold text-red-600">Something went wrong</h3>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={() => window.location.reload()} className="mt-4 neon-button-primary">
        Retry
      </Button>
    </CardContent>
  </Card>
)

// Skeleton Loader Component
const AdvertSkeleton = () => (
  <Card className="neon-card animate-pulse">
    <CardContent className="space-y-4 p-6">
      <div className="h-6 w-3/4 bg-muted rounded"></div>
      <div className="h-4 w-1/2 bg-muted rounded"></div>
      <div className="aspect-video bg-muted rounded-lg"></div>
      <div className="h-16 w-full bg-muted rounded-xl"></div>
      <div className="flex gap-3">
        <div className="h-10 w-1/2 bg-muted rounded"></div>
        <div className="h-10 w-1/2 bg-muted rounded"></div>
      </div>
    </CardContent>
  </Card>
)

function AdsPage() {
  const [adverts, setAdverts] = useState<Advert[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAdvert, setSelectedAdvert] = useState<Advert | null>(null)
  const [userPackage, setUserPackage] = useState<UserPackage | null>(null)

  const fetchAdverts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await ApiService.getAdverts()
      setAdverts(response.adverts || [])
      setUserPackage(response.user_package)
    } catch (error) {
      toast.error("Failed to load advertisements", {
        description: error instanceof Error ? error.message : "Please try again later.",
      })
      setUserPackage(null)
      setAdverts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAdverts()
  }, [fetchAdverts])

  const handleSubmissionSuccess = useCallback((advertId: number) => {
    setSelectedAdvert(null)
    fetchAdverts()
  }, [fetchAdverts])

  const availableAdverts = adverts.filter((ad) => ad.can_submit && !ad.has_submitted)
  const submittedAdverts = adverts.filter((ad) => ad.has_submitted)

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <Sidebar />
        <div className="md:ml-64 p-4 sm:p-6" role="main" aria-label="Advertisements page">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground">Loading advertisements...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Advertisements
                  </h1>
                  <p className="text-base sm:text-lg text-muted-foreground mt-2">
                    View ads and earn money based on your package
                  </p>
                </div>
                {userPackage && (
                  <Card className="neon-card p-3 sm:p-4">
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-base sm:text-lg">KSH {userPackage.rate_per_view}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Per View</p>
                  </Card>
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
                <Card className="glass-bright text-center py-12 sm:py-16">
                  <CardContent>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl"></div>
                      <Play className="relative h-12 w-12 sm:h-16 sm:w-16 text-primary mx-auto mb-4 sm:mb-6" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Get Started with Ads
                    </h3>
                    <p className="text-muted-foreground mb-4 sm:mb-6 text-base sm:text-lg">
                      Purchase a package to unlock advertisements and start earning.
                    </p>
                    <Link href="/packages">
                      <Button className="neon-button-primary text-white px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg">
                        Choose Package
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {userPackage && availableAdverts.length > 0 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                      Available Advertisements
                    </h2>
                    <Badge className="neon-badge-green text-white px-3 py-1 w-fit">
                      {availableAdverts.length} Available
                    </Badge>
                  </div>
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {loading
                      ? Array(6)
                          .fill(0)
                          .map((_, i) => <AdvertSkeleton key={i} />)
                      : availableAdverts.map((advert) => (
                          <AdvertCard
                            key={advert.id}
                            advert={advert}
                            onSubmissionSuccess={() => setSelectedAdvert(advert)}
                          />
                        ))}
                  </div>
                </div>
              )}

              {submittedAdverts.length > 0 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                      Completed Today
                    </h2>
                    <Badge className="neon-badge-blue text-white px-3 py-1 w-fit">
                      {submittedAdverts.length} Completed
                    </Badge>
                  </div>
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {submittedAdverts.map((advert) => (
                      <AdvertCard key={advert.id} advert={advert} onSubmissionSuccess={() => {}} />
                    ))}
                  </div>
                </div>
              )}

              {userPackage && availableAdverts.length === 0 && submittedAdverts.length === 0 && (
                <Card className="glass-bright text-center py-12 sm:py-16">
                  <CardContent>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full blur-3xl"></div>
                      <Play className="relative h-12 w-12 sm:h-16 sm:w-16 text-orange-500 mx-auto mb-4 sm:mb-6" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                      No Advertisements Available
                    </h3>
                    <p className="text-muted-foreground text-base sm:text-lg">
                      Check back later for new advertisements to view and earn from.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {selectedAdvert && (
            <SubmissionModal
              isOpen={!!selectedAdvert}
              onClose={() => setSelectedAdvert(null)}
              advertId={selectedAdvert.id}
              advertTitle={selectedAdvert.title}
              ratePerView={selectedAdvert.rate_category}
              onSuccess={() => handleSubmissionSuccess(selectedAdvert.id)}
            />
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default memo(AdsPage)