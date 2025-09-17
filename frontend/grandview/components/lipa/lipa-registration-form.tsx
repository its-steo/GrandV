"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Upload, CheckCircle, Clock, XCircle, Loader2, Calendar, MapPin } from "lucide-react"
import { ApiService, type LipaRegistration } from "@/lib/api"
import { toast } from "sonner"

interface LipaRegistrationFormProps {
  registration: LipaRegistration | null
  onRegistrationUpdate: (registration: LipaRegistration) => void
}

export function LipaRegistrationForm({ registration, onRegistrationUpdate }: LipaRegistrationFormProps) {
  const [formData, setFormData] = useState({
    full_name: "",
    date_of_birth: "",
    address: "",
  })
  const [idFront, setIdFront] = useState<File | null>(null)
  const [idBack, setIdBack] = useState<File | null>(null)
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleFileChange = (file: File | null, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a valid file (JPEG, PNG, or PDF)")
        return
      }
      if (file.size > maxSize) {
        toast.error("File size must be less than 5MB")
        return
      }
      setter(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (registration) {
      toast.error(`You are already registered for Lipa Mdogo Mdogo. Your status is ${getNormalizedStatus(registration.status)}.`)
      return
    }

    if (!idFront || !idBack || !passportPhoto) {
      toast.error("Please upload all required documents: ID front, ID back, and passport photo")
      return
    }
    if (!formData.date_of_birth) {
      toast.error("Please enter your date of birth")
      return
    }
    try {
      setIsSubmitting(true)
      console.log("Submitting form data:", { ...formData, idFront, idBack, passportPhoto }) // Log form data
      const newRegistration = await ApiService.registerForLipa({
        ...formData,
        id_front: idFront,
        id_back: idBack,
        passport_photo: passportPhoto,
      })
      toast.success("Lipa Mdogo Mdogo registration submitted successfully!")
      onRegistrationUpdate(newRegistration)
      setFormData({ full_name: "", date_of_birth: "", address: "" })
      setIdFront(null)
      setIdBack(null)
      setPassportPhoto(null)
    } catch (error) {
      console.error("Registration error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to submit registration"
      try {
        const parsedError = JSON.parse(errorMessage)
        toast.error(JSON.stringify(parsedError, null, 2))
      } catch {
        toast.error(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const getNormalizedStatus = (status?: string) => (status || "").toLowerCase()

  const getStatusIcon = (status?: string) => {
    const norm = getNormalizedStatus(status)
    switch (norm) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status?: string) => {
    const norm = getNormalizedStatus(status)
    switch (norm) {
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      case "pending":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const capitalizeStatus = (status?: string) => {
    const norm = getNormalizedStatus(status)
    return norm.charAt(0).toUpperCase() + norm.slice(1)
  }

  if (registration) {
    return (
      <Card className="glass-card border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(registration.status)}
            Lipa Mdogo Mdogo Registration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge className={`${getStatusColor(registration.status)} text-white`}>
              {capitalizeStatus(registration.status)}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Full Name:</span>
              <p className="font-medium">{registration.full_name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Date of Birth:</span>
              <p className="font-medium">{new Date(registration.date_of_birth).toLocaleDateString()}</p>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Address:</span>
              <p className="font-medium">{registration.address}</p>
            </div>
            <div>
              <span className="text-muted-foreground">ID Front:</span>
              <a
                href={registration.id_front}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View File
              </a>
            </div>
            <div>
              <span className="text-muted-foreground">ID Back:</span>
              <a
                href={registration.id_back}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View File
              </a>
            </div>
            <div>
              <span className="text-muted-foreground">Passport Photo:</span>
              <a
                href={registration.passport_photo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View File
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card border-white/20">
      <CardHeader>
        <CardTitle>Lipa Mdogo Mdogo Registration</CardTitle>
        <p className="text-sm text-muted-foreground">
          Register to enjoy flexible installment payments with just 40% deposit required upfront.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
              className="glass border-white/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">
              <Calendar className="h-4 w-4 inline mr-1" />
              Date of Birth
            </Label>
            <Input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={handleInputChange}
              required
              className="glass border-white/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">
              <MapPin className="h-4 w-4 inline mr-1" />
              Address
            </Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your full address"
              required
              rows={3}
              className="glass border-white/20"
            />
          </div>
          <div className="space-y-4">
            <Label className="text-sm font-medium">Required Documents</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id_front">ID Front</Label>
                <Input
                  id="id_front"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null, setIdFront)}
                  className="glass border-white/20"
                />
                {idFront && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    {idFront.name}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="id_back">ID Back</Label>
                <Input
                  id="id_back"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null, setIdBack)}
                  className="glass border-white/20"
                />
                {idBack && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    {idBack.name}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="passport_photo">Passport Photo</Label>
                <Input
                  id="passport_photo"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null, setPassportPhoto)}
                  className="glass border-white/20"
                />
                {passportPhoto && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    {passportPhoto.name}
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Upload clear scans/photos (JPEG, PNG, or PDF, max 5MB each)</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">How Lipa Mdogo Mdogo Works:</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Pay only 40% deposit when purchasing</li>
              <li>• Remaining 60% split into monthly installments</li>
              <li>• No interest charges on approved accounts</li>
              <li>• Instant approval for qualified applicants</li>
            </ul>
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting Registration...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Submit Registration
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}