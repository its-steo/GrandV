"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import { LipaRegistrationForm } from "@/components/lipa/lipa-registration-form"
import { ApiService, type LipaRegistration } from "@/lib/api"
import { toast } from "sonner"

export default function LipaRegisterPage() {
  const router = useRouter()
  const [registration, setRegistration] = useState<LipaRegistration | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [hasExistingRegistration, setHasExistingRegistration] = useState(false)

  useEffect(() => {
    fetchRegistration()
  }, [])

  const fetchRegistration = async () => {
    try {
      const regData = await ApiService.getLipaRegistration()
      if (regData && regData.full_name && regData.status) {
        setRegistration(regData)
        setHasExistingRegistration(true)
      } else {
        setRegistration(null)
        setHasExistingRegistration(false)
      }
    } catch (error) {
      console.error("Failed to fetch registration:", error)
      setRegistration(null)
      setHasExistingRegistration(false)
    } finally {
      setLoading(false)
    }
  }

  const handleRegistrationUpdate = (newRegistration: LipaRegistration) => {
    setRegistration(newRegistration)
    setShowSuccess(true)

    // Show success message and redirect after 3 seconds
    toast.success("Registration submitted successfully!")
    setTimeout(() => {
      router.push("/lipa")
    }, 3000)
  }

  const handleBackToLipa = () => {
    router.push("/lipa")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center p-4">
        <Card className="glass-card border-white/20 max-w-md w-full">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Registration Submitted!</h2>
            <p className="text-muted-foreground mb-4">
              Your Lipa Mdogo Mdogo registration has been submitted successfully. You will be redirected to check your
              status.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleBackToLipa}
                className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                Check Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (hasExistingRegistration && registration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center p-4">
        <Card className="glass-card border-white/20 max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Already Registered</h2>
            <p className="text-muted-foreground mb-4">
              You have already submitted a Lipa Mdogo Mdogo registration. Your current status is{" "}
              <span className="font-semibold capitalize">{registration.status?.toLowerCase()}</span>.
            </p>
            <Button
              onClick={handleBackToLipa}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              View Registration Status
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleBackToLipa} className="mb-4 hover:bg-white/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lipa Mdogo Mdogo
          </Button>

          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              Lipa Mdogo Mdogo Registration
            </h1>
            <p className="text-muted-foreground">Complete your registration to access flexible installment payments</p>
          </div>
        </div>

        <LipaRegistrationForm registration={null} onRegistrationUpdate={handleRegistrationUpdate} />
      </div>
    </div>
  )
}
