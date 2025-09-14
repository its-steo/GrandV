"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, ArrowLeft, Star, Truck, Shield, RefreshCw, Loader2 } from "lucide-react"
import { ApiService, type Product } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>("")

  useEffect(() => {
    if (params.id) {
      fetchProduct(Number(params.id))
    }
  }, [params.id])

  const fetchProduct = async (id: number) => {
    try {
      const productData = await ApiService.getProduct(id)
      setProduct(productData)
      setSelectedImage(productData.main_image)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load product details")
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return

    try {
      setIsAddingToCart(true)
      await ApiService.addToCart({ product_id: product.id, quantity: 1 }) // Explicit quantity

      toast.success(`${product.name} has been added to your cart`)

      // Trigger cart count update via window event (caught by store/page.tsx)
      window.dispatchEvent(new Event("cartUpdated"))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add to cart")
    } finally {
      setIsAddingToCart(false)
    }
  }

  useEffect(() => {
    const handleCartUpdate = () => {
      window.dispatchEvent(new Event("cartUpdated"))
    }
    window.addEventListener("cartUpdated", handleCartUpdate)
    return () => window.removeEventListener("cartUpdated", handleCartUpdate)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <Sidebar />
        <div className="ml-0 lg:ml-64 p-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <Sidebar />
        <div className="ml-0 lg:ml-64 p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-muted-foreground">Product not found</h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <Sidebar />
      <div className="ml-0 lg:ml-64 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.back()} className="glass">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Store
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                <img
                  src={selectedImage || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.sub_images && product.sub_images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {[product.main_image, ...product.sub_images.map((img) => img.image)].map((img, index) => (
                    <img
                      key={index}
                      src={img || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      className={`w-20 h-20 object-cover rounded cursor-pointer transition-opacity ${
                        selectedImage === img ? "opacity-100 ring-2 ring-primary" : "opacity-60 hover:opacity-100"
                      }`}
                      onClick={() => setSelectedImage(img)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <Badge variant="outline" className="mb-2">
                  {product.category.name}
                </Badge>
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  <span className="text-sm text-muted-foreground">4.8 (120 reviews)</span>
                </div>
              </div>

              <div className="text-3xl font-bold text-primary">{formatCurrency(product.price)}</div>

              <p className="text-muted-foreground leading-relaxed">{product.description}</p>

              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
                >
                  {isAddingToCart ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-5 w-5 mr-2" />
                  )}
                  Add to Cart
                </Button>
              </div>

              {/* Features */}
              <Card className="glass-card border-white/20">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Truck className="h-6 w-6 text-primary" />
                      <span className="text-sm">Free Shipping</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Shield className="h-6 w-6 text-green-500" />
                      <span className="text-sm">Warranty</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="h-6 w-6 text-blue-500" />
                      <span className="text-sm">30-Day Return</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Specifications */}
              <Card className="glass-card border-white/20">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-4">Specifications</h3>
                  <div className="space-y-2">
                    {product.specifications ? (
                      product.specifications.split("\n").map((spec, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span className="text-sm">{spec}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No specifications available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
