"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CarIcon as CartIcon, Plus, Minus, Trash2, Loader2 } from "lucide-react"
import { ApiService } from "@/lib/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"

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
export default function ShoppingCart({ cartCount, onCartUpdate }: CartProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const router = useRouter()

  // Fetch cart on mount and when sheet opens
  useEffect(() => {
    fetchCart()
  }, [])

  // Listen for cart updates from other components
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
      removeItem(cartItemId) // Delegate to remove for zero
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

  const handleCheckout = async () => {
    if (cartItems.length === 0) return

    try {
      setIsCheckingOut(true)
      await ApiService.checkout({
        address: "N/A", // TODO: Replace with user input form
        phone: "N/A",
        delivery_fee: 5, // Fixed: Explicit backend default
      })

      toast.success("Your order has been placed successfully")

      setCartItems([])
      window.dispatchEvent(new Event("cartUpdated"))
      router.push("/profile?tab=orders")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to place order")
    } finally {
      setIsCheckingOut(false)
    }
  }

  const totalAmount = cartItems.reduce(
    (sum, item) =>
      sum + Number.parseFloat(item.subtotal || (Number.parseFloat(item.product.price) * item.quantity).toString()),
    0,
  )

  return (
    <Sheet onOpenChange={(open) => open && fetchCart()}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="relative glass p-0 h-12 w-12">
          <CartIcon className="h-6 w-6" />
          {cartCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full text-xs">{cartCount}</Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[425px] sm:w-[540px] glass-card border-white/20">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <CartIcon className="h-5 w-5" />
            Shopping Cart
            <Badge className="ml-auto">{cartItems.length} items</Badge>
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <CartIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-4">Add some products to get started.</p>
              <Button variant="outline" className="glass bg-transparent">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-4 py-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b border-white/10 pb-4 last:border-b-0">
                    <img
                      src={item.product.main_image || "/placeholder.svg"}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium line-clamp-2">{item.product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.product.price)} x {item.quantity}
                      </p>
                      <p className="text-sm font-semibold">Subtotal: {formatCurrency(item.subtotal)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
                        className="h-8 w-8 p-0 ml-auto text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="border-t border-white/20 pt-4 space-y-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(totalAmount)}</span>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={isCheckingOut || cartItems.length === 0}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Checkout - ${formatCurrency(totalAmount)}`
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
