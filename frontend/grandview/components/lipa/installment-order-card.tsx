"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CreditCard, Calendar, DollarSign, Clock, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react"
import type { InstallmentOrder } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { InstallmentPaymentModal } from "./installment-payment-modal"

interface InstallmentOrderCardProps {
  order: InstallmentOrder
  onPaymentSuccess: () => void
}

export function InstallmentOrderCard({ order, onPaymentSuccess }: InstallmentOrderCardProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "PAID":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "ACTIVE":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "OVERDUE":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <CreditCard className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PAID":
        return "bg-green-500"
      case "ACTIVE":
        return "bg-blue-500"
      case "OVERDUE":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const calculateProgress = () => {
    const totalAmount = Number.parseFloat(order.total_amount)
    const remainingAmount = Number.parseFloat(order.remaining_amount)
    const paidAmount = totalAmount - remainingAmount
    return (paidAmount / totalAmount) * 100
  }

  const calculateDaysUntilDue = () => {
    const dueDate = new Date(order.next_payment_date)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const progress = calculateProgress()
  const daysUntilDue = calculateDaysUntilDue()
  const isOverdue = daysUntilDue < 0
  const isDueSoon = daysUntilDue <= 7 && daysUntilDue >= 0
  const canMakePayment = order.status.toUpperCase() === "ACTIVE" || order.status.toUpperCase() === "OVERDUE"

  return (
    <>
      <Card className="glass-card border-white/10 hover:border-primary/30 transition-all duration-300">
        <CardContent className="p-3 sm:p-4 md:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                <span className="font-semibold text-sm sm:text-base">Order #{order.order}</span>
              </div>
              <Badge className={`${getStatusColor(order.status)} text-white text-xs`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs sm:text-sm text-muted-foreground">Created</p>
              <p className="font-medium text-sm sm:text-base">{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium">Payment Progress</span>
              <span className="text-xs sm:text-sm text-muted-foreground">{progress.toFixed(1)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Payment Details Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
            <div className="space-y-1">
              <span className="text-xs sm:text-sm text-muted-foreground">Total Amount</span>
              <p className="font-semibold text-primary text-sm sm:text-base">{formatCurrency(order.total_amount)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs sm:text-sm text-muted-foreground">Remaining</span>
              <p className="font-semibold text-orange-600 text-sm sm:text-base">
                {formatCurrency(order.remaining_amount)}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs sm:text-sm text-muted-foreground">Monthly Payment</span>
              <p className="font-semibold text-sm sm:text-base">{formatCurrency(order.monthly_payment)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs sm:text-sm text-muted-foreground">Plan Duration</span>
              <p className="font-semibold text-sm sm:text-base">{order.months} months</p>
            </div>
          </div>

          {/* Next Payment Info */}
          {canMakePayment && (
            <div
              className={`p-3 rounded-lg mb-4 ${
                isOverdue
                  ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                  : isDueSoon
                    ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                    : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <div className="flex items-center gap-2">
                  <Calendar
                    className={`h-4 w-4 ${
                      isOverdue ? "text-red-600" : isDueSoon ? "text-yellow-600" : "text-blue-600"
                    }`}
                  />
                  <div>
                    <p
                      className={`text-xs sm:text-sm font-medium ${
                        isOverdue
                          ? "text-red-700 dark:text-red-300"
                          : isDueSoon
                            ? "text-yellow-700 dark:text-yellow-300"
                            : "text-blue-700 dark:text-blue-300"
                      }`}
                    >
                      {isOverdue ? "Payment Overdue" : isDueSoon ? "Payment Due Soon" : "Next Payment"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.next_payment_date).toLocaleDateString()}
                      {isOverdue && ` (${Math.abs(daysUntilDue)} days overdue)`}
                      {isDueSoon && !isOverdue && ` (${daysUntilDue} days)`}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-semibold text-sm sm:text-base">{formatCurrency(order.monthly_payment)}</p>
                  {isOverdue && (
                    <Badge variant="destructive" className="text-xs mt-1">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Overdue
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 flex-shrink-0" />
              <span className="break-words">
                {order.status.toUpperCase() === "PAID"
                  ? "Installment plan completed"
                  : `${formatCurrency(Number.parseFloat(order.total_amount) - Number.parseFloat(order.remaining_amount))} paid so far`}
              </span>
            </div>

            {canMakePayment && (
              <Button
                onClick={() => setShowPaymentModal(true)}
                className={`w-full sm:w-auto ${
                  isOverdue
                    ? "bg-red-600 hover:bg-red-700"
                    : isDueSoon
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                }`}
                size="sm"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                {isOverdue ? "Pay Now" : "Make Payment"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {showPaymentModal && (
        <InstallmentPaymentModal
          order={order}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={onPaymentSuccess}
        />
      )}
    </>
  )
}
