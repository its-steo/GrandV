"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CarIcon as CartIcon, Plus, Minus, Trash2, Loader2, Tag, Check, X } from "lucide-react"
import { ApiService } from "@/lib/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { CheckoutForm } from "@/components/checkout/checkout-form"

interface CartItem {
  id: number
  product: {
    id: number
    name: string
    price: string
    main_image: string
  }
  quantity: number
  subtotal: string
}

interface CartProps {
  cartCount: number
  onCartUpdate: () => void
}

interface CouponState {
  code: string
  isValid: boolean
  discount: number
  message?: string
  isValidating: boolean
}

export default function ShoppingCart({ cartCount, onCartUpdate }: CartProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [coupon, setCoupon] = useState<CouponState>({
    code: "",
    isValid: false,
    discount: 0,
    isValidating: false,
  })
  const router = useRouter()

  useEffect(() => {
    fetchCart()
  }, [])

  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCart()
      onCartUpdate()
    }
    window.addEventListener("cartUpdated", handleCartUpdate)
    return () => window.removeEventListener("cartUpdated", handleCartUpdate)
  }, [onCartUpdate])

  const fetchCart = async () => {
    try {
      setLoading(true)
      const data = await ApiService.getCart()
      setCartItems(
        (data.items || []).map((item: any) => ({
          ...item,
          subtotal: item.subtotal ?? (Number.parseFloat(item.product.price) * item.quantity).toFixed(2),
        })),
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load cart")
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(cartItemId)
      return
    }

    try {
      await ApiService.updateCartItem({ cart_item_id: cartItemId, quantity: newQuantity })
      toast.success("Cart quantity updated")
      fetchCart()
      window.dispatchEvent(new Event("cartUpdated"))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update quantity")
    }
  }

  const removeItem = async (cartItemId: number) => {
    try {
      await ApiService.removeFromCart(cartItemId)
      toast.success("Item removed from cart")
      fetchCart()
      window.dispatchEvent(new Event("cartUpdated"))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove item")
    }
  }

  const validateCoupon = async (code: string) => {
    if (!code.trim()) {
      setCoupon((prev) => ({ ...prev, isValid: false, discount: 0, message: "" }))
      return
    }

    setCoupon((prev) => ({ ...prev, isValidating: true }))

    try {
      const result = await ApiService.validateCoupon(code)
      setCoupon((prev) => ({
        ...prev,
        isValid: result.valid,
        discount: result.valid ? result.discount : 0,
        message: result.message,
        isValidating: false,
      }))

      if (result.valid) {
        toast.success(`Coupon applied! ${result.discount}% discount`)
      } else {
        toast.error(result.message || "Invalid coupon code")
      }
    } catch (error) {
      setCoupon((prev) => ({
        ...prev,
        isValid: false,
        discount: 0,
        message: "Failed to validate coupon",
        isValidating: false,
      }))
      toast.error("Failed to validate coupon")
    }
  }

  const removeCoupon = () => {
    setCoupon({
      code: "",
      isValid: false,
      discount: 0,
      isValidating: false,
    })
    toast.success("Coupon removed")
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) return
    setShowCheckout(true)
  }

  const handleCheckoutComplete = () => {
    setCartItems([])
    setShowCheckout(false)
    setCoupon({
      code: "",
      isValid: false,
      discount: 0,
      isValidating: false,
    })
    window.dispatchEvent(new Event("cartUpdated"))
    router.push("/profile?tab=orders")
  }

  const totalAmount = cartItems.reduce(
    (sum, item) =>
      sum + Number.parseFloat(item.subtotal || (Number.parseFloat(item.product.price) * item.quantity).toString()),
    0,
  )

  const discountAmount = coupon.isValid ? (totalAmount * coupon.discount) / 100 : 0
  const finalTotal = totalAmount - discountAmount

  if (showCheckout) {
    return (
      <CheckoutForm
        cartItems={cartItems}
        totalAmount={finalTotal}
        onCheckoutComplete={handleCheckoutComplete}
        onClose={() => setShowCheckout(false)}
      />
    )
  }

  return (
    <Sheet onOpenChange={(open) => open && fetchCart()}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="relative glass p-0 h-10 w-10 sm:h-12 sm:w-12">
          <CartIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          {cartCount > 0 && (
            <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-4 w-4 sm:h-5 sm:w-5 p-0 rounded-full text-xs">
              {cartCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full max-w-[90vw] sm:max-w-[425px] md:max-w-[540px] glass-card border-white/20">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            Shopping Cart
            <Badge className="ml-auto text-xs">{cartItems.length} items</Badge>
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6 sm:py-8">
              <CartIcon className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground mb-3 sm:mb-4">Add some products to get started.</p>
              <Button variant="outline" className="glass bg-transparent text-sm py-1 h-9 sm:h-10">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 py-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 sm:gap-4 border-b border-white/10 pb-3 sm:pb-4 last:border-b-0">
                    <img
                      src={item.product.main_image || "/placeholder.svg"}
                      alt={item.product.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm sm:text-base line-clamp-2">{item.product.name}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {formatCurrency(item.product.price)} x {item.quantity}
                      </p>
                      <p className="text-xs sm:text-sm font-semibold">Subtotal: {formatCurrency(item.subtotal)}</p>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-xs sm:text-sm font-medium w-6 sm:w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 ml-auto text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="border-t border-white/20 pt-3 sm:pt-4 space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs sm:text-sm font-medium">Have a coupon?</span>
                  </div>

                  {coupon.isValid ? (
                    <div className="flex items-center gap-2 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                      <span className="text-xs sm:text-sm text-green-700 flex-1">
                        Coupon "{coupon.code}" applied ({coupon.discount}% off)
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={removeCoupon}
                        className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-green-600 hover:text-green-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-col sm:flex-row">
                      <Input
                        placeholder="Enter coupon code"
                        value={coupon.code}
                        onChange={(e) => setCoupon((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        className="glass border-white/20 text-xs sm:text-sm"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            validateCoupon(coupon.code)
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => validateCoupon(coupon.code)}
                        disabled={coupon.isValidating || !coupon.code.trim()}
                        className="glass bg-transparent h-9 sm:h-10 text-xs sm:text-sm"
                      >
                        {coupon.isValidating ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> : "Apply"}
                      </Button>
                    </div>
                  )}

                  {coupon.message && !coupon.isValid && <p className="text-xs text-red-500">{coupon.message}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>

                  {coupon.isValid && discountAmount > 0 && (
                    <div className="flex justify-between items-center text-green-600 text-xs sm:text-sm">
                      <span>Discount ({coupon.discount}%):</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-base sm:text-lg font-semibold border-t border-white/10 pt-2">
                    <span>Total:</span>
                    <span className="text-primary">{formatCurrency(finalTotal)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={isCheckingOut || cartItems.length === 0}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-xs sm:text-sm h-9 sm:h-10"
                >
                  Proceed to Checkout
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}