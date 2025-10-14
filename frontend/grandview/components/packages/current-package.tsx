"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Clock, CheckCircle, AlertTriangle, Loader2, Star, Check, X } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { ApiService } from "@/lib/api"
//import { cn } from "@/lib/utils"

interface CurrentPackageProps {
  package: {
    name: string
    rate_per_view: number
    expiry_date: string
    days_remaining: number
    bonus_amount?: string
    claim_cost?: string
    claimed?: boolean
  } | null
  onClaimSuccess?: () => void
}

export function CurrentPackage({ package: pkg, onClaimSuccess }: CurrentPackageProps) {
  const [isClaiming, setIsClaiming] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'loading' | 'success' | 'error' | null>(null)
  const [message, setMessage] = useState("")
  const [claimSuccessTriggered, setClaimSuccessTriggered] = useState(false)

  const handleClaim = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault() // Prevent default button behavior (e.g., form submission)
    event.stopPropagation() // Stop event bubbling to parent elements

    setIsClaiming(true)
    setModalType('loading')
    setShowModal(true)
    setMessage("Claiming your cashback bonus...")

    try {
      const response = await ApiService.claimCashback()
      setModalType('success')
      setMessage("Cashback bonus successfully withdrawn")
      setClaimSuccessTriggered(true) // Flag to trigger onClaimSuccess when modal closes
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to claim cashback"
      setModalType('error')
      setMessage(errorMessage)
    } finally {
      setIsClaiming(false)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setModalType(null)
    setMessage("")
    if (claimSuccessTriggered) {
      onClaimSuccess?.() // Trigger onClaimSuccess only when modal is closed
      setClaimSuccessTriggered(false) // Reset the flag
    }
  }

  if (!pkg) {
    return (
      <Card className="bg-orange-500 border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white font-extrabold text-xl sm:text-2xl">
            <AlertTriangle className="h-6 w-6" />
            No Active Package
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-white/90 text-base sm:text-lg">
            You dont have an active package. Purchase one below to start earning from premium advertisements.
          </p>
          <div className="bg-white/10 border border-white/20 rounded-lg p-4">
            <p className="text-sm text-white font-medium">
              💡 Choose a package to unlock earning opportunities and start viewing ads immediately.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isExpiringSoon = pkg.days_remaining <= 3
  const getRateTheme = (rate: number) => {
    switch (rate) {
      case 90:
        return { 
          color: "blue-500", 
          bg: "bg-blue-500", 
          text: "text-white", 
          badge: "bg-blue-500", 
          gradient: "from-blue-500 to-blue-600",
          card: "bg-blue-600",
          amount: "text-blue-200",
          button: "bg-blue-700 hover:bg-blue-800"
        }
      case 100:
        return { 
          color: "emerald-500", 
          bg: "bg-emerald-500", 
          text: "text-white", 
          badge: "bg-emerald-500", 
          gradient: "from-emerald-500 to-emerald-600",
          card: "bg-emerald-600",
          amount: "text-emerald-200",
          button: "bg-emerald-700 hover:bg-emerald-800"
        }
      case 120:
        return { 
          color: "pink-500", 
          bg: "bg-pink-500", 
          text: "text-white", 
          badge: "bg-pink-500", 
          gradient: "from-pink-500 to-pink-600",
          card: "bg-pink-600",
          amount: "text-pink-200",
          button: "bg-pink-700 hover:bg-pink-800"
        }
      default:
        return { 
          color: "gray-500", 
          bg: "bg-gray-500", 
          text: "text-white", 
          badge: "bg-gray-500", 
          gradient: "from-gray-500 to-gray-600",
          card: "bg-gray-600",
          amount: "text-gray-200",
          button: "bg-gray-700 hover:bg-gray-800"
        }
    }
  }

  const theme = getRateTheme(pkg.rate_per_view)

  return (
    <>
      <Card className={`${isExpiringSoon ? "bg-orange-500" : theme.bg} border-0`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-3 ${isExpiringSoon ? "text-white" : theme.text} font-extrabold text-xl sm:text-2xl`}>
            <CheckCircle className="h-6 w-6" />
            Active Package
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className={`text-xl sm:text-2xl font-extrabold ${isExpiringSoon ? "text-white" : theme.text}`}>{pkg.name}</h3>
              <p className="text-sm text-white/80 mt-1">Your current earning package</p>
            </div>
            <Badge className={`${theme.badge} text-white px-4 py-1.5 font-semibold text-sm`}>
              {formatCurrency(pkg.rate_per_view)}/view
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg bg-white/10 border border-white/20`}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className={`h-4 w-4 ${isExpiringSoon ? "text-white" : theme.text}`} />
                <span className="text-xs font-medium text-white/80 uppercase tracking-wide">Expires On</span>
              </div>
              <p className={`font-semibold ${isExpiringSoon ? "text-white" : theme.text} text-sm sm:text-base`}>
                {new Date(pkg.expiry_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className={`p-4 rounded-lg bg-white/10 border border-white/20`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className={`h-4 w-4 ${isExpiringSoon ? "text-white" : theme.text}`} />
                <span className="text-xs font-medium text-white/80 uppercase tracking-wide">Days Left</span>
              </div>
              <p className={`font-semibold ${isExpiringSoon ? "text-white" : theme.text} text-sm sm:text-base`}>
                {pkg.days_remaining} days
              </p>
            </div>
          </div>

          {isExpiringSoon && (
            <div className="bg-white/10 border border-white/20 rounded-xl p-4 animate-in zoom-in-75">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white text-base sm:text-lg mb-1">Package Expiring Soon!</h4>
                  <p className="text-sm text-white/80">
                    Your package expires in {pkg.days_remaining} day{pkg.days_remaining !== 1 ? "s" : ""}. Purchase a new
                    package to continue earning without interruption.
                  </p>
                </div>
              </div>
            </div>
          )}

          {pkg.bonus_amount && Number(pkg.bonus_amount) > 0 && !pkg.claimed && (
            <Card className={`${theme.card} border border-white/30 rounded-xl shadow-lg overflow-hidden animate-in zoom-in-75 max-w-full sm:max-w-md mx-auto`}>
              <CardHeader className="p-4 border-b border-white/20">
                <CardTitle className="flex items-center gap-2 text-white text-lg font-bold">
                  <Star className="h-5 w-5 text-yellow-400" />
                  Cashback Bonus
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="text-center">
                  <p className="text-xs text-white/70 uppercase tracking-wide">Bonus Amount</p>
                  <p className={`text-xl font-bold ${theme.amount}`}>{formatCurrency(pkg.bonus_amount)}</p>
                </div>
                <Button
                  type="button" // Explicitly set button type to prevent form submission
                  onClick={handleClaim}
                  disabled={isClaiming}
                  className={`w-full ${theme.button} text-white font-semibold transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg rounded-lg py-2 text-base`}
                >
                  {isClaiming ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    "Claim Bonus"
                  )}
                </Button>
                <p className="text-sm text-white/80 text-center font-medium">
                  To claim the bonus, you need {formatCurrency(pkg.claim_cost)}.
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md bg-gray-900 border border-white/20 rounded-xl shadow-2xl">
          <DialogHeader className="space-y-3">
            <div className="flex justify-center">
              {modalType === 'loading' && <Loader2 className="h-16 w-16 animate-spin text-blue-400" />}
              {modalType === 'success' && <Check className="h-16 w-16 text-emerald-400 animate-bounce [animation-duration:0.5s]" />}
              {modalType === 'error' && <X className="h-16 w-16 text-red-400 animate-shake [animation-duration:0.3s]" />}
            </div>
            <DialogTitle className="text-center text-white text-2xl font-bold">
              {modalType === 'loading' && 'Processing Your Claim'}
              {modalType === 'success' && 'Bonus Claimed!'}
              {modalType === 'error' && 'Claim Failed'}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-center text-white/90 text-base px-4">
            {message}
          </DialogDescription>
          {modalType !== 'loading' && (
            <DialogFooter className="pt-4">
              <Button 
                type="button" // Ensure OK button doesn't trigger form submission
                onClick={closeModal} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-300 hover:scale-105 rounded-lg py-2 text-base"
              >
                OK
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}