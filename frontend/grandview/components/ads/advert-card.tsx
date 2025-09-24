"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, DollarSign, Calendar, ImageIcon } from "lucide-react"
import { ApiService, type Advert } from "@/lib/api"
import { toast } from "sonner"

interface AdvertCardProps {
  advert: Advert
  onSubmissionSuccess: () => void
}

export function AdvertCard({ advert, onSubmissionSuccess }: AdvertCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [imageError, setImageError] = useState(false)

  const previewUrl = advert.file // Fixed: Use advert.file directly (full URL)

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
      toast.success("Download Started", {
        description: "Advert file is being downloaded",
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

  const getRateColor = (rate: number) => {
    switch (rate) {
      case 90:
        return "from-blue-500 to-blue-600"
      case 100:
        return "from-green-500 to-green-600"
      case 120:
        return "from-purple-500 to-purple-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  const getRateBadgeColor = (rate: number) => {
    switch (rate) {
      case 90:
        return "bg-blue-500"
      case 100:
        return "bg-green-500"
      case 120:
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="neon-card hover:scale-105 transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base sm:text-lg leading-tight group-hover:text-primary transition-colors text-balance">
            {advert.title}
          </CardTitle>
          <Badge
            className={`${getRateBadgeColor(advert.rate_category)} text-white shadow-lg text-xs sm:text-sm whitespace-nowrap`}
          >
            KSH {advert.rate_category}/view
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
          {new Date(advert.upload_date).toLocaleDateString()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted rounded-lg overflow-hidden relative group">
          {imageError ? (
            <div className="flex items-center justify-center h-full text-muted-foreground bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
              <div className="text-center">
                <ImageIcon className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
                <span className="text-xs sm:text-sm">Preview not available</span>
              </div>
            </div>
          ) : (
            <>
              <img
                src={previewUrl || "/placeholder.svg"}
                alt={advert.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </>
          )}
        </div>

        <div
          className={`p-3 sm:p-4 rounded-xl bg-gradient-to-r ${getRateColor(advert.rate_category)} text-white relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="font-bold text-base sm:text-lg">Earning Potential</span>
            </div>
            <p className="text-xs sm:text-sm opacity-90">Earn KSH {advert.rate_category} per view</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleDownload}
            disabled={isDownloading || !advert.can_submit}
            className="flex-1 neon-button-primary text-white font-semibold text-sm sm:text-base"
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            {isDownloading ? "Downloading..." : "Download"}
          </Button>

          {advert.has_submitted ? (
            <Badge
              variant="secondary"
              className="px-3 sm:px-4 py-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs sm:text-sm justify-center"
            >
              ✓ Submitted
            </Badge>
          ) : advert.can_submit ? (
            <Button
              onClick={onSubmissionSuccess}
              variant="outline"
              className="bg-gradient-to-r from-secondary/10 to-accent/10 border-secondary/50 text-secondary hover:bg-gradient-to-r hover:from-secondary hover:to-accent hover:text-white transition-all duration-300 shadow-lg text-sm sm:text-base"
            >
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Submit Views
            </Button>
          ) : (
            <Badge
              variant="destructive"
              className="px-3 sm:px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs sm:text-sm justify-center"
            >
              Package Required
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
