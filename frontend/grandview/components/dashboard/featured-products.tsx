"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Star, Calendar, Heart, Eye, ArrowRight} from "lucide-react"
import { ApiService, type Product } from "@/lib/api"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import { motion, useReducedMotion, Variants } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const data = await ApiService.getFeaturedProducts()
      setProducts(data)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Failed to load featured products")
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (productId: number) => {
    try {
      await ApiService.addToCart({ product_id: productId })
      toast.success("Added to cart successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add to cart")
    }
  }

  const toggleFavorite = (productId: number) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId)
        toast.success("Removed from favorites")
      } else {
        newFavorites.add(productId)
        toast.success("Added to favorites")
      }
      return newFavorites
    })
  }

  const cardVariants: Variants = {
    initial: { opacity: 0, y: 20, scale: 1 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { duration: shouldReduceMotion ? 0 : 0.3, ease: "easeOut" } 
    },
    hover: {
      y: -8,
      scale: 1.03,
      boxShadow: "0 12px 24px rgba(0, 0, 0, 0.15)",
      transition: { duration: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" },
    },
    tap: {
      y: -4,
      scale: 1.02,
      boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
      transition: { duration: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" },
    },
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 w-full text-white">
        <CardContent className="p-2 sm:p-3 md:p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="flex items-center gap-2 text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white">
              <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg gradient-orange-yellow flex items-center justify-center">
                <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-white" />
              </div>
              Featured Products
            </h2>
            <Link href="/store">
              <Button size="sm" className="bg-orange-500 text-white hover:bg-orange-600 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs">
                View All <ArrowRight className="h-2 w-2 sm:h-3 sm:w-3 md:h-4 md:w-4 ml-1 sm:ml-2" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-3 sm:gap-4 md:gap-6 lg:gap-8 grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-700 rounded-xl h-24 sm:h-28 md:h-32 lg:h-36 w-full mb-2"></div>
                <div className="bg-gray-700 rounded h-3 sm:h-3.5 md:h-4 mb-1 sm:mb-2 w-full"></div>
                <div className="bg-gray-700 rounded h-2 sm:h-2.5 md:h-3 w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 w-full relative overflow-hidden text-white">
      <CardContent className="p-2 sm:p-3 md:p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="flex items-center gap-2 text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white">
            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg gradient-orange-yellow flex items-center justify-center">
              <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-white" />
            </div>
            Featured Products
          </h2>
          <Link href="/store">
            <Button size="sm" className="bg-orange-500 text-white hover:bg-orange-600 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs">
              View All <ArrowRight className="h-2 w-2 sm:h-3 sm:w-3 md:h-4 md:w-4 ml-1 sm:ml-2" />
            </Button>
          </Link>
        </div>
        <div className="grid gap-3 sm:gap-4 md:gap-6 lg:gap-8 grid-cols-2">
          {products.map((product, index) => {
            const isFavorite = favorites.has(product.id)
            const bestInstallmentPlan =
              product.supports_installments && product.installment_plans?.length > 0
                ? product.installment_plans.reduce((best, current) =>
                    Number.parseFloat(current.monthly_payment) < Number.parseFloat(best.monthly_payment) ? current : best
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
              <motion.div
                key={product.id}
                variants={cardVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                whileTap="tap"
                transition={{ delay: index * 0.1 }}
                className="min-w-0"
              >
                <Card className="glass-card border-white/20 h-full flex flex-col overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden min-h-[120px] sm:min-h-[140px] md:min-h-[160px] lg:min-h-[180px] max-h-[280px]">
                    <img
                      src={product.main_image || "/placeholder.svg?height=300&width=400"}
                      alt={product.name}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=300&width=400&text=Image Not Found"
                      }}
                    />
                    {product.is_featured && (
                      <Badge className="absolute top-2 left-2 bg-orange-500 text-white text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs px-1 sm:px-1.5 md:px-2">
                        <Star className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {hasCoupon && discountPercentage > 0 && (
                      <Badge className="absolute top-2 right-2 bg-blue-500 text-white text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs px-1 sm:px-1.5 md:px-2">
                        {discountPercentage}% Off
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/30 text-white h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"
                    >
                      <Eye className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 lg:h-4 lg:w-4" />
                    </Button>
                  </div>
                  <CardContent className="p-2 sm:p-3 md:p-4 lg:p-4 flex flex-col flex-1 space-y-2 sm:space-y-3 md:space-y-4">
                    <div className="space-y-1 sm:space-y-2 flex-1">
                      <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-gray-300 line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white">
                          {discountedPrice ? (
                            <>
                              <s className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-gray-300 mr-1 sm:mr-2">
                                {formatCurrency(product.price)}
                              </s>
                              {formatCurrency(discountedPrice)}
                            </>
                          ) : (
                            formatCurrency(product.price)
                          )}
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-gray-300">
                          <Star className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 lg:h-4 lg:w-4 fill-current text-yellow-500" />
                          <span>4.8</span>
                        </div>
                      </div>

                      {bestInstallmentPlan && (
                        <div className="flex items-center gap-1 sm:gap-2 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs p-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <Calendar className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 lg:h-4 lg:w-4 text-blue-400" />
                          <span className="text-gray-300">Available in</span>
                          <span className="font-semibold text-blue-400">
                            {bestInstallmentPlan.months} monthly payments
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-orange-500 text-white hover:bg-orange-600 h-6 sm:h-7 md:h-8 lg:h-9 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs"
                          onClick={() => handleAddToCart(product.id)}
                        >
                          <ShoppingCart className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 lg:h-4 lg:w-4 mr-1 sm:mr-2" />
                          Add to Cart
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleFavorite(product.id)}
                          className={cn(
                            "glass-card border-white/20 text-white hover:bg-white/10 h-6 sm:h-7 md:h-8 lg:h-9 p-1 sm:p-1.5 md:p-2",
                            isFavorite ? "border-red-400 text-red-300 bg-red-500/10" : ""
                          )}
                        >
                          <Heart className={`h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 lg:h-4 lg:w-4 ${isFavorite ? "fill-current" : ""}`} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: shouldReduceMotion ? 0 : 0.3 }}
          className="mt-4 sm:mt-6 md:mt-8 text-center p-2 sm:p-3 md:p-4 lg:p-6 rounded-xl bg-slate-800 border border-white/20"
        >
          <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white mb-2">Discover More Products</h3>
          <p className="text-gray-300 mb-3 sm:mb-4 text-[9px] sm:text-[10px] md:text-xs lg:text-sm">
            Explore our full catalog of premium products with exclusive deals.
          </p>
          <Button className="bg-orange-500 text-white hover:bg-orange-600 px-3 sm:px-4 md:px-6 py-1 sm:py-1.5 md:py-2 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs">
            Browse All Products
            <ArrowRight className="h-2 w-2 sm:h-3 sm:w-3 md:h-4 md:w-4 ml-1 sm:ml-2" />
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  )
}