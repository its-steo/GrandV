"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, Filter, Loader2, UserCheck, UserX, User } from "lucide-react"
import { ApiService, type Referral } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

export function ReferralsList() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  })
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  })

  useEffect(() => {
    fetchReferrals()
  }, [filters, pagination.page])

  const fetchReferrals = async () => {
    try {
      setLoading(true)
      const response = await ApiService.getReferrals({
        page: pagination.page,
        limit: 10,
        ...filters,
      })

      setReferrals(response.referrals)
      setPagination({
        page: response.page,
        pages: response.pages,
        total: response.total,
      })
    } catch (error) {
      toast.error("Failed to load referrals")
      console.error("Error fetching referrals:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <UserCheck className="h-4 w-4 text-green-500" />
      case "inactive":
        return <UserX className="h-4 w-4 text-red-500" />
      default:
        return <User className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "inactive":
        return "bg-red-500"
      default:
        return "bg-yellow-500"
    }
  }

  return (
    <Card className="glass-card border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          My Referrals ({pagination.total})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search referrals..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10 glass border-white/20"
            />
          </div>

          <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
            <SelectTrigger className="w-40 glass border-white/20">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Referrals List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : referrals.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Referrals Found</h3>
            <p className="text-muted-foreground">
              {filters.search || filters.status !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Start sharing your referral link to earn commissions"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center justify-between p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(referral.status)}
                  <div>
                    <h4 className="font-medium">{referral.referred_user.username}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{referral.referred_user.email}</span>
                      <span>•</span>
                      <span>Joined {new Date(referral.referred_user.date_joined).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-green-600 mb-1">{formatCurrency(referral.commission_earned)}</div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusColor(referral.status)} text-white text-xs`}>{referral.status}</Badge>
                    <span className="text-xs text-muted-foreground">
                      Last active: {new Date(referral.last_activity).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <p className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * 10 + 1} to {Math.min(pagination.page * 10, pagination.total)} of{" "}
              {pagination.total} referrals
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="glass"
              >
                Previous
              </Button>

              <span className="text-sm">
                Page {pagination.page} of {pagination.pages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="glass"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
