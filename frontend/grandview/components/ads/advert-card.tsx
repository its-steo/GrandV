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
    <Card className="glass-card border-white/20 hover:border-primary/30 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-tight">{advert.title}</CardTitle>
          <Badge className={`${getRateBadgeColor(advert.rate_category)} text-white`}>
            KSH {advert.rate_category}/view
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {new Date(advert.upload_date).toLocaleDateString()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
          {imageError ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <ImageIcon className="h-8 w-8" />
              <span className="ml-2 text-sm">Preview not available</span>
            </div>
          ) : (
            <img
              src={previewUrl || "/placeholder.svg"}
              alt={advert.title}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          )}
        </div>

        <div className={`p-4 rounded-lg bg-gradient-to-r ${getRateColor(advert.rate_category)} text-white`}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5" />
            <span className="font-semibold">Earning Potential</span>
          </div>
          <p className="text-sm opacity-90">Earn KSH {advert.rate_category} per view</p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleDownload}
            disabled={isDownloading || !advert.can_submit}
            className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? "Downloading..." : "Download"}
          </Button>

          {advert.has_submitted ? (
            <Badge variant="secondary" className="px-4 py-2">
              Submitted
            </Badge>
          ) : advert.can_submit ? (
            <Button
              onClick={onSubmissionSuccess}
              variant="outline"
              className="bg-secondary/10 border-secondary text-secondary hover:bg-secondary hover:text-white transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              Submit Views
            </Button>
          ) : (
            <Badge variant="destructive" className="px-4 py-2">
              Package Required
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
