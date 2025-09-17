"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Package, Truck, MapPin, Phone, CreditCard, CheckCircle, Clock, AlertCircle, X, Loader2 } from "lucide-react"
import { ApiService, type Order } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

interface OrderDetailsModalProps {
  order: Order
  onClose: () => void
}

interface TrackingInfo {
  tracking_number?: string
  estimated_delivery?: string
  history?: Array<{
    description: string
    timestamp: string
  }>
}

export function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null)
  const [loadingTracking, setLoadingTracking] = useState(false)

  const fetchTrackingInfo = useCallback(async () => {
    try {
      setLoadingTracking(true)
      const tracking = await ApiService.trackOrder(order.id)
      setTrackingInfo(tracking)
    } catch (error) {
      console.error("Failed to fetch tracking info:", error)
    } finally {
      setLoadingTracking(false)
    }
  }, [order.id])

  useEffect(() => {
    if (order.status === "shipped" || order.status === "delivered") {
      fetchTrackingInfo()
    }
  }, [order.id, order.status, fetchTrackingInfo])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "shipped":
        return <Truck className="h-5 w-5 text-blue-500" />
      case "processing":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "cancelled":
        return <X className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
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

  const handleCancelOrder = async () => {
    try {
      await ApiService.cancelOrder(order.id)
      toast.success("Order cancelled successfully")
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel order")
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[80vw] xl:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto glass-card border-white/20 p-3 sm:p-4 md:p-6">
        <DialogHeader className="pb-3 sm:pb-4">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
            <Package className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-balance">Order #{order.id} Details</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Order Status */}
          <Card className="glass-card border-white/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base">Order Status</h3>
                    <Badge className={`${getStatusColor(order.status)} text-white mt-1 text-xs sm:text-sm`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs sm:text-sm text-muted-foreground">Order Date</p>
                  <p className="font-medium text-sm sm:text-base">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card className="glass-card border-white/20">
            <CardContent className="p-3 sm:p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                <Truck className="h-4 w-4" />
                Delivery Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground">Delivery Address</p>
                    <p className="font-medium text-sm sm:text-base break-words">{order.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Phone Number</p>
                    <p className="font-medium text-sm sm:text-base">{order.phone}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card className="glass-card border-white/20">
            <CardContent className="p-3 sm:p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                <CreditCard className="h-4 w-4" />
                Payment Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Payment Type</p>
                  <Badge variant="outline" className="mt-1 text-xs sm:text-sm">
                    {order.payment_type === "installment" ? "Installment" : "Full Payment"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-semibold text-primary text-sm sm:text-base">
                    {formatCurrency(order.total_amount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Delivery Fee</p>
                  <p className="font-medium text-sm sm:text-base">{formatCurrency(order.delivery_fee)}</p>
                </div>
              </div>

              {order.coupon_code && (
                <div className="mt-3 p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <p className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                    Coupon `{order.coupon_code}` applied
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="glass-card border-white/20">
            <CardContent className="p-3 sm:p-4">
              <h3 className="font-semibold mb-3 text-sm sm:text-base">Order Items</h3>
              <div className="space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-3 sm:gap-4 p-2 sm:p-3 border border-white/10 rounded-lg">
                    <img
                      src={item.product.main_image || "/placeholder.svg"}
                      alt={item.product.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs sm:text-sm line-clamp-2">{item.product.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-xs sm:text-sm">{formatCurrency(item.subtotal)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tracking Information */}
          {(order.status === "shipped" || order.status === "delivered") && (
            <Card className="glass-card border-white/20">
              <CardContent className="p-3 sm:p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <Truck className="h-4 w-4" />
                  Tracking Information
                </h3>

                {loadingTracking ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : trackingInfo ? (
                  <div className="space-y-4">
                    {trackingInfo.tracking_number && (
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Tracking Number</p>
                        <p className="font-mono font-medium text-xs sm:text-sm break-all">
                          {trackingInfo.tracking_number}
                        </p>
                      </div>
                    )}

                    {trackingInfo.estimated_delivery && (
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Estimated Delivery</p>
                        <p className="font-medium text-sm sm:text-base">
                          {new Date(trackingInfo.estimated_delivery).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {trackingInfo.history && trackingInfo.history.length > 0 && (
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2">Tracking History</p>
                        <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                          {trackingInfo.history.map((event, index) => (
                            <div key={index} className="flex items-start gap-3 p-2 bg-muted/50 rounded">
                              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium">{event.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(event.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground">Tracking information not available</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pt-4 border-t border-white/10">
            <Button
              variant="outline"
              onClick={onClose}
              className="glass bg-transparent order-2 sm:order-1 w-full sm:w-auto"
            >
              Close
            </Button>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 order-1 sm:order-2">
              {order.status === "pending" && (
                <Button variant="destructive" onClick={handleCancelOrder} className="w-full sm:w-auto text-sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel Order
                </Button>
              )}

              {order.payment_type === "installment" && order.installment_order && (
                <Button
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 w-full sm:w-auto text-sm"
                  onClick={() => (window.location.href = `/lipa?payment=${order.installment_order?.id}`)}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Installments
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
