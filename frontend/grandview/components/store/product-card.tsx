"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Eye, Star, Loader2 } from "lucide-react"
import { ApiService, type Product } from "@/lib/api"
import { toast } from "sonner"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

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
      await ApiService.addToCart({ product_id: product.id, quantity: 1 }) // Explicit quantity

      toast.success(`${product.name} has been added to your cart`)

      onAddToCart?.()
      window.dispatchEvent(new Event("cartUpdated")) // Trigger global cart refresh
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add to cart")
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <Link href={`/store/product/${product.id}`}>
      <Card className="glass-card border-white/20 hover:border-primary/30 transition-all duration-300 group cursor-pointer">
        <CardContent className="p-0">
          {/* Product Image */}
          <div className="relative overflow-hidden rounded-t-lg aspect-square bg-muted">
            <img
              src={product.main_image || "/placeholder.svg?height=300&width=300&query=electronics"}
              alt={product.name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
            {product.is_featured && (
              <Badge className="absolute top-2 left-2 bg-gradient-to-r from-primary to-secondary text-white">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}

            {/* Quick View Button */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="secondary" className="glass">
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Product Info */}
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

            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-primary"> {formatCurrency(product.price)}</div>
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90"
                size="sm"
              >
                {isAddingToCart ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
