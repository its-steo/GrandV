// components/store/product-card.tsx
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
          Number.parseFloat(current.monthly_payment) < Number.parseFloat(best.monthly_payment) ? current : best
        )
      : null

  const hasCoupon = product.available_coupons && product.available_coupons.length > 0
  const discountedPrice = product.discounted_price && product.discounted_price < product.price ? product.discounted_price : null
  const discountPercentage = discountedPrice
    ? Math.round(((Number(product.price) - Number(discountedPrice)) / Number(product.price)) * 100)
    : 0

  return (
    <Link href={`/store/product/${product.id}`} className="block h-full">
      <Card className="glass-card border-white/20 hover:border-orange-500/50 transition-all duration-300 group cursor-pointer h-full flex flex-col">
        <CardContent className="p-0 flex flex-col h-full">
          {/* Image Section - Responsive Aspect Ratio */}
          <div className="relative overflow-hidden rounded-t-lg aspect-[4/5] sm:aspect-square bg-muted">
            <img
              src={getImageUrl(product.main_image) || "/placeholder.svg"}
              alt={product.name}
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=400&width=400&text=No+Image"
              }}
            />

            {/* Badges */}
            <div className="absolute top-2 left-2 right-2 flex flex-wrap gap-1.5">
              {product.is_featured && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[10px] sm:text-xs px-2 py-0.5">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              {product.supports_installments && (
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] sm:text-xs px-2 py-0.5">
                  <CreditCard className="h-3 w-3 mr-1" />
                  Lipa Mdogo
                </Badge>
              )}
              {hasCoupon && discountPercentage > 0 && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[10px] sm:text-xs px-2 py-0.5">
                  <Percent className="h-3 w-3 mr-1" />
                  {discountPercentage}% Off
                </Badge>
              )}
            </div>

            {/* Quick View Button */}
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button size="sm" variant="secondary" className="glass backdrop-blur-sm shadow-lg">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-3 sm:p-4 flex flex-col flex-grow">
            <div className="space-y-2 flex-grow">
              {/* Category Badge */}
              <Badge variant="outline" className="text-[10px] sm:text-xs border-white/30">
                {product.category.name}
              </Badge>

              {/* Product Name */}
              <h3 className="font-bold text-sm sm:text-base lg:text-lg line-clamp-2 group-hover:text-orange-400 transition-colors line-clamp-2">
                {product.name}
              </h3>

              {/* Short Description */}
              <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">
                {product.description}
              </p>
            </div>

            {/* Price & Installment */}
            <div className="mt-3 sm:mt-4 space-y-2">
              <div className="flex items-end justify-between gap-3">
                <div className="flex-1">
                  {discountedPrice ? (
                    <div>
                      <s className="text-xs sm:text-sm text-gray-500">{formatCurrency(product.price)}</s>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-500">
                        {formatCurrency(discountedPrice)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-500">
                      {formatCurrency(product.price)}
                    </p>
                  )}
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  size="sm"
                  className="min-w-10 h-9 sm:h-10 rounded-lg bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 shadow-lg"
                >
                  {isAddingToCart ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Installment Info */}
              {bestInstallmentPlan && (
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-blue-400">
                  <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>or</span>
                  <span className="font-bold">
                    {formatCurrency(bestInstallmentPlan.monthly_payment)}/mo
                  </span>
                  <span className="text-gray-500">
                    × {bestInstallmentPlan.months} months
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}