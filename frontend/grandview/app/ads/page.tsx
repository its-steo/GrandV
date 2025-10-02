"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { AdvertCard } from "@/components/ads/advert-card"
import { SubmissionModal } from "@/components/ads/submission-modal"
import { PackageStatus } from "@/components/ads/package-status"
import { ApiService, type Advert, type UserPackage } from "@/lib/api"
import { toast } from "sonner"
import { Loader2, Play, TrendingUp, DollarSign, Eye, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

// Error Boundary Component
import { ErrorBoundary } from "react-error-boundary"

// Use Submission type from API
import type { Submission } from "@/lib/api"

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

// Function to format currency with commas
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KSH' }).format(amount)
}

function AdsPage() {
  const [adverts, setAdverts] = useState<Advert[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAdvert, setSelectedAdvert] = useState<Advert | null>(null)
  const [userPackage, setUserPackage] = useState<UserPackage | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [totalEarnings, setTotalEarnings] = useState<number>(0)

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

  const fetchHistory = useCallback(async () => {
    try {
      const data = await ApiService.getSubmissions()
      setSubmissions(data.submissions || [])
      setTotalEarnings(data.total_earnings || 0)
    } catch (error) {
      toast.error("Failed to load submission history", {
        description: error instanceof Error ? error.message : "Please try again later.",
      })
      setSubmissions([])
    }
  }, [])

  useEffect(() => {
    fetchAdverts()
    fetchHistory()
  }, [fetchAdverts, fetchHistory])

  const handleSubmissionSuccess = useCallback(() => {
    fetchAdverts()
    fetchHistory()
    setSelectedAdvert(null)
  }, [fetchAdverts, fetchHistory])

  const availableAdverts = adverts.filter((ad) => ad.can_submit && !ad.has_submitted)
  const submittedAdverts = adverts.filter((ad) => ad.has_submitted)

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Sidebar />
        <div className="md:ml-64 p-4 sm:p-6" role="main" aria-label="Advertisements page">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center"
                >
                  <Eye className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                    Advertisements
                  </h1>
                  <p className="text-gray-300 text-sm sm:text-base md:text-lg mt-1 font-semibold">
                    Advertise on WhatsApp, submit Views, and earn Rewards
                  </p>
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button asChild className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
                  <Link href="/dashboard">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {userPackage && (
            <PackageStatus
              hasActivePackage={!!userPackage}
              packageName={userPackage?.name}
              packageRate={userPackage?.rate_per_view}
              expiryDate={userPackage?.expiry_date}
            />
          )}

          <Card className="bg-white/10 border-white/20 backdrop-blur-md mb-6 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <DollarSign className="h-6 w-6" />
                Total Ad Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-400">{formatCurrency(totalEarnings)}</p>
            </CardContent>
          </Card>

          {loading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
                  <p className="text-gray-300">Loading advertisements...</p>
                </div>
              </div>
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <AdvertSkeleton />
                <AdvertSkeleton />
                <AdvertSkeleton />
              </div>
            </div>
          ) : (
            <div className="space-y-8 sm:space-y-12">
              {availableAdverts.length > 0 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <h2 className="text-xl sm:text-2xl font-bold text-green-400">
                      Available Advertisements
                    </h2>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/50 px-3 py-1 w-fit">
                      {availableAdverts.length} Available
                    </Badge>
                  </div>
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {availableAdverts.map((advert) => (
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
                    <h2 className="text-xl sm:text-2xl font-bold text-blue-400">
                      Completed Today
                    </h2>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 px-3 py-1 w-fit">
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

              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-purple-400">
                    Submission History
                  </h2>
                  <Badge className="bg-blue-500/20 text-purple-400 border-purple-500/50 px-3 py-1 w-fit">
                    {submissions.length} Submissions
                  </Badge>
                </div>
                {submissions.length === 0 ? (
                  <Card className="bg-white/10 border-white/20 backdrop-blur-md text-center py-12">
                    <CardContent>
                      <p className="text-gray-300 text-lg">No submissions yet. Start advertising ads to earn!</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {submissions.map((sub) => (
                      <Card key={sub.id} className="bg-white/10 border-white/20 backdrop-blur-md hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-shadow duration-300">
                        <CardHeader>
                          <CardTitle className="text-lg font-bold text-white">{sub.advert_title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="flex items-center gap-2 text-gray-300">
                            <Eye className="h-4 w-4 text-blue-400" />
                            Views: <span className="font-semibold">{sub.views_count}</span>
                          </p>
                          <p className="flex items-center gap-2 text-gray-300">
                            <DollarSign className="h-4 w-4 text-green-400" />
                            Earnings: <span className="font-semibold">{formatCurrency(parseFloat(sub.earnings))}</span>
                          </p>
                          <p className="flex items-center gap-2 text-gray-300">
                            <Calendar className="h-4 w-4 text-purple-400" />
                            Date: <span className="font-semibold">{new Date(sub.submission_date).toLocaleDateString()}</span>
                          </p>
                          <Badge variant="default" className="mt-2 bg-green-500/20 text-green-400 border-green-500/50">Submitted</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {userPackage && availableAdverts.length === 0 && submittedAdverts.length === 0 && (
                <Card className="bg-white/10 border-white/20 backdrop-blur-md text-center py-12 sm:py-16">
                  <CardContent>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full blur-3xl"></div>
                      <Play className="relative h-12 w-12 sm:h-16 sm:w-16 text-orange-500 mx-auto mb-4 sm:mb-6" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-orange-400">
                      No Advertisements Available
                    </h3>
                    <p className="text-gray-300 text-base sm:text-lg">
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
              onSuccess={handleSubmissionSuccess}
            />
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default memo(AdsPage)