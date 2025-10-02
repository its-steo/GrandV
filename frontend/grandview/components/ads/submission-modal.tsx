"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Loader2, Camera, Sparkles, DollarSign } from "lucide-react"
import { ApiService } from "@/lib/api"
import { toast } from "sonner"
import { debounce } from "lodash"
import { motion } from "framer-motion"

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

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        if (!file.type.startsWith("image/")) {
          toast.error("Invalid File Type", {
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
    },
    [previewUrl],
  )

  const debouncedSetViewsCount = useCallback(
    debounce((value: number) => {
      setFormData((prev) => ({ ...prev, views_count: value }))
    }, 300),
    [],
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
          description: message.includes("email")
            ? "Submission saved, but email notification failed. Contact support."
            : message,
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [advertId, formData, ratePerView, onSuccess, onClose],
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <DialogContent
          className="bg-white/10 backdrop-blur-md max-w-md max-h-[85vh] overflow-y-auto border border-blue-400/30 shadow-lg"
          aria-label={`Submit views for ${advertTitle}`}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl flex items-center justify-center animate-pulse"
              >
                <Upload className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <span className="font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                  💸 Submit & Earn
                </span>
                <p className="text-sm text-gray-900 font-semibold mt-1 text-pretty">{advertTitle}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="space-y-3"
            >
              <Label htmlFor="views-count" className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                👁️ Number of Views
              </Label>
              <Input
                id="views-count"
                type="number"
                min="1"
                defaultValue={formData.views_count}
                onChange={handleViewsChange}
                className="bg-white/20 backdrop-blur-sm border border-blue-400/30 text-lg p-4 font-semibold text-gray-800"
                placeholder="How many times did you view the ad?"
                aria-describedby="views-earnings"
              />
              <div
                className="p-4 bg-gradient-to-r from-green-400/20 to-teal-400/20 rounded-xl border border-green-400/30 shadow-md"
                id="views-earnings"
              >
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  <span className="font-bold text-green-400">Your Earnings:</span>
                </div>
                <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-teal-600 bg-clip-text text-transparent">
                  KSH {(formData.views_count * ratePerView).toFixed(2)}
                  <span className="text-sm opacity-75 ml-2 font-normal text-gray-100">({ratePerView} per view)</span>
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="space-y-3"
            >
              <Label htmlFor="screenshot" className="text-lg font-semibold flex items-center gap-2 text-white-800">
                📸 Screenshot Proof
              </Label>
              <div className="border-2 border-dashed border-blue-400/40 rounded-xl p-6 text-center bg-gradient-to-br from-blue-400/10 to-indigo-400/10">
                {previewUrl ? (
                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="relative"
                    >
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="Screenshot preview"
                        className="max-h-48 mx-auto rounded-lg shadow-lg border border-green-400/30"
                        loading="lazy"
                      />
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-teal-400 rounded-full flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                    </motion.div>
                    <p className="text-sm text-green-400 font-semibold flex items-center justify-center gap-2">
                      ✅ Screenshot uploaded successfully!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center animate-pulse"
                    >
                      <Camera className="h-8 w-8 text-white" />
                    </motion.div>
                    <div>
                      <p className="text-white-600 font-semibold mb-2">📱 Upload your screenshot</p>
                      <p className="text-sm text-white-600">Show us the number of views you made!</p>
                    </div>
                  </div>
                )}
                <Input
                  id="screenshot"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-4 bg-white/20 backdrop-blur-sm border border-blue-400/30 text-gray-800"
                  required
                  aria-label="Upload screenshot proof"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="flex gap-3 pt-4"
            >
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-transparent border-2 border-red-400/30 hover:bg-red-200/20 text-white-800"
                disabled={isSubmitting}
                aria-label="Cancel submission"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-400 to-indigo-400 text-white font-semibold hover:scale-105 transition-transform duration-200"
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
                    <Upload className="h-4 w-4 mr-2" />💰 Submit & Earn
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </DialogContent>
      </motion.div>
    </Dialog>
  )
}