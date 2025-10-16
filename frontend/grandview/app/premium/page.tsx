"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { AgentPackageCard } from "@/components/premium/agent-package-card"
import { AgentPurchaseCard } from "@/components/premium/agent-purchase-card"
import { BonusClaimCard } from "@/components/premium/bonus-claim-card"
import { CashbackBonusAlert } from "@/components/premium/cashback-bonus-alert"
import { BonusClaimModal } from "@/components/premium/bonus-claim-modal"
import { Card, CardContent } from "@/components/ui/card"
import {
  ApiService,
  type AgentVerificationPackage,
  type AgentPurchase,
  type CashbackBonus,
  type WeeklyBonus,
} from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { Loader2, Crown, Shield, Info, Gift, Wallet } from "lucide-react"

export default function PremiumPage() {
  const { user } = useAuth()
  const [packages, setPackages] = useState<AgentVerificationPackage[]>([])
  const [purchases, setPurchases] = useState<AgentPurchase[]>([])
  const [cashbackBonuses, setCashbackBonuses] = useState<CashbackBonus[]>([])
  const [weeklyBonuses, setWeeklyBonuses] = useState<WeeklyBonus[]>([])
  const [loading, setLoading] = useState(true)
  const [showCashbackAlert, setShowCashbackAlert] = useState(false)
  const [pendingCashbackBonus, setPendingCashbackBonus] = useState<CashbackBonus | null>(null)
  const [showBonusClaimModal, setShowBonusClaimModal] = useState(false)
  const [selectedBonusForClaim, setSelectedBonusForClaim] = useState<CashbackBonus | WeeklyBonus | null>(null)
  const [selectedBonusType, setSelectedBonusType] = useState<"cashback" | "weekly">("cashback")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      console.log("[v0] Fetching premium data...")
      const [packagesData, purchasesData, cashbackData, weeklyData] = await Promise.all([
        ApiService.getAgentPackages(),
        ApiService.getUserAgentPurchases(),
        ApiService.getUserCashbackBonuses(),
        ApiService.getUserWeeklyBonuses(),
      ])
      console.log("[v0] Cashback bonuses:", cashbackData)
      console.log("[v0] Weekly bonuses:", weeklyData)
      setPackages(packagesData)
      setPurchases(purchasesData)
      setCashbackBonuses(cashbackData)
      setWeeklyBonuses(weeklyData)
    } catch (error) {
      console.error("[v0] Failed to fetch premium data:", error)
      toast.error("Failed to load premium data")
    } finally {
      setLoading(false)
    }
  }

  const handlePurchaseSuccess = async () => {
    console.log("[v0] Purchase successful, fetching updated data...")
    await fetchData()

    try {
      const cashbackData = await ApiService.getUserCashbackBonuses()
      console.log("[v0] Fetched cashback after purchase:", cashbackData)
      if (cashbackData.length > 0) {
        const unclaimedBonus = cashbackData.find((b) => !b.claimed)
        if (unclaimedBonus) {
          setPendingCashbackBonus(unclaimedBonus)
          setShowCashbackAlert(true)
        }
      }
    } catch (error) {
      console.error("[v0] Failed to fetch cashback bonus:", error)
      toast.success("Package purchased successfully!")
    }
  }

  const handleClaimFromAlert = () => {
    if (pendingCashbackBonus) {
      setSelectedBonusForClaim(pendingCashbackBonus)
      setSelectedBonusType("cashback")
      setShowCashbackAlert(false)
      setShowBonusClaimModal(true)
    }
  }

  const handleClaimFromCard = (bonus: CashbackBonus | WeeklyBonus, type: "cashback" | "weekly") => {
    setSelectedBonusForClaim(bonus)
    setSelectedBonusType(type)
    setShowBonusClaimModal(true)
  }

  const handleBonusClaimSuccess = () => {
    setShowCashbackAlert(false)
    setPendingCashbackBonus(null)
    setShowBonusClaimModal(false)
    setSelectedBonusForClaim(null)
    fetchData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Sidebar />
        <div className="md:ml-64 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
            <p className="text-white/80">Loading premium packages...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Sidebar />
        <div className="md:ml-64 p-4 md:p-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground">Please log in to view premium packages.</p>
          </div>
        </div>
      </div>
    )
  }

  const activePurchase = purchases.find((p) => p.status === "ACTIVE")
  const totalBonusBalance =
    cashbackBonuses.reduce((sum, b) => sum + (b.claimed ? 0 : Number.parseFloat(b.amount)), 0) +
    weeklyBonuses.reduce((sum, b) => sum + (b.claimed ? 0 : Number.parseFloat(b.amount)), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Sidebar />
      <div className="md:ml-64 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="h-8 w-8 text-yellow-500" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                Agent Verification Premium
              </h1>
            </div>
            <p className="text-white/80">Become a verified agent and unlock exclusive bonuses and benefits</p>
          </div>

          {(cashbackBonuses.length > 0 || weeklyBonuses.length > 0) && (
            <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/40">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full">
                      <Wallet className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Available Bonus Balance</h3>
                      <p className="text-sm text-white/60">
                        {cashbackBonuses.filter((b) => !b.claimed).length} cashback +{" "}
                        {weeklyBonuses.filter((b) => !b.claimed).length} weekly bonuses
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                      KSh {totalBonusBalance.toLocaleString()}
                    </p>
                    <p className="text-sm text-white/60">Total unclaimed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Info className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">How It Works</h3>
                  <ul className="text-sm text-white/80 space-y-1">
                    <li>• Purchase an agent verification package to become a verified agent</li>
                    <li>• Receive a KSh 21,000 cashback bonus (costs KSh 5,000 to claim)</li>
                    <li>• Get KSh 10,000 weekly bonuses (costs KSh 2,000 to claim)</li>
                    <li>• Display verified agent badge on your profile</li>
                    <li>
                      •{" "}
                      {user.is_marketer
                        ? "Marketers can use views earnings + deposit balance"
                        : "Use deposit balance for purchase"}
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Gift className="h-6 w-6 text-purple-500" />
              <h2 className="text-2xl font-bold text-white">Your Bonuses</h2>
            </div>

            {cashbackBonuses.length === 0 && weeklyBonuses.length === 0 ? (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-8 text-center">
                  <Gift className="h-12 w-12 text-white/40 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Bonuses Yet</h3>
                  <p className="text-white/60 text-sm">
                    Purchase an agent verification package to receive cashback and weekly bonuses
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cashbackBonuses.map((bonus) => (
                  <BonusClaimCard
                    key={bonus.id}
                    bonus={bonus}
                    type="cashback"
                    onClaimClick={() => handleClaimFromCard(bonus, "cashback")}
                  />
                ))}
                {weeklyBonuses.map((bonus) => (
                  <BonusClaimCard
                    key={bonus.id}
                    bonus={bonus}
                    type="weekly"
                    onClaimClick={() => handleClaimFromCard(bonus, "weekly")}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Active Purchase */}
          {activePurchase && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-green-500" />
                <h2 className="text-2xl font-bold text-white">Your Active Package</h2>
              </div>
              <AgentPurchaseCard purchase={activePurchase} />
            </div>
          )}

          {/* Available Packages */}
          {!activePurchase && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-yellow-500" />
                <h2 className="text-2xl font-bold text-white">Available Packages</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <AgentPackageCard key={pkg.id} package={pkg} onPurchaseSuccess={handlePurchaseSuccess} />
                ))}
              </div>
            </div>
          )}

          {/* Purchase History */}
          {purchases.length > 0 && !activePurchase && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Purchase History</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {purchases.map((purchase) => (
                  <AgentPurchaseCard key={purchase.id} purchase={purchase} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showCashbackAlert && pendingCashbackBonus && (
        <CashbackBonusAlert
          bonus={pendingCashbackBonus}
          onClose={() => setShowCashbackAlert(false)}
          onClaimClick={handleClaimFromAlert}
        />
      )}

      {selectedBonusForClaim && (
        <BonusClaimModal
          bonus={selectedBonusForClaim}
          type={selectedBonusType}
          isOpen={showBonusClaimModal}
          onClose={() => {
            setShowBonusClaimModal(false)
            setSelectedBonusForClaim(null)
          }}
          onClaimSuccess={handleBonusClaimSuccess}
        />
      )}
    </div>
  )
}
