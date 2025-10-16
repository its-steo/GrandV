"use client"

import { useState } from "react"
import { Gift, X, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ApiService, type CashbackBonus, type WeeklyBonus } from "@/lib/api"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

interface BonusClaimModalProps {
  bonus: CashbackBonus | WeeklyBonus
  type: "cashback" | "weekly"
  isOpen: boolean
  onClose: () => void
  onClaimSuccess: () => void
}

export function BonusClaimModal({ bonus, type, isOpen, onClose, onClaimSuccess }: BonusClaimModalProps) {
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimSuccess, setClaimSuccess] = useState(false)

  const handleClaim = async () => {
    try {
      setIsClaiming(true)
      if (type === "cashback") {
        await ApiService.claimCashbackBonus(bonus.id)
      } else {
        await ApiService.claimWeeklyBonus(bonus.id)
      }
      setClaimSuccess(true)
      setTimeout(() => {
        toast.success("Bonus claimed successfully!")
        onClaimSuccess()
        handleClose()
      }, 1500)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to claim bonus")
      setIsClaiming(false)
    }
  }

  const handleClose = () => {
    setClaimSuccess(false)
    setIsClaiming(false)
    onClose()
  }

  if (!isOpen) return null

  const bonusTitle = type === "cashback" ? "Cashback Bonus" : "Weekly Bonus"
  const isClaimed = bonus.claimed

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-96">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors z-10"
          >
            <X className="h-5 w-5 text-white/60 hover:text-white" />
          </button>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full">
                  <Gift className="h-6 w-6 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white">{bonusTitle}</h2>
              <p className="text-white/60 text-sm">
                {type === "cashback"
                  ? "One-time bonus for purchasing agent package"
                  : "Recurring weekly bonus for verified agents"}
              </p>
            </div>

            {/* Amount Display */}
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6 text-center space-y-2">
              <p className="text-purple-200 text-sm font-medium">Bonus Amount</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                {formatCurrency(bonus.amount)}
              </p>
              <p className="text-purple-300 text-xs">Claim cost: {formatCurrency(bonus.claim_cost)}</p>
            </div>

            {/* Loading/Success State */}
            {isClaiming && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                  <span className="text-blue-200 font-medium">Processing your claim...</span>
                </div>
                <div className="w-full bg-blue-500/20 rounded-full h-1 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-full animate-pulse" />
                </div>
              </div>
            )}

            {claimSuccess && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-400 animate-bounce" />
                  <span className="text-green-200 font-medium">Bonus claimed successfully!</span>
                </div>
                <p className="text-green-300/80 text-sm text-center">
                  {formatCurrency(bonus.amount)} has been added to your wallet.
                </p>
              </div>
            )}

            {/* Claimed Info */}
            {isClaimed && !isClaiming && !claimSuccess && bonus.claimed_at && (
              <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-300 font-medium">Already Claimed</span>
                </div>
                <p className="text-gray-400 text-sm">Claimed on {new Date(bonus.claimed_at).toLocaleDateString()}</p>
              </div>
            )}

            {/* Claim Button */}
            {!isClaimed && !claimSuccess && (
              <Button
                onClick={handleClaim}
                disabled={isClaiming}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClaiming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <Gift className="h-4 w-4 mr-2" />
                    Claim Bonus
                  </>
                )}
              </Button>
            )}

            {/* Close Button for Success State */}
            {claimSuccess && (
              <Button
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold"
              >
                Done
              </Button>
            )}

            {/* Close Button for Claimed State */}
            {isClaimed && !claimSuccess && (
              <Button
                onClick={handleClose}
                variant="outline"
                className="w-full border-purple-500/30 hover:bg-white/5 bg-transparent"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
