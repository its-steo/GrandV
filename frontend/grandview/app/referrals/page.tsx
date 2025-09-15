"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { ReferralDashboard } from "@/components/referrals/referrals-dashboard"

export default function ReferralsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <Sidebar />
      <div className="ml-0 lg:ml-64 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Referral Program
            </h1>
            <p className="text-muted-foreground mt-2">Earn commissions by referring new users to our platform</p>
          </div>

          <ReferralDashboard />
        </div>
      </div>
    </div>
  )
}
