// Updated components/store/product-card.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Eye, Star, Loader2, Calendar, CreditCard, Percent } from "lucide-react"
import { ApiService, type Product } from "@/lib/api"
import { toast } from "sonner"
import Link from "next/link"
import { formatCurrency, getImageUrl } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  onAddToCart?: () => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      setIsAddingToCart(true)
      await ApiService.addToCart({ product_id: product.id, quantity: 1 })
      toast.success(`${product.name} has been added to your cart`)
      onAddToCart?.()
      window.dispatchEvent(new Event("cartUpdated"))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add to cart")
    } finally {
      setIsAddingToCart(false)
    }
  }

  const bestInstallmentPlan =
    product.supports_installments && product.installment_plans?.length > 0
      ? product.installment_plans.reduce((best, current) =>
          Number.parseFloat(current.monthly_payment) < Number.parseFloat(best.monthly_payment) ? current : best,
        )
      : null

  const hasCoupon = product.available_coupons && product.available_coupons.length > 0
  const discountedPrice = product.discounted_price && product.discounted_price < product.price ? product.discounted_price : null
  const discountPercentage = discountedPrice
    ? Math.round(
        (Number(product.price) - Number(discountedPrice)) / Number(product.price) * 100
      )
    : 0

  return (
    <Link href={`/store/product/${product.id}`}>
      <Card className="glass-card border-white/20 hover:border-primary/30 transition-all duration-300 group cursor-pointer">
        <CardContent className="p-0">
          <div className="relative overflow-hidden rounded-t-lg aspect-square bg-muted">
            <img
              src={getImageUrl(product.main_image) || "/placeholder.svg"}
              alt={product.name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=300&width=300&text=Image Not Found"
              }}
            />
            {product.is_featured && (
              <Badge className="absolute top-2 left-2 bg-gradient-to-r from-primary to-secondary text-white">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            {product.supports_installments && (
              <Badge className="absolute top-2 right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <CreditCard className="h-3 w-3 mr-1" />
                Lipa Mdogo
              </Badge>
            )}
            {hasCoupon && discountPercentage > 0 && (
              <Badge className="absolute bottom-2 left-2 bg-gradient-to-r from-green-500 to-teal-500 text-white">
                <Percent className="h-3 w-3 mr-1" />
                {discountPercentage}% Off
              </Badge>
            )}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="secondary" className="glass">
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <Badge variant="outline" className="text-xs mb-2">
                {product.category.name}
              </Badge>
              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-primary">
                  {discountedPrice ? (
                    <>
                      <s className="text-lg text-muted-foreground mr-2">{formatCurrency(product.price)}</s>
                      {formatCurrency(discountedPrice)}
                    </>
                  ) : (
                    formatCurrency(product.price)
                  )}
                </div>
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90"
                  size="sm"
                >
                  {isAddingToCart ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                </Button>
              </div>
              {bestInstallmentPlan && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3 w-3 text-blue-500" />
                  <span className="text-muted-foreground">or</span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(bestInstallmentPlan.monthly_payment)}/month
                  </span>
                  <span className="text-xs text-muted-foreground">for {bestInstallmentPlan.months} months</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}