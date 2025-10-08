
"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Send, X, AlertCircle, MessageCircle } from "lucide-react"
import { ApiService } from "@/lib/api"
import { toast } from "sonner"

// Glassmorphism styles
const glassmorphismStyles = `
  .glass-dialog {
    background: rgba(255, 255, 255, 0.2); /* More opaque for better readability */
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 16px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
  }
  .glass-input {
    background: rgba(255, 255, 255, 0.3); /* Slightly more opaque for text clarity */
    border: 1px solid rgba(255, 255, 255, 0.4);
    color: #FFFFFF;
    transition: all 0.3s ease;
  }
  .glass-input:focus {
    background: rgba(255, 255, 255, 0.35);
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
  }
  .dark .glass-dialog {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  .dark .glass-input {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
`

interface CreateSupportMessageProps {
  onSubmit: (data: {
    content: string
    image?: string
  }) => Promise<void>
  onClose: () => void
}

export function CreateSupportMessage({ onSubmit, onClose }: CreateSupportMessageProps) {
  const [formData, setFormData] = useState({
    content: "",
    image: null as File | null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.content.trim()) {
      toast.error("Message content is required")
      return
    }

    try {
      setIsSubmitting(true)
      let imagePath: string | undefined

      if (formData.image) {
        const extension = formData.image.name.split(".").pop()?.toLowerCase() || "jpg"
        const contentType = formData.image.type || "image/jpeg"
        const presignedData = await ApiService.getPresignedUrl({
          doc_type: "support_image",
          extension,
          content_type: contentType,
        })

        // Upload to S3
        const formDataUpload = new FormData()
        Object.entries(presignedData.fields).forEach(([key, value]) => {
          formDataUpload.append(key, value as string)
        })
        formDataUpload.append("file", formData.image)

        await fetch(presignedData.upload_url, {
          method: "POST",
          body: formDataUpload,
        })

        imagePath = presignedData.key
      }

      await onSubmit({
        content: formData.content,
        image: imagePath,
      })
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to create message")
      console.error("Failed to create message:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <>
      <style>{glassmorphismStyles}</style>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="glass-dialog max-w-[95vw] sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white text-lg sm:text-xl md:text-2xl">
              <MessageCircle className="h-5 w-5 text-white" />
              Create Support Message
            </DialogTitle>
            <DialogDescription className="text-gray-300 text-sm sm:text-base">
              Describe your issue or question in detail. Our community and support team will help you out.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content" className="text-white text-sm sm:text-base">Message *</Label>
                <Textarea
                  id="content"
                  placeholder="Provide detailed information about your issue or question..."
                  value={formData.content}
                  onChange={(e) => handleChange("content", e.target.value)}
                  className="glass-input min-h-[100px] sm:min-h-[120px] resize-none"
                  required
                  maxLength={1000}
                />
                <p className="text-xs text-gray-300">{formData.content.length}/1000 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image" className="text-white text-sm sm:text-base">Image (Optional)</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleChange("image", e.target.files?.[0] || null)}
                  className="glass-input"
                />
                <p className="text-xs text-gray-300">Max file size: 5MB</p>
              </div>
            </div>

            <Card className="glass-dialog border-white/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <h4 className="font-medium text-white text-sm sm:text-base">Tips for better support</h4>
                    <ul className="text-xs sm:text-sm text-gray-300 space-y-1">
                      <li>• Be specific about the issue you are experiencing</li>
                      <li>• Include steps to reproduce the problem if applicable</li>
                      <li>• Mention your browser/device if it is a technical issue</li>
                      <li>• Check existing messages to avoid duplicates</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/20">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.content.trim()}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Create Message
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
