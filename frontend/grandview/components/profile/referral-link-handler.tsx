"use client"

import { useEffect } from "react"
import { getReferralCodeFromUrl } from "@/lib/auth"
import { toast } from "sonner"

export function ReferralLinkHandler() {
  useEffect(() => {
    const referralCode = getReferralCodeFromUrl()
    if (referralCode) {
      toast.success(`Referral code ${referralCode} has been applied! Complete registration to get started.`)
    }
  }, [])

  return null
}
