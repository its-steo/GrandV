"use client"

import { useState } from "react"
import { Gift, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import type { CashbackBonus } from "@/lib/api"

interface CashbackBonusAlertProps {
  bonus: CashbackBonus
  onClose: () => void
  onClaimClick: () => void
}

export function CashbackBonusAlert({ bonus, onClose, onClaimClick }: CashbackBonusAlertProps) {
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(onClose, 300)
  }

  const handleClaim = () => {
    setIsClosing(true)
    setTimeout(onClaimClick, 300)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      {/* Alert Popup */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 transition-all duration-300 ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <div className="relative w-96 bg-gradient-to-br from-purple-900/95 to-pink-900/95 rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden">
          {/* Animated background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 animate-pulse" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors z-10"
          >
            <X className="h-5 w-5 text-white/60 hover:text-white" />
          </button>

          {/* Content */}
          <div className="relative p-8 space-y-6">
            {/* Icon with animation */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full">
                  <Gift className="h-8 w-8 text-white animate-bounce" style={{ animationDelay: "0s" }} />
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Congratulations!</h2>
              <p className="text-purple-200 text-sm">You have received a cashback bonus</p>
            </div>

            {/* Amount Display */}
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6 text-center space-y-2">
              <p className="text-purple-200 text-sm font-medium">Bonus Amount</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                {formatCurrency(bonus.amount)}
              </p>
              <p className="text-purple-300 text-xs">Claim cost: {formatCurrency(bonus.claim_cost)}</p>
            </div>

            {/* Description */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-white/80 text-sm text-center">
                This bonus has been automatically created. Click the button below to claim it and add it to your wallet.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1 border-purple-500/30 hover:bg-white/5 bg-transparent"
              >
                Later
              </Button>
              <Button
                onClick={handleClaim}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold group"
              >
                Claim Now
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
