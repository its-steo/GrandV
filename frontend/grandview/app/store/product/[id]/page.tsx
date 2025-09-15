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
import ShoppingCartComponent from "@/components/store/shopping-cart"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>("")
  const [cartCount, setCartCount] = useState(0)

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

  const fetchCartCount = async () => {
    try {
      const cartData = await ApiService.getCart()
      setCartCount(cartData.items?.length || 0)
    } catch (error) {
      console.error("Failed to fetch cart count:", error)
      setCartCount(0)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return

    try {
      setIsAddingToCart(true)
      await ApiService.addToCart({ product_id: product.id, quantity: 1 })
      toast.success(`${product.name} has been added to your cart`)
      window.dispatchEvent(new Event("cartUpdated"))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add to cart")
    } finally {
      setIsAddingToCart(false)
    }
  }

  useEffect(() => {
    fetchCartCount()
    const handleCartUpdate = () => {
      fetchCartCount()
    }
    window.addEventListener("cartUpdated", handleCartUpdate)
    return () => window.removeEventListener("cartUpdated", handleCartUpdate)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <Sidebar />
        <div className="ml-0 lg:ml-64 p-2 sm:p-4 md:p-6">
          <div className="flex items-center justify-center h-32 sm:h-48 md:h-64">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <Sidebar />
        <div className="ml-0 lg:ml-64 p-2 sm:p-4 md:p-6">
          <div className="text-center py-8 sm:py-12">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-muted-foreground">Product not found</h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <Sidebar />
      <div className="flex flex-col min-h-screen ml-0 lg:ml-64">
        <header className="p-2 sm:p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Store
              </h1>
              <ShoppingCartComponent cartCount={cartCount} onCartUpdate={fetchCartCount} />
            </div>
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="glass p-2 sm:p-3 md:px-4 md:py-2 mb-4 sm:mb-6"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-0 sm:mr-2" />
              <span className="hidden sm:inline text-sm sm:text-base">Back to Store</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 p-2 sm:p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              <div className="space-y-3 sm:space-y-4">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <img
                    src={selectedImage || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {product.sub_images && product.sub_images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {[product.main_image, ...product.sub_images.map((img) => img.image)].map((img, index) => (
                      <img
                        key={index}
                        src={img || "/placeholder.svg"}
                        alt={`${product.name} ${index + 1}`}
                        className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-cover rounded cursor-pointer transition-opacity flex-shrink-0 ${
                          selectedImage === img ? "opacity-100 ring-2 ring-primary" : "opacity-60 hover:opacity-100"
                        }`}
                        onClick={() => setSelectedImage(img)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                <div>
                  <Badge variant="outline" className="mb-2 text-xs sm:text-sm">
                    {product.category.name}
                  </Badge>
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">{product.name}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-yellow-500 fill-current" />
                    <span className="text-xs sm:text-sm text-muted-foreground">4.8 (120 reviews)</span>
                  </div>
                </div>

                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary">{formatCurrency(product.price)}</div>

                <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">{product.description}</p>

                <div className="flex gap-3 sm:gap-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white h-10 sm:h-11 md:h-12 text-xs sm:text-sm md:text-base"
                  >
                    {isAddingToCart ? (
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                    ) : (
                      <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-2" />
                    )}
                    <span>Add to Cart</span>
                  </Button>
                </div>

                <Card className="glass-card border-white/20">
                  <CardContent className="p-3 sm:p-4">
                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                      <div className="flex flex-col items-center gap-1 sm:gap-2">
                        <Truck className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
                        <span className="text-xs sm:text-sm">Free Shipping</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 sm:gap-2">
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-500" />
                        <span className="text-xs sm:text-sm">Warranty</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 sm:gap-2">
                        <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-500" />
                        <span className="text-xs sm:text-sm">30-Day Return</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-white/20">
                  <CardContent className="p-3 sm:p-4">
                    <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4">Specifications</h3>
                    <div className="space-y-2">
                      {product.specifications ? (
                        product.specifications.split("\n").map((spec, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 sm:mt-2 flex-shrink-0" />
                            <span className="text-xs sm:text-sm">{spec}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs sm:text-sm text-muted-foreground">No specifications available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}