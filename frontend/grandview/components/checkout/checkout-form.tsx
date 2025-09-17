"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Truck, Calculator, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { ApiService, type LipaRegistration } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

interface CartItem {
  id: number
  product: {
    id: number
    name: string
    price: string
    main_image: string
    supports_installments?: boolean
  }
  quantity: number
  subtotal: string
}

interface CheckoutFormProps {
  cartItems: CartItem[]
  totalAmount: number
  onCheckoutComplete: () => void
  onClose: () => void
}

interface AppliedCoupon {
  code: string
  discount: number
}

export function CheckoutForm({ cartItems, totalAmount, onCheckoutComplete, onClose }: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    address: "",
    phone: "",
    delivery_fee: 225,
  })
  const [paymentType, setPaymentType] = useState<"full" | "installment">("full")
  const [installmentMonths, setInstallmentMonths] = useState(3)
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null) // Fixed any type
  const [lipaRegistration, setLipaRegistration] = useState<LipaRegistration | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchLipaRegistration()
  }, [])

  const fetchLipaRegistration = async () => {
    try {
      const registration = await ApiService.getLipaRegistration()
      setLipaRegistration(registration)
    } catch {
      console.error("Failed to fetch Lipa registration")
      // Don't show error to user since this is optional functionality
      // Set to null to indicate no registration available
      setLipaRegistration(null)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return

    try {
      toast.success("Coupon applied successfully!")
      setAppliedCoupon({ code: couponCode, discount: 10 })
    } catch (error) {
      toast.error("Invalid coupon code")
    }
  }

  const calculateInstallmentDetails = () => {
    const depositPercentage = 0.4
    const depositAmount = totalAmount * depositPercentage
    const remainingAmount = totalAmount - depositAmount
    const monthlyPayment = remainingAmount / installmentMonths

    return {
      depositAmount,
      remainingAmount,
      monthlyPayment,
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.address.trim() || !formData.phone.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    if (paymentType === "installment" && (!lipaRegistration || lipaRegistration.status !== "APPROVED")) {
      toast.error("You need to be approved for Lipa Mdogo Mdogo to use installment payments")
      return
    }

    try {
      setIsSubmitting(true)

      // Use correct keys as expected by ApiService.checkout
      const checkoutData = {
        address: formData.address,
        phone: formData.phone,
        delivery_fee: formData.delivery_fee,
        payment_type: paymentType, // "full" or "installment"
        ...(paymentType === "installment" && { months: installmentMonths }),
        ...(appliedCoupon && { coupon_code: appliedCoupon.code }),
      }

      console.log("Submitting checkout data:", checkoutData) // Add logging for debugging

      await ApiService.checkout(checkoutData)

      toast.success(
        paymentType === "installment"
          ? `Order placed! Deposit of ${formatCurrency(calculateInstallmentDetails().depositAmount)} required.`
          : "Order placed successfully!",
      )

      onCheckoutComplete()
    } catch (error) {
      console.error("Checkout error:", error) // Add logging for debugging
      toast.error(error instanceof Error ? error.message : "Failed to place order")
    } finally {
      setIsSubmitting(false)
    }
  }

  const discountAmount = appliedCoupon ? (totalAmount * appliedCoupon.discount) / 100 : 0
  const finalTotal = totalAmount - discountAmount + formData.delivery_fee
  const installmentDetails = calculateInstallmentDetails()

  const supportsInstallment = cartItems.some((item) => item.product.supports_installments !== false)

  return (
    <div className="w-full max-w-[95vw] sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto p-2 sm:p-3 md:p-4 lg:p-6 space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-balance text-slate-900 dark:text-white">
          Checkout
        </h1>
        <Button
          variant="ghost"
          onClick={onClose}
          className="self-end sm:self-auto w-8 h-8 sm:w-10 sm:h-10 p-0 hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-900 dark:text-white hover:text-slate-900 dark:hover:text-white"
        >
          ✕
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
        {/* Checkout Form */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6 order-2 lg:order-1">
          <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2 sm:pb-3 md:pb-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg text-slate-900 dark:text-white">
                <Truck className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="address" className="text-xs sm:text-sm md:text-base text-slate-700 dark:text-slate-200">
                  Delivery Address *
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your full delivery address"
                  required
                  className="bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 text-xs sm:text-sm md:text-base h-9 sm:h-10 md:h-11"
                />
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="phone" className="text-xs sm:text-sm md:text-base text-slate-700 dark:text-slate-200">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  required
                  className="bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 text-xs sm:text-sm md:text-base h-9 sm:h-10 md:h-11"
                />
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label
                  htmlFor="delivery_fee"
                  className="text-xs sm:text-sm md:text-base text-slate-700 dark:text-slate-200"
                >
                  Delivery Fee
                </Label>
                <Select
                  value={formData.delivery_fee.toString()}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, delivery_fee: Number(value) }))}
                >
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white h-9 sm:h-10 md:h-11 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <SelectItem
                      value="225"
                      className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      Standard Delivery - {formatCurrency(225)}
                    </SelectItem>
                    <SelectItem
                      value="300"
                      className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      Express Delivery - {formatCurrency(300)}
                    </SelectItem>
                    <SelectItem
                      value="0"
                      className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      Pickup - Free
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Payment Options */}
          <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2 sm:pb-3 md:pb-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg text-slate-900 dark:text-white">
                <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                Payment Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <RadioGroup value={paymentType} onValueChange={(value: "full" | "installment") => setPaymentType(value)}>
                <div className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 md:p-4 rounded-lg border border-slate-300/50 dark:border-slate-600/50 hover:border-slate-400/50 dark:hover:border-slate-500/50 transition-colors bg-slate-100/50 dark:bg-slate-700/20">
                  <RadioGroupItem value="full" id="full" className="mt-1" />
                  <Label htmlFor="full" className="flex-1 cursor-pointer">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                      <span className="text-xs sm:text-sm md:text-base font-medium text-slate-900 dark:text-white">
                        Pay Full Amount
                      </span>
                      <Badge variant="default" className="self-start sm:self-auto text-xs">
                        {formatCurrency(finalTotal)}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Pay the entire amount now</p>
                  </Label>
                </div>

                <div className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 md:p-4 rounded-lg border border-slate-300/50 dark:border-slate-600/50 hover:border-slate-400/50 dark:hover:border-slate-500/50 transition-colors bg-slate-100/50 dark:bg-slate-700/20">
                  <RadioGroupItem value="installment" id="installment" className="mt-1" />
                  <Label htmlFor="installment" className="flex-1 cursor-pointer">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                      <span className="text-xs sm:text-sm md:text-base font-medium text-slate-900 dark:text-white">
                        Lipa Mdogo Mdogo (Installments)
                      </span>
                      {supportsInstallment ? (
                        <Badge variant="secondary" className="self-start sm:self-auto text-xs">
                          <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                          Available
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="self-start sm:self-auto text-xs">
                          <AlertCircle className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                          Not Available
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Pay 40% now, rest in monthly installments
                    </p>
                  </Label>
                </div>
              </RadioGroup>

              {paymentType === "installment" && lipaRegistration?.status === "APPROVED" && (
                <div className="bg-blue-50 dark:bg-blue-900/30 p-2 sm:p-3 md:p-4 rounded-lg space-y-2 sm:space-y-3 border border-blue-200 dark:border-blue-800/50">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-800 dark:text-blue-200 text-xs sm:text-sm md:text-base">
                      Installment Plan
                    </span>
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <Label className="text-xs sm:text-sm md:text-base text-slate-700 dark:text-slate-200">
                      Payment Period
                    </Label>
                    <Select
                      value={installmentMonths.toString()}
                      onValueChange={(value) => setInstallmentMonths(Number(value))}
                    >
                      <SelectTrigger className="bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white h-9 sm:h-10 md:h-11 text-xs sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <SelectItem
                          value="3"
                          className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          3 Months
                        </SelectItem>
                        <SelectItem
                          value="6"
                          className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          6 Months
                        </SelectItem>
                        <SelectItem
                          value="12"
                          className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          12 Months
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800/50 rounded">
                      <span className="text-slate-700 dark:text-slate-300 block text-xs sm:text-sm">
                        Deposit (40%):
                      </span>
                      <p className="font-semibold text-blue-600 dark:text-blue-400 text-sm sm:text-base">
                        {formatCurrency(installmentDetails.depositAmount)}
                      </p>
                    </div>
                    <div className="p-2 bg-slate-100 dark:bg-slate-800/50 rounded">
                      <span className="text-slate-700 dark:text-slate-300 block text-xs sm:text-sm">
                        Monthly Payment:
                      </span>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
                        {formatCurrency(installmentDetails.monthlyPayment)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {paymentType === "installment" && (!lipaRegistration || lipaRegistration.status !== "APPROVED") && (
                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-2 sm:p-3 md:p-4 rounded-lg border border-yellow-200 dark:border-yellow-800/50">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-yellow-800 dark:text-yellow-200 text-xs sm:text-sm">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>You need to register and get approved for Lipa Mdogo Mdogo to use installment payments.</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-transparent border-yellow-400 dark:border-yellow-600 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm"
                    onClick={() => (window.location.href = "/lipa/register")}
                  >
                    Register Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coupon Code */}
          <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2 sm:pb-3 md:pb-6">
              <CardTitle className="text-sm sm:text-base md:text-lg text-slate-900 dark:text-white">
                Coupon Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 text-xs sm:text-sm h-9 sm:h-10 md:h-11 flex-1"
                />
                <Button
                  onClick={applyCoupon}
                  variant="outline"
                  className="bg-transparent border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 h-9 sm:h-10 md:h-11 text-xs sm:text-sm w-full sm:w-auto"
                >
                  Apply
                </Button>
              </div>
              {appliedCoupon && (
                <div className="mt-2 text-xs sm:text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span>
                    Coupon `{appliedCoupon.code}` applied - {appliedCoupon.discount}% discount
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6 order-1 lg:order-2">
          <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm sticky top-2 sm:top-4">
            <CardHeader className="pb-2 sm:pb-3 md:pb-6">
              <CardTitle className="text-sm sm:text-base md:text-lg text-slate-900 dark:text-white">
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="space-y-2 max-h-40 sm:max-h-48 md:max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-2 sm:gap-3 p-2 rounded-lg bg-slate-100/50 dark:bg-slate-700/30"
                  >
                    <img
                      src={item.product.main_image || "/placeholder.svg"}
                      alt={item.product.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 dark:text-white text-xs sm:text-sm line-clamp-2 leading-tight">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 sm:mt-1">
                        {formatCurrency(item.product.price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-xs sm:text-sm font-medium flex-shrink-0 self-start text-slate-900 dark:text-white">
                      {formatCurrency(item.subtotal)}
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="bg-slate-300 dark:bg-slate-600" />

              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-700 dark:text-slate-200">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount ({appliedCoupon.discount}%):</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-700 dark:text-slate-200">
                  <span>Delivery:</span>
                  <span>{formatCurrency(formData.delivery_fee)}</span>
                </div>
                <Separator className="bg-slate-300 dark:bg-slate-600" />
                <div className="flex justify-between font-semibold text-sm sm:text-base md:text-lg">
                  <span className="text-slate-900 dark:text-white">Total:</span>
                  <span className="text-blue-600 dark:text-blue-400">{formatCurrency(finalTotal)}</span>
                </div>

                {paymentType === "installment" && lipaRegistration?.status === "APPROVED" && (
                  <>
                    <Separator className="bg-slate-300 dark:bg-slate-600" />
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3 rounded-lg space-y-1 border border-blue-200 dark:border-blue-800/30">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-slate-700 dark:text-slate-200">Pay Today (40%):</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {formatCurrency(installmentDetails.depositAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                        <span>Monthly Payment:</span>
                        <span>{formatCurrency(installmentDetails.monthlyPayment)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || (paymentType === "installment" && lipaRegistration?.status !== "APPROVED")}
                className="w-full !bg-gradient-to-r !from-blue-600 !to-blue-700 hover:!from-blue-700 hover:!to-blue-800 !text-white !border-0 h-10 sm:h-11 md:h-12 text-xs sm:text-sm md:text-base font-medium disabled:!from-slate-400 disabled:!to-slate-500 disabled:!text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : paymentType === "installment" ? (
                  `Pay Deposit ${formatCurrency(installmentDetails.depositAmount)}`
                ) : (
                  `Place Order ${formatCurrency(finalTotal)}`
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
