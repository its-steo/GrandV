"use client"

import { useAuth } from "@/hooks/use-auth"
import { UserInfoCard } from "@/components/profile/user-info-card"
import { ReferralCard } from "@/components/profile/referral-card"
import { SecuritySettings } from "@/components/profile/security-settings"
import { Sidebar } from "@/components/layout/sidebar"

export default function ProfilePage() {
  const { user } = useAuth()

  // If you want to show a loading state, you need to implement a loading state in your useAuth hook and context.
  // For now, this block is removed because 'loading' does not exist.

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Sidebar />
        <div className="md:ml-64 p-4 md:p-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground">Please log in to view your profile.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Sidebar />
      <div className="md:ml-64 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              Profile & Settings
            </h1>
            <p className="text-muted-foreground">Manage your account information, referrals, and security settings</p>
          </div>

          {/* Profile Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Info */}
            <div className="lg:col-span-2">
              <UserInfoCard />
            </div>

            {/* Referral Card */}
            <ReferralCard />

            {/* Security Settings */}
            <SecuritySettings />
          </div>
        </div>
      </div>
    </div>
  )
}
