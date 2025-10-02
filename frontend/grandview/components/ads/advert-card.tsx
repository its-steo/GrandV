"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, DollarSign, Calendar, ImageIcon, Sparkles } from "lucide-react"
import { ApiService, type Advert } from "@/lib/api"
import { toast } from "sonner"

interface AdvertCardProps {
  advert: Advert
  onSubmissionSuccess: () => void
}

export function AdvertCard({ advert, onSubmissionSuccess }: AdvertCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [imageError, setImageError] = useState(false)

  const previewUrl = advert.file

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      const blob = await ApiService.downloadAdvert(advert.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const extension = advert.file.split(".").pop() || "file"
      a.download = `advert-${advert.id}.${extension}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("🎉 Download Started!", {
        description: "Your ad file is ready to view",
      })
    } catch (error) {
      toast.error("Download Failed", {
        description: error instanceof Error ? error.message : "Failed to download advert",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const getRateGradient = (rate: number) => {
    switch (rate) {
      case 90:
        return "from-primary to-accent"
      case 100:
        return "from-success to-accent"
      case 120:
        return "from-secondary to-warning"
      default:
        return "from-muted-foreground to-muted"
    }
  }

  const getRateBadgeGradient = (rate: number) => {
    switch (rate) {
      case 90:
        return "bg-gradient-to-r from-primary to-accent"
      case 100:
        return "bg-gradient-to-r from-success to-accent"
      case 120:
        return "bg-gradient-to-r from-secondary to-warning"
      default:
        return "bg-gradient-to-r from-muted-foreground to-muted"
    }
  }

  return (
    <Card className="bright-card hover:scale-105 hover:neon-glow transition-all duration-300 group overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg sm:text-xl leading-tight group-hover:gradient-text transition-all duration-300 text-balance font-bold">
            {advert.title}
          </CardTitle>
          <Badge
            className={`${getRateBadgeGradient(advert.rate_category)} text-white shadow-lg text-sm font-bold whitespace-nowrap px-3 py-1 neon-glow`}
          >
            💰 KSH {advert.rate_category}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {new Date(advert.upload_date).toLocaleDateString()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="aspect-video bg-gradient-to-br from-muted/30 to-muted/60 rounded-xl overflow-hidden relative group/image">
          {imageError ? (
            <div className="flex items-center justify-center h-full text-muted-foreground bg-gradient-to-br from-primary/10 to-secondary/10">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium">Preview Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <img
                src={previewUrl || "/placeholder.svg"}
                alt={advert.title}
                className="w-full h-full object-cover group-hover/image:scale-110 transition-transform duration-500"
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute top-3 right-3 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Eye className="w-4 h-4 text-white" />
                </div>
              </div>
            </>
          )}
        </div>

        <div
          className={`p-4 rounded-xl bg-gradient-to-r ${getRateGradient(advert.rate_category)} text-white relative overflow-hidden neon-glow`}
        >
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="absolute top-2 right-2">
            <Sparkles className="h-5 w-5 text-white/70" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5" />
              <span className="font-bold text-lg">Earning Power!</span>
            </div>
            <p className="text-sm opacity-90 font-medium">💸 Earn KSH {advert.rate_category} per view</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleDownload}
            disabled={isDownloading || !advert.can_submit}
            className="flex-1 btn-bright-primary font-semibold"
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? "Downloading..." : "📥 Download"}
          </Button>

          {advert.has_submitted ? (
            <Badge
              variant="secondary"
              className="px-4 py-3 bg-gradient-to-r from-success to-accent text-white font-semibold text-sm justify-center neon-glow-success"
            >
              ✅ Submitted
            </Badge>
          ) : advert.can_submit ? (
            <Button onClick={onSubmissionSuccess} className="btn-bright-secondary font-semibold">
              <Eye className="h-4 w-4 mr-2" />
              👁️ Submit Views
            </Button>
          ) : (
            <Badge
              variant="destructive"
              className="px-4 py-3 bg-gradient-to-r from-destructive to-warning text-white font-semibold text-sm justify-center"
            >
              🔒 Package Required
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
