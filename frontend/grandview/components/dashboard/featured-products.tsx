"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Star, Calendar, CreditCard } from "lucide-react"
import { ApiService, type Product } from "@/lib/api"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const data = await ApiService.getFeaturedProducts()
      setProducts(data)
      console.log("[v0] Featured products fetched:", data)
    } catch (error) {
      console.log("[v0] Error fetching products:", error)
      toast.error("Failed to load featured products")
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (productId: number) => {
    try {
      await ApiService.addToCart({ product_id: productId })
      toast.success("Product added to your cart successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add to cart")
    }
  }

  if (loading) {
    return (
      <Card className="glass-card border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Featured Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-48 mb-3"></div>
                <div className="bg-muted rounded h-4 mb-2"></div>
                <div className="bg-muted rounded h-3 w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Featured Products
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => {
            const bestInstallmentPlan =
              product.installment_available && product.installment_plans?.length > 0
                ? product.installment_plans.reduce((best, current) =>
                    Number.parseFloat(current.monthly_payment) < Number.parseFloat(best.monthly_payment)
                      ? current
                      : best
                  )
                : null

            return (
              <div key={product.id} className="group">
                <div className="relative overflow-hidden rounded-lg bg-muted aspect-square mb-3">
                  <img
                    src={product.main_image}
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "https://placehold.co/300x300?text=Image+Not+Found&font=montserrat"
                    }}
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <Badge className="bg-gradient-to-r from-primary to-secondary">Featured</Badge>
                    {product.installment_available && (
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                        <CreditCard className="h-2 w-2 mr-1" />
                        Lipa Mdogo
                      </Badge>
                    )}
                  </div>
                </div>
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{product.description}</p>

                <div className="space-y-1 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">{formatCurrency(product.price)}</span>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90"
                      onClick={() => handleAddToCart(product.id)}
                    >
                      <ShoppingCart className="h-3 w-3" />
                    </Button>
                  </div>

                  {bestInstallmentPlan && (
                    <div className="flex items-center gap-1 text-xs">
                      <Calendar className="h-2 w-2 text-blue-500" />
                      <span className="text-muted-foreground">or</span>
                      <span className="font-medium text-blue-600">
                        {formatCurrency(bestInstallmentPlan.monthly_payment)}/mo
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}