"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Package, Truck, MapPin,CreditCard, CheckCircle, Clock, AlertCircle, X, Loader2, Star as StarIcon } from "lucide-react"
import { ApiService, type Order } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import Confetti from 'react-confetti'

interface OrderDetailsModalProps {
  order: Order
  onClose: () => void
}

interface TrackingInfo {
  tracking_number?: string
  estimated_delivery?: string
  estimated_minutes?: number
  delivery_guy?: {
    name: string
    vehicle_type: string
  }
  history?: Array<{
    description: string
    timestamp: string
  }>
  status?: string
  preparation_steps?: string[]
}

export function OrderDetailsModal({ order: initialOrder, onClose }: OrderDetailsModalProps) {
  const [order, setOrder] = useState(initialOrder)
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null)
  const [loadingTracking, setLoadingTracking] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [showTracking, setShowTracking] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [rating, setRating] = useState(order.rating || 0)
  const [hoverRating, setHoverRating] = useState(0)

  const fetchTrackingInfo = useCallback(async () => {
    try {
      setLoadingTracking(true)
      const tracking = await ApiService.trackOrder(order.id)
      setTrackingInfo((prev) => {
        if (!prev || tracking.status !== prev.status || tracking.preparation_steps !== prev.preparation_steps) {
          return tracking
        }
        return prev
      })
      if (tracking.status === 'processing' && tracking.preparation_steps && tracking.preparation_steps.length > 0) {
        const interval = setInterval(() => {
          setCurrentStepIndex((prev) => (prev + 1) % (tracking.preparation_steps?.length || 1))
        }, 5000)
        return () => clearInterval(interval)
      }
    } catch (error) {
      console.error("Failed to fetch tracking info:", error)
    } finally {
      setLoadingTracking(false)
    }
  }, [order.id])

  useEffect(() => {
    fetchTrackingInfo()
    let pollInterval: NodeJS.Timeout
    if (order.status === 'processing' || order.status === 'shipped') {
      pollInterval = setInterval(fetchTrackingInfo, 10000)
    }
    return () => clearInterval(pollInterval)
  }, [fetchTrackingInfo, order.status])

  useEffect(() => {
    if (showTracking && order.status === 'shipped' && trackingInfo?.estimated_minutes) {
      const startTime = Date.now()
      const totalTime = trackingInfo.estimated_minutes * 60 * 1000 // Convert minutes to milliseconds
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime
        const newProgress = Math.min(100, (elapsed / totalTime) * 100)
        setProgress(newProgress)
        if (newProgress >= 100) {
          clearInterval(interval)
          confirmDelivery()
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [showTracking, order.status, trackingInfo?.estimated_minutes])

  const confirmDelivery = async () => {
    try {
      await ApiService.confirmDelivery(order.id)
      setOrder({ ...order, status: 'delivered' })
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
      toast.success("Delivery confirmed!")
    } catch (error) {
      toast.error("Failed to confirm delivery")
    }
  }

  const submitRating = async (newRating: number) => {
    if (rating > 0) return
    try {
      await ApiService.submitRating(order.id, newRating)
      setRating(newRating)
      setOrder({ ...order, rating: newRating })
      toast.success("Thank you for your rating!")
    } catch (error) {
      toast.error("Failed to submit rating")
    }
  }

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
      <DialogContent className="sm:max-w-2xl glass bg-white/10 backdrop-blur-md border-white/20">
        {showConfetti && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={200}
          />
        )}
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl md:text-2xl flex items-center gap-2">
            <Package className="h-5 w-5 sm:h-6 sm:w-6" />
            Order #{order.id}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 sm:space-y-6">
          {/* Order Summary */}
          <Card className="glass-card border-white/20">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <Badge className={`${getStatusColor(order.status)} text-white text-xs sm:text-sm capitalize`}>
                    {order.status}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Ordered on {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
                  <p className="font-semibold text-sm sm:text-base">{formatCurrency(order.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.product.price), 0))}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Payment</p>
                  <p className="font-medium capitalize text-sm sm:text-base">{order.payment_type}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Items</p>
                  <p className="font-medium text-sm sm:text-base">{order.items.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Info */}
          <Card className="glass-card border-white/20">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                <h3 className="font-semibold text-sm sm:text-base">Delivery Information</h3>
              </div>
              <div className="space-y-2">
                <p className="text-xs sm:text-sm"><span className="text-muted-foreground">Address:</span> {order.address}</p>
                <p className="text-xs sm:text-sm"><span className="text-muted-foreground">Phone:</span> {order.phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card className="glass-card border-white/20">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                <h3 className="font-semibold text-sm sm:text-base">Order Items</h3>
              </div>
              <div className="space-y-3 max-h-48 sm:max-h-60 overflow-y-auto">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                    <img
                      src={item.product.main_image}
                      alt={item.product.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs sm:text-sm truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} x {formatCurrency(item.product.price)}
                      </p>
                    </div>
                    <p className="font-semibold text-xs sm:text-sm">{formatCurrency(Number(item.quantity) * Number(item.product.price))}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tracking */}
          <Card className="glass-card border-white/20">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5" />
                <h3 className="font-semibold text-sm sm:text-base">Tracking Information</h3>
              </div>
              {loadingTracking ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
                </div>
              ) : trackingInfo ? (
                <div className="space-y-4">
                  {order.status === 'processing' && trackingInfo.preparation_steps && (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <p className="text-sm">{trackingInfo.preparation_steps[currentStepIndex]}</p>
                    </div>
                  )}

                  {order.status === 'shipped' && trackingInfo.delivery_guy && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Delivery Guy Profile</h4>
                      <p>Name: {trackingInfo.delivery_guy.name}</p>
                      <p>Vehicle: {trackingInfo.delivery_guy.vehicle_type}</p>
                      <p>Estimated Time: {trackingInfo.estimated_minutes} minutes</p>
                      <Button onClick={() => setShowTracking(true)}>Track Delivery Guy</Button>
                    </div>
                  )}

                  {showTracking && order.status === 'shipped' && trackingInfo.estimated_minutes && (
                    <div className="mt-4">
                      <div className="relative w-full h-10">
                        <div className="absolute top-0 left-0 w-full h-2.5 bg-gray-200 rounded-full">
                          <div
                            className="h-2.5 bg-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <Truck
                          className="absolute top-1/2 transform -translate-y-1/2 text-blue-600"
                          style={{ left: `calc(${progress}% - 16px)` }}
                        />
                      </div>
                      <p className="text-center mt-2">{Math.floor(progress)}% Complete</p>
                    </div>
                  )}

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

          {/* Rating */}
          {order.status === 'delivered' && (
            <Card className="glass-card border-white/20">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <StarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <h3 className="font-semibold text-sm sm:text-base">Rate Your Experience</h3>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`h-5 w-5 sm:h-6 sm:w-6 cursor-pointer ${
                        (hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
                      }`}
                      onClick={() => submitRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    />
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">You rated this order {rating} star{rating > 1 ? 's' : ''}</p>
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