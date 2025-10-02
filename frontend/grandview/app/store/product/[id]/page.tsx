// Updated store/product/[id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, ArrowLeft, Star, Truck, Shield, RefreshCw, Loader2, Percent } from "lucide-react"
import { ApiService, type Product } from "@/lib/api"
import { formatCurrency, getImageUrl } from "@/lib/utils"
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
      setSelectedImage(getImageUrl(productData.main_image))
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <Sidebar />
        <div className="ml-0 lg:ml-64 p-2 sm:p-4 md:p-6">
          <div className="flex items-center justify-center h-32 sm:h-48 md:h-64">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <Sidebar />
        <div className="ml-0 lg:ml-64 p-2 sm:p-4 md:p-6">
          <div className="text-center py-8 sm:py-12">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-300">Product not found</h2>
          </div>
        </div>
      </div>
    )
  }

  const hasCoupon = product.available_coupons && product.available_coupons.length > 0
  const discountedPrice = product.discounted_price && product.discounted_price < product.price ? product.discounted_price : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Sidebar />
      <div className="flex flex-col min-h-screen ml-0 lg:ml-64">
        <header className="p-2 sm:p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                Product Details
              </h1>
              <ShoppingCartComponent cartCount={cartCount} onCartUpdate={fetchCartCount} />
            </div>
          </div>
        </header>
        <main className="flex-1 p-2 sm:p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <Button variant="ghost" className="mb-4 sm:mb-6 text-sm sm:text-base text-gray-300 hover:text-white" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Store
            </Button>
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
              <div className="space-y-4">
                <Card className="glass-card border-white/20 overflow-hidden">
                  <img
                    src={selectedImage || "/placeholder.svg?height=600&width=600"}
                    alt={product.name}
                    className="w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=600&width=600&text=Image Not Found"
                    }}
                  />
                </Card>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
                  {[product.main_image, ...(product.sub_images?.map((img) => img.image.file) || [])].map((img, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className={`p-0 h-auto aspect-square ${selectedImage === getImageUrl(img) ? "ring-2 ring-orange-500" : ""}`}
                      onClick={() => setSelectedImage(getImageUrl(img))}
                    >
                      <img
                        src={getImageUrl(img) || "/placeholder.svg?height=100&width=100"}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=100&width=100&text=Thumbnail"
                        }}
                      />
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6 md:space-y-8">
                <div className="space-y-3 sm:space-y-4 md:space-y-6">
                  <Badge variant="outline" className="text-xs sm:text-sm md:text-base border-white/20 text-gray-300">
                    {product.category.name}
                  </Badge>
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">{product.name}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-yellow-500 fill-current" />
                    <span className="text-xs sm:text-sm text-gray-300">4.8 (120 reviews)</span>
                  </div>
                </div>

                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
                  {discountedPrice ? (
                    <>
                      <s className="text-base sm:text-lg md:text-xl text-gray-300 mr-2">
                        {formatCurrency(product.price)}
                      </s>
                      {formatCurrency(discountedPrice)}
                    </>
                  ) : (
                    formatCurrency(product.price)
                  )}
                </div>

                {hasCoupon && (
                  <div className="space-y-2">
                    <Badge className="bg-orange-500 text-white">
                      <Percent className="h-4 w-4 mr-2" />
                      Coupon Available
                    </Badge>
                    <p className="text-sm text-gray-300">Apply coupon at checkout for additional savings</p>
                  </div>
                )}

                <p className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed">
                  {product.description}
                </p>

                <div className="flex gap-3 sm:gap-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className="flex-1 bg-orange-500 text-white hover:bg-orange-600 h-10 sm:h-11 md:h-12 text-xs sm:text-sm md:text-base"
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
                        <Truck className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-400" />
                        <span className="text-xs sm:text-sm">Free Shipping</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 sm:gap-2">
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-400" />
                        <span className="text-xs sm:text-sm">Warranty</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 sm:gap-2">
                        <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-purple-400" />
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
                            <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 sm:mt-2 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-gray-300">{spec}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs sm:text-sm text-gray-300">No specifications available</p>
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