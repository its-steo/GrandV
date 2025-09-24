"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DollarSign, CreditCard, CheckCircle, Loader2 } from "lucide-react"
import { ApiService, type InstallmentOrder } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

interface InstallmentPaymentModalProps {
  order: InstallmentOrder
  onClose: () => void
  onPaymentSuccess: () => void
}

export function InstallmentPaymentModal({ order, onClose, onPaymentSuccess }: InstallmentPaymentModalProps) {
  // Validate and provide fallback for monthly_payment and remaining_amount
  const monthlyPayment = order.monthly_payment && !isNaN(Number.parseFloat(order.monthly_payment)) 
    ? order.monthly_payment 
    : "0";
  const remainingAmount = order.remaining_amount && !isNaN(Number.parseFloat(order.remaining_amount)) 
    ? order.remaining_amount 
    : "0";

  const [paymentAmount, setPaymentAmount] = useState(monthlyPayment);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentType, setPaymentType] = useState<"monthly" | "partial" | "full">("monthly");

  // Normalize status for display
  const normalizedStatus = order.status || "ACTIVE";
  const displayStatus = {
    ACTIVE: "Active",
    PAID: "Completed",
    OVERDUE: "Overdue",
  }[normalizedStatus] || "Unknown";

  const handlePaymentTypeChange = (type: "monthly" | "partial" | "full") => {
    setPaymentType(type);
    switch (type) {
      case "monthly":
        setPaymentAmount(monthlyPayment);
        break;
      case "full":
        setPaymentAmount(remainingAmount);
        break;
      case "partial":
        setPaymentAmount("");
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = Number.parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    if (amount > Number.parseFloat(remainingAmount)) {
      toast.error(`Payment cannot exceed remaining balance of ${formatCurrency(remainingAmount)}`);
      return;
    }
    if (amount > parseFloat(remainingAmount)) {
      toast.error(`Payment cannot exceed remaining balance of ${formatCurrency(remainingAmount)}`);
      return;
    }

    try {
      setIsSubmitting(true);
      await ApiService.makeInstallmentPayment({
        installment_order_id: order.id,
        amount: amount,
      });

      toast.success(`Payment of ${formatCurrency(amount)} successful!`);
      onPaymentSuccess();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingAfterPayment = Number.parseFloat(remainingAmount) - Number.parseFloat(paymentAmount || "0");
  const isFullPayment = remainingAfterPayment <= 0;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto glass-card border-white/20 mx-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <CreditCard className="h-5 w-5 text-primary" />
            Make Installment Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Order Summary */}
          <Card className="glass-card border-white/10">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
                <div>
                  <h3 className="font-semibold text-base sm:text-lg">Order #{order.order}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{order.months} months plan</p>
                </div>
                <Badge className="bg-blue-500 text-white text-xs w-fit">
                  {displayStatus}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <p className="font-semibold">{formatCurrency(order.total_amount || "0")}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Remaining Balance:</span>
                  <p className="font-semibold text-orange-600">{formatCurrency(remainingAmount)}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Monthly Payment:</span>
                  <p className="font-semibold">{formatCurrency(monthlyPayment)}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Next Due Date:</span>
                  <p className="font-semibold">
                    {order.next_payment_date 
                      ? new Date(order.next_payment_date).toLocaleDateString() 
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Options */}
          <div className="space-y-3 sm:space-y-4">
            <Label className="text-sm sm:text-base font-semibold">Payment Options</Label>

            <div className="space-y-2 sm:space-y-3">
              <Card
                className={`cursor-pointer transition-all ${
                  paymentType === "monthly" ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
                onClick={() => handlePaymentTypeChange("monthly")}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0">
                        {paymentType === "monthly" && <div className="w-2 h-2 bg-primary rounded-full" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">Monthly Payment</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Pay your regular monthly amount</p>
                      </div>
                    </div>
                    <span className="font-semibold text-primary text-sm sm:text-base ml-7 sm:ml-0">
                      {formatCurrency(monthlyPayment)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  paymentType === "partial" ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
                onClick={() => handlePaymentTypeChange("partial")}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0">
                        {paymentType === "partial" && <div className="w-2 h-2 bg-primary rounded-full" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">Partial Payment</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Pay any amount you choose</p>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm text-muted-foreground ml-7 sm:ml-0">Custom amount</span>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  paymentType === "full"
                    ? "ring-2 ring-green-500 bg-green-50/50 dark:bg-green-900/20"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => handlePaymentTypeChange("full")}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-green-500 flex items-center justify-center flex-shrink-0">
                        {paymentType === "full" && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                      </div>
                      <div>
                        <p className="font-medium text-green-700 dark:text-green-300 text-sm sm:text-base">
                          Pay Full Balance
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Complete your installment plan</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right ml-7 sm:ml-0">
                      <span className="font-semibold text-green-600 text-sm sm:text-base">
                        {formatCurrency(remainingAmount)}
                      </span>
                      <Badge className="ml-2 bg-green-500 text-white text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complete
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Payment Amount Input */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm sm:text-base">
                Payment Amount
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="pl-10 glass border-white/20 text-sm sm:text-base"
                  min="0"
                  step="0.01"
                  max={remainingAmount}
                  required
                  disabled={paymentType !== "partial"}
                />
              </div>
              {paymentType === "partial" && (
                <p className="text-xs text-muted-foreground">Maximum: {formatCurrency(remainingAmount)}</p>
              )}
            </div>

            {/* Payment Summary */}
            {paymentAmount && Number.parseFloat(paymentAmount) > 0 && (
              <Card className="glass-card border-white/10 bg-blue-50/50 dark:bg-blue-900/20">
                <CardContent className="p-3 sm:p-4">
                  <h4 className="font-semibold mb-3 text-blue-900 dark:text-blue-100 text-sm sm:text-base">
                    Payment Summary
                  </h4>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span>Payment Amount:</span>
                      <span className="font-semibold">{formatCurrency(paymentAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Balance:</span>
                      <span>{formatCurrency(remainingAmount)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Balance After Payment:</span>
                      <span className={isFullPayment ? "text-green-600" : ""}>
                        {formatCurrency(Math.max(0, remainingAfterPayment))}
                      </span>
                    </div>
                    {isFullPayment && (
                      <div className="flex items-center gap-2 text-green-600 mt-2">
                        <CheckCircle className="h-4 w-4 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-medium">
                          This will complete your installment plan!
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pt-4 border-t border-white/10">
              <Button
                variant="outline"
                onClick={onClose}
                className="glass bg-transparent w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || !paymentAmount || Number.parseFloat(paymentAmount) <= 0}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 w-full sm:w-auto order-1 sm:order-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Pay {formatCurrency(paymentAmount || "0")}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}