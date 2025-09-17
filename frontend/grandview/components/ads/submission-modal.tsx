"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Loader2, Camera } from "lucide-react"
import { ApiService } from "@/lib/api"
import { toast } from "sonner"

interface SubmissionModalProps {
  isOpen: boolean
  onClose: () => void
  advertId: number
  advertTitle: string
  ratePerView: number
  onSuccess: () => void
}

export function SubmissionModal({
  isOpen,
  onClose,
  advertId,
  advertTitle,
  ratePerView,
  onSuccess,
}: SubmissionModalProps) {
  const [formData, setFormData] = useState({
    views_count: 1,
    screenshot: null as File | null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Added: Basic validation for file type and size (e.g., <5MB)
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid File", {
          description: "Please select an image file (JPG, PNG, etc.)",
        })
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("File Too Large", {
          description: "Screenshot must be under 5MB",
        })
        return
      }
      setFormData((prev) => ({ ...prev, screenshot: file }))
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.screenshot) {
      toast.error("Screenshot Required", {
        description: "Please upload a screenshot as proof of viewing",
      })
      return
    }

    if (formData.views_count < 1) {
      toast.error("Invalid Views", {
        description: "Number of views must be at least 1",
      })
      return
    }

    try {
      setIsSubmitting(true)
      await ApiService.submitAdvert(advertId, formData.views_count, formData.screenshot)
      toast.success("Submission Successful!", {
        description: `Earned KSH ${(formData.views_count * ratePerView).toFixed(2)} for ${formData.views_count} view(s)`,
      })
      onSuccess()
      onClose() // Added: Close modal after success
    } catch (error: unknown) {
      toast.error("Submission Failed", {
        description: (error as Error).message || "Please try again",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Submit Views for `{advertTitle}`
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="views-count">Number of Views</Label>
            <Input
              id="views-count"
              type="number"
              min="1"
              value={formData.views_count}
              onChange={(e) => setFormData((prev) => ({ ...prev, views_count: Number.parseInt(e.target.value) || 1 }))}
              className="glass border-white/20"
              placeholder="How many times did you view the ad?"
            />
            <p className="text-sm text-muted-foreground">
              Earnings: KSH {(formData.views_count * ratePerView).toFixed(2)} ({ratePerView}/view)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="screenshot">Screenshot Proof</Label>
            <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center">
              {previewUrl ? (
                <div className="space-y-2">
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Screenshot preview"
                    className="max-h-32 mx-auto rounded-lg"
                  />
                  <p className="text-sm text-muted-foreground">Screenshot uploaded</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Camera className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Upload a screenshot showing you viewed the ad</p>
                </div>
              )}
              <Input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-2"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Views
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
