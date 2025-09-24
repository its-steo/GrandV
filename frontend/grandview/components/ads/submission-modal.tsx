"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Loader2, Camera } from "lucide-react"
import { ApiService } from "@/lib/api"
import { toast } from "sonner"
import { debounce } from "lodash"

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

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid File", {
          description: "Please select an image file (JPG, PNG, etc.)",
        })
        return
      }
      if (file.size > 5 * 1024 * 1024) {
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
  }, [previewUrl])

  const debouncedSetViewsCount = useCallback(
    debounce((value: number) => {
      setFormData((prev) => ({ ...prev, views_count: value }))
    }, 300),
    []
  )

  const handleViewsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value) || 1
    debouncedSetViewsCount(value)
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
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
        toast.success("🎉 Submission Successful!", {
          description: `You've earned KSH ${(formData.views_count * ratePerView).toFixed(2)} for ${
            formData.views_count
          } view(s)! Check your email for confirmation.`,
        })
        onSuccess()
        onClose()
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Please try again."
        toast.error("Submission Failed", {
          description: message.includes("email") ? "Submission saved, but email notification failed. Contact support." : message,
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [advertId, formData, ratePerView, onSuccess, onClose]
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="glass-bright max-w-md max-h-[80vh] overflow-y-auto border-primary/20 shadow-2xl"
        aria-label={`Submit views for ${advertTitle}`}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Submit Views for `{advertTitle}`
            </span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="views-count" className="text-lg font-semibold">
              Number of Views
            </Label>
            <Input
              id="views-count"
              type="number"
              min="1"
              defaultValue={formData.views_count}
              onChange={handleViewsChange}
              className="glass border-primary/20 text-lg p-3"
              placeholder="How many times did you view the ad?"
              aria-describedby="views-earnings"
            />
            <div
              className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg"
              id="views-earnings"
            >
              <p className="text-lg font-bold text-green-700 dark:text-green-300">
                Earnings: KSH {(formData.views_count * ratePerView).toFixed(2)}
                <span className="text-sm opacity-75 ml-2">({ratePerView}/view)</span>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="screenshot" className="text-lg font-semibold">
              Screenshot Proof
            </Label>
            <div className="border-2 border-dashed border-primary/30 rounded-xl p-6 text-center bg-gradient-to-br from-primary/5 to-secondary/5">
              {previewUrl ? (
                <div className="space-y-3">
                  <img
                    src={previewUrl}
                    alt="Screenshot preview"
                    className="max-h-40 mx-auto rounded-lg shadow-lg"
                    loading="lazy"
                  />
                  <p className="text-sm text-green-600 dark:text-green-400 font-semibold">✓ Screenshot uploaded</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto">
                    <Camera className="h-12 w-12 text-primary" />
                  </div>
                  <p className="text-muted-foreground">Upload a screenshot showing you viewed the ad</p>
                </div>
              )}
              <Input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-4"
                required
                aria-label="Upload screenshot proof"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent border-muted-foreground/30"
              disabled={isSubmitting}
              aria-label="Cancel submission"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 neon-button-primary text-white font-semibold"
              disabled={isSubmitting}
              aria-label="Submit views"
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