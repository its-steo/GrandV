"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, Filter, Award, UserPlus, ShoppingCart, Activity, Loader2 } from "lucide-react"
import { ApiService, type CommissionTransaction } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

export function CommissionHistory() {
  const [commissions, setCommissions] = useState<CommissionTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    transaction_type: "all",
    status: "all",
    date_from: "",
    date_to: "",
  })
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  })

  useEffect(() => {
    fetchCommissions()
  }, [filters, pagination.page])

  const fetchCommissions = async () => {
    try {
      setLoading(true)
      const response = await ApiService.getCommissionHistory({
        page: pagination.page,
        limit: 10,
        ...filters,
      })

      setCommissions(response.commissions)
      setPagination({
        page: response.page,
        pages: response.pages,
        total: response.total,
      })
    } catch (error) {
      toast.error("Failed to load commission history")
      console.error("Error fetching commissions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      transaction_type: "all",
      status: "all",
      date_from: "",
      date_to: "",
    })
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "signup_bonus":
        return <UserPlus className="h-4 w-4 text-blue-500" />
      case "purchase_commission":
        return <ShoppingCart className="h-4 w-4 text-green-500" />
      case "activity_bonus":
        return <Activity className="h-4 w-4 text-purple-500" />
      default:
        return <Award className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500"
      case "approved":
        return "bg-blue-500"
      case "pending":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="glass-card border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Commission History ({pagination.total})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Select
            value={filters.transaction_type}
            onValueChange={(value) => handleFilterChange("transaction_type", value)}
          >
            <SelectTrigger className="glass border-white/20">
              <SelectValue placeholder="Transaction Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="signup_bonus">Signup Bonus</SelectItem>
              <SelectItem value="purchase_commission">Purchase Commission</SelectItem>
              <SelectItem value="activity_bonus">Activity Bonus</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
            <SelectTrigger className="glass border-white/20">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={filters.date_from}
            onChange={(e) => handleFilterChange("date_from", e.target.value)}
            className="glass border-white/20"
          />

          <Input
            type="date"
            value={filters.date_to}
            onChange={(e) => handleFilterChange("date_to", e.target.value)}
            className="glass border-white/20"
          />

          <Button variant="outline" onClick={clearFilters} className="glass bg-transparent">
            <Filter className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>

        {/* Commission List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : commissions.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Commissions Found</h3>
            <p className="text-muted-foreground">
              {Object.values(filters).some((f) => f && f !== "all")
                ? "Try adjusting your filters"
                : "Start referring users to earn commissions"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {commissions.map((commission) => (
              <div
                key={commission.id}
                className="flex items-center justify-between p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getTransactionIcon(commission.transaction_type)}
                  <div>
                    <h4 className="font-medium">{commission.description}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{new Date(commission.created_at).toLocaleDateString()}</span>
                      {commission.metadata?.order_id && (
                        <>
                          <span>•</span>
                          <span>Order #{commission.metadata.order_id}</span>
                        </>
                      )}
                      {commission.metadata?.activity_type && (
                        <>
                          <span>•</span>
                          <span>{commission.metadata.activity_type}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-green-600 mb-1">+{formatCurrency(commission.amount)}</div>
                  <Badge className={`${getStatusColor(commission.status)} text-white text-xs`}>
                    {commission.status.charAt(0).toUpperCase() + commission.status.slice(1)}
                  </Badge>
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
              {pagination.total} commissions
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
