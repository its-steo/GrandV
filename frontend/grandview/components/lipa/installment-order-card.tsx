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

// Define glassmorphism styles
const glassmorphismStyles = `
  .glass-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
  }
  .glass-card:hover {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
  .dark .glass-card {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }
  .dark .glass-card:hover {
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.25);
  }
`

interface InstallmentOrderCardProps {
  order: InstallmentOrder
  onPaymentSuccess: () => void
}

export function InstallmentOrderCard({ order, onPaymentSuccess }: InstallmentOrderCardProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Validate order fields
  const isValidOrder = (
    order.initial_deposit &&
    !isNaN(Number.parseFloat(order.initial_deposit)) &&
    order.remaining_amount &&
    !isNaN(Number.parseFloat(order.remaining_amount)) &&
    order.monthly_payment &&
    !isNaN(Number.parseFloat(order.monthly_payment)) &&
    order.next_payment_date &&
    !isNaN(Date.parse(order.next_payment_date)) &&
    order.payments && Array.isArray(order.payments)
  );

  if (!isValidOrder) {
    console.warn("Invalid installment order data:", order);
    return (
      <Card className="glass-card border-white/10">
        <CardContent className="p-3 sm:p-4 md:p-6">
          <p className="text-red-600 text-sm">Error: Invalid order data</p>
        </CardContent>
      </Card>
    );
  }

  // Compute total_amount from available fields
  const paymentsSum = order.payments.reduce((sum, p) => sum + Number.parseFloat(p.amount || '0'), 0);
  const totalAmount = Number.parseFloat(order.initial_deposit) + Number.parseFloat(order.remaining_amount) + paymentsSum;

  // Normalize fields
  const normalizedStatus = order.status?.toUpperCase() || "ACTIVE";
  const displayStatus = {
    PENDING: "Pending",
    ONGOING: "Active",
    ACTIVE: "Active",
    PAID: "Completed",
    OVERDUE: "Overdue",
  }[normalizedStatus] || "Unknown";
  const monthlyPayment = order.monthly_payment;
  const remainingAmount = order.remaining_amount;
  const nextPaymentDate = order.next_payment_date;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "ONGOING":
      case "ACTIVE":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "PAID":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "OVERDUE":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500";
      case "ONGOING":
      case "ACTIVE":
        return "bg-blue-500";
      case "PAID":
        return "bg-green-500";
      case "OVERDUE":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const calculateProgress = () => {
    const remaining = Number.parseFloat(order.remaining_amount);
    const paidAmount = totalAmount - remaining;
    return (paidAmount / totalAmount) * 100;
  };

  const calculateDaysUntilDue = () => {
    if (!order.next_payment_date) return 30; // Default to 30 days if missing
    const dueDate = new Date(order.next_payment_date);
    if (isNaN(dueDate.getTime())) return 30; // Fallback if invalid
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const progress = calculateProgress();
  const daysUntilDue = calculateDaysUntilDue();
  const isOverdue = daysUntilDue < 0;
  const isDueSoon = daysUntilDue <= 7 && daysUntilDue >= 0;
  const canMakePayment = normalizedStatus === "ACTIVE" || normalizedStatus === "ONGOING" || normalizedStatus === "OVERDUE";

  return (
    <>
      <style>{glassmorphismStyles}</style>
      <Card className="glass-card">
        <CardContent className="p-3 sm:p-4 md:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                {getStatusIcon(normalizedStatus)}
                <span className="font-semibold text-sm sm:text-base">Order #{order.order}</span>
              </div>
              <Badge className={`${getStatusColor(normalizedStatus)} text-white text-xs`}>
                {displayStatus}
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mb-4">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress: {progress.toFixed(1)}%</span>
              <span>Total: {formatCurrency(totalAmount.toString())}</span>
            </div>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm mb-4">
            <div className="space-y-1">
              <span className="text-muted-foreground">Remaining Balance</span>
              <p className="font-semibold">{formatCurrency(remainingAmount)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Monthly Payment</span>
              <p className="font-semibold">{formatCurrency(monthlyPayment)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Plan Duration</span>
              <p className="font-semibold">{order.months} months</p>
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
                      {new Date(nextPaymentDate).toLocaleDateString()}
                      {isOverdue && ` (${Math.abs(daysUntilDue)} days overdue)`}
                      {isDueSoon && !isOverdue && ` (${daysUntilDue} days)`}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-semibold text-sm sm:text-base">{formatCurrency(monthlyPayment)}</p>
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
                {normalizedStatus === "PAID"
                  ? "Installment plan completed"
                  : `${formatCurrency((totalAmount - Number.parseFloat(remainingAmount)).toString())} paid so far`}
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
  );
}