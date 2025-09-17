"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Package,
  Search,
  Filter,
  Eye,
  X,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Calendar,
  Loader2,
} from "lucide-react"
import { ApiService, type Order, type InstallmentOrder } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { OrderDetailsModal } from "./order-details"

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [installmentOrders, setInstallmentOrders] = useState<InstallmentOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [ordersData, installmentData] = await Promise.all([
        ApiService.getOrders(),
        ApiService.getInstallmentOrders().catch(() => []),
      ])

      setOrders(ordersData)
      setInstallmentOrders(installmentData)
    } catch (error) {
      toast.error("Failed to load orders")
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async (orderId: number) => {
    try {
      await ApiService.cancelOrder(orderId)
      toast.success("Order cancelled successfully")
      fetchData() // Refresh data
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel order")
    }
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "shipped":
        return <Truck className="h-4 w-4 text-blue-500" />
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "cancelled":
        return <X className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-500"
      case "shipped":
        return "bg-blue-500"
      case "processing":
        return "bg-yellow-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getInstallmentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "active":
        return "bg-blue-500"
      case "defaulted":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toString().includes(searchQuery) ||
      order.items.some((item) => item.product.name.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-balance">Order Management</h2>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass border-white/20 h-10 sm:h-11 text-sm sm:text-base"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 glass border-white/20 h-10 sm:h-11">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="glass w-full sm:w-auto grid grid-cols-2 sm:flex">
          <TabsTrigger value="orders" className="flex items-center gap-2 text-xs sm:text-sm">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Regular Orders</span>
            <span className="sm:hidden">Orders</span>
            <span>({orders.length})</span>
          </TabsTrigger>
          <TabsTrigger value="installments" className="flex items-center gap-2 text-xs sm:text-sm">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Installment Orders</span>
            <span className="sm:hidden">Installments</span>
            <span>({installmentOrders.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card className="glass-card border-white/20 text-center py-8 sm:py-12">
              <CardContent>
                <Package className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">No Orders Found</h3>
                <p className="text-muted-foreground text-sm sm:text-base text-balance">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "You haven't placed any orders yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="glass-card border-white/20">
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span className="font-semibold text-sm sm:text-base">Order #{order.id}</span>
                        </div>
                        <Badge className={`${getStatusColor(order.status)} text-white text-xs sm:text-sm`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        {order.payment_type === "installment" && (
                          <Badge variant="outline" className="border-blue-500 text-blue-600 text-xs sm:text-sm">
                            Installment
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                      <div>
                        <span className="text-xs sm:text-sm text-muted-foreground">Total Amount:</span>
                        <p className="font-semibold text-primary text-sm sm:text-base">
                          {formatCurrency(order.total_amount)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm text-muted-foreground">Items:</span>
                        <p className="font-medium text-sm sm:text-base">{order.items.length} item(s)</p>
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm text-muted-foreground">Delivery:</span>
                        <p className="font-medium text-sm sm:text-base">{formatCurrency(order.delivery_fee)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                      {order.items.slice(0, 3).map((item) => (
                        <img
                          key={item.id}
                          src={item.product.main_image || "/placeholder.svg"}
                          alt={item.product.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded flex-shrink-0"
                        />
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded flex items-center justify-center text-xs font-medium flex-shrink-0">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        <span>Delivery to: </span>
                        <span className="font-medium break-words">{order.address}</span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                          className="glass w-full sm:w-auto text-xs sm:text-sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>

                        {order.status === "pending" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelOrder(order.id)}
                            className="w-full sm:w-auto text-xs sm:text-sm"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="installments" className="space-y-4">
          {installmentOrders.length === 0 ? (
            <Card className="glass-card border-white/20 text-center py-8 sm:py-12">
              <CardContent>
                <CreditCard className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">No Installment Orders</h3>
                <p className="text-muted-foreground text-sm sm:text-base">You dont have any installment orders yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {installmentOrders.map((installment) => (
                <Card key={installment.id} className="glass-card border-white/20">
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-blue-500" />
                          <span className="font-semibold text-sm sm:text-base">Installment #{installment.id}</span>
                        </div>
                        <Badge
                          className={`${getInstallmentStatusColor(installment.status)} text-white text-xs sm:text-sm`}
                        >
                          {installment.status.charAt(0).toUpperCase() + installment.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {new Date(installment.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                      <div>
                        <span className="text-xs sm:text-sm text-muted-foreground">Total Amount:</span>
                        <p className="font-semibold text-primary text-sm sm:text-base">
                          {formatCurrency(installment.total_amount)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm text-muted-foreground">Remaining:</span>
                        <p className="font-semibold text-orange-600 text-sm sm:text-base">
                          {formatCurrency(installment.remaining_amount)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm text-muted-foreground">Monthly Payment:</span>
                        <p className="font-medium text-sm sm:text-base">
                          {formatCurrency(installment.monthly_payment)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm text-muted-foreground">Plan:</span>
                        <p className="font-medium text-sm sm:text-base">{installment.months} months</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>Next Payment: {new Date(installment.next_payment_date).toLocaleDateString()}</span>
                      </div>

                      {installment.status === "active" && (
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 w-full sm:w-auto text-xs sm:text-sm"
                          onClick={() => {
                            window.location.href = `/lipa?payment=${installment.id}`
                          }}
                        >
                          Pay {formatCurrency(installment.monthly_payment)}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderDetails(false)
            setSelectedOrder(null)
          }}
        />
      )}
    </div>
  )
}
