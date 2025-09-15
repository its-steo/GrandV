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

export function CheckoutForm({ cartItems, totalAmount, onCheckoutComplete, onClose }: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    address: "",
    phone: "",
    delivery_fee: 225,
  })
  const [paymentType, setPaymentType] = useState<"full" | "installment">("full")
  const [installmentMonths, setInstallmentMonths] = useState(3)
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [lipaRegistration, setLipaRegistration] = useState<LipaRegistration | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingLipa, setIsLoadingLipa] = useState(true)

  useEffect(() => {
    fetchLipaRegistration()
  }, [])

  const fetchLipaRegistration = async () => {
    try {
      const registration = await ApiService.getLipaRegistration()
      setLipaRegistration(registration)
    } catch (error) {
      console.error("Failed to fetch Lipa registration:", error)
    } finally {
      setIsLoadingLipa(false)
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

      const checkoutData = {
        address: formData.address,
        phone: formData.phone,
        delivery_fee: formData.delivery_fee.toString(),
        payment_method: paymentType === "full" ? "FULL" : "INSTALLMENT",
        ...(paymentType === "installment" && { months: installmentMonths }),
        ...(appliedCoupon && { coupon_code: appliedCoupon.code }),
      }

      await ApiService.checkout(checkoutData)

      toast.success(
        paymentType === "installment"
          ? `Order placed! Deposit of ${formatCurrency(calculateInstallmentDetails().depositAmount)} required.`
          : "Order placed successfully!",
      )

      onCheckoutComplete()
    } catch (error) {
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
    <div className="w-full max-w-[95vw] sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto p-2 sm:p-3 md:p-4 lg:p-6 space-y-3 sm:space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-balance">Checkout</h1>
        <Button variant="ghost" onClick={onClose} className="self-end sm:self-auto w-8 h-8 sm:w-10 sm:h-10 p-0 hover:bg-white/10">
          ✕
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
        {/* Checkout Form */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6 order-2 lg:order-1">
          <Card className="glass-card border-white/20">
            <CardHeader className="pb-2 sm:pb-3 md:pb-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
                <Truck className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="address" className="text-xs sm:text-sm md:text-base">
                  Delivery Address *
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your full delivery address"
                  required
                  className="glass border-white/20 text-xs sm:text-sm md:text-base h-9 sm:h-10 md:h-11"
                />
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="phone" className="text-xs sm:text-sm md:text-base">
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
                  className="glass border-white/20 text-xs sm:text-sm md:text-base h-9 sm:h-10 md:h-11"
                />
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="delivery_fee" className="text-xs sm:text-sm md:text-base">
                  Delivery Fee
                </Label>
                <Select
                  value={formData.delivery_fee.toString()}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, delivery_fee: Number(value) }))}
                >
                  <SelectTrigger className="glass border-white/20 h-9 sm:h-10 md:h-11 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="225">Standard Delivery - {formatCurrency(225)}</SelectItem>
                    <SelectItem value="300">Express Delivery - {formatCurrency(300)}</SelectItem>
                    <SelectItem value="0">Pickup - Free</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Payment Options */}
          <Card className="glass-card border-white/20">
            <CardHeader className="pb-2 sm:pb-3 md:pb-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
                <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                Payment Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <RadioGroup value={paymentType} onValueChange={(value: "full" | "installment") => setPaymentType(value)}>
                <div className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 md:p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                  <RadioGroupItem value="full" id="full" className="mt-1" />
                  <Label htmlFor="full" className="flex-1 cursor-pointer">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                      <span className="text-xs sm:text-sm md:text-base font-medium">Pay Full Amount</span>
                      <Badge variant="default" className="self-start sm:self-auto text-xs">
                        {formatCurrency(finalTotal)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Pay the entire amount now</p>
                  </Label>
                </div>

                <div className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 md:p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                  <RadioGroupItem value="installment" id="installment" className="mt-1" />
                  <Label htmlFor="installment" className="flex-1 cursor-pointer">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                      <span className="text-xs sm:text-sm md:text-base font-medium">Lipa Mdogo Mdogo (Installments)</span>
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
                    <p className="text-xs text-muted-foreground mt-1">Pay 40% now, rest in monthly installments</p>
                  </Label>
                </div>
              </RadioGroup>

              {paymentType === "installment" && lipaRegistration?.status === "APPROVED" && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3 md:p-4 rounded-lg space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                    <span className="font-medium text-blue-900 dark:text-blue-100 text-xs sm:text-sm md:text-base">
                      Installment Plan
                    </span>
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <Label className="text-xs sm:text-sm md:text-base">Payment Period</Label>
                    <Select
                      value={installmentMonths.toString()}
                      onValueChange={(value) => setInstallmentMonths(Number(value))}
                    >
                      <SelectTrigger className="glass border-white/20 h-9 sm:h-10 md:h-11 text-xs sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 Months</SelectItem>
                        <SelectItem value="6">6 Months</SelectItem>
                        <SelectItem value="12">12 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <div className="p-2 bg-white/5 rounded">
                      <span className="text-muted-foreground block text-xs sm:text-sm">Deposit (40%):</span>
                      <p className="font-semibold text-primary text-sm sm:text-base">
                        {formatCurrency(installmentDetails.depositAmount)}
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded">
                      <span className="text-muted-foreground block text-xs sm:text-sm">Monthly Payment:</span>
                      <p className="font-semibold text-sm sm:text-base">
                        {formatCurrency(installmentDetails.monthlyPayment)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {paymentType === "installment" && (!lipaRegistration || lipaRegistration.status !== "APPROVED") && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 sm:p-3 md:p-4 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-yellow-700 dark:text-yellow-300 text-xs sm:text-sm">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>
                      You need to register and get approved for Lipa Mdogo Mdogo to use installment payments.
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-transparent w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm"
                    onClick={() => (window.location.href = "/lipa")}
                  >
                    Register Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coupon Code */}
          <Card className="glass-card border-white/20">
            <CardHeader className="pb-2 sm:pb-3 md:pb-6">
              <CardTitle className="text-sm sm:text-base md:text-lg">Coupon Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="glass border-white/20 text-xs sm:text-sm h-9 sm:h-10 md:h-11 flex-1"
                />
                <Button
                  onClick={applyCoupon}
                  variant="outline"
                  className="glass bg-transparent h-9 sm:h-10 md:h-11 text-xs sm:text-sm w-full sm:w-auto"
                >
                  Apply
                </Button>
              </div>
              {appliedCoupon && (
                <div className="mt-2 text-xs sm:text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span>
                    Coupon "{appliedCoupon.code}" applied - {appliedCoupon.discount}% discount
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6 order-1 lg:order-2">
          <Card className="glass-card border-white/20 sticky top-2 sm:top-4">
            <CardHeader className="pb-2 sm:pb-3 md:pb-6">
              <CardTitle className="text-sm sm:text-base md:text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="space-y-2 max-h-40 sm:max-h-48 md:max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-2 sm:gap-3 p-2 rounded-lg bg-white/5">
                    <img
                      src={item.product.main_image || "/placeholder.svg"}
                      alt={item.product.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs sm:text-sm line-clamp-2 leading-tight">{item.product.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">
                        {formatCurrency(item.product.price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-xs sm:text-sm font-medium flex-shrink-0 self-start">
                      {formatCurrency(item.subtotal)}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon.discount}%):</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span>{formatCurrency(formData.delivery_fee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-sm sm:text-base md:text-lg">
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(finalTotal)}</span>
                </div>

                {paymentType === "installment" && lipaRegistration?.status === "APPROVED" && (
                  <>
                    <Separator />
                    <div className="bg-primary/10 p-2 sm:p-3 rounded-lg space-y-1">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span>Pay Today (40%):</span>
                        <span className="font-semibold text-primary">
                          {formatCurrency(installmentDetails.depositAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
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
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 h-10 sm:h-11 md:h-12 text-xs sm:text-sm md:text-base font-medium"
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