"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ShoppingCart,
  Search,
  Filter,
  CreditCard,
  Calculator,
  Package,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { ApiService, type Product, type Category, type LipaRegistration } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

// Define glassmorphism styles
const glassmorphismStyles = `
  .glass-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
  }
  .glass-card:hover {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
  .dark .glass-card {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }
  .dark .glass-card:hover {
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.25);
  }
  .glass-input {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    transition: all 0.3s ease;
  }
  .glass-input:hover, .glass-input:focus {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  .dark .glass-input {
    background: rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .dark .glass-input:hover, .dark .glass-input:focus {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
`

interface LipaProductBrowserProps {
  registration: LipaRegistration | null
  onProductSelect?: (product: Product) => void
}

export function LipaProductBrowser({ registration, onProductSelect }: LipaProductBrowserProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [productsData, categoriesData] = await Promise.all([
        ApiService.getAllProducts(),
        ApiService.getCategories().catch(() => []),
      ])

      // Filter products that support installments
      const installmentProducts = productsData.filter((product) => product.installment_available !== false)

      setProducts(installmentProducts)
      setCategories(categoriesData)
    } catch (error) {
      console.error("Failed to fetch products:", error)
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (productId: number) => {
    try {
      await ApiService.addToCart({ product_id: productId })
      toast.success("Product added to cart! You can checkout with installment payment.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add to cart")
    }
  }

  const calculateInstallmentDetails = (price: string, months = 3) => {
    const totalAmount = Number.parseFloat(price)
    const depositAmount = totalAmount * 0.4 // 40% deposit
    const remainingAmount = totalAmount - depositAmount
    const monthlyPayment = remainingAmount / months

    return {
      depositAmount,
      monthlyPayment,
      totalAmount,
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category.slug === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price_low":
        return Number.parseFloat(a.price) - Number.parseFloat(b.price)
      case "price_high":
        return Number.parseFloat(b.price) - Number.parseFloat(a.price)
      case "name":
      default:
        return a.name.localeCompare(b.name)
    }
  })

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Lipa Mdogo Mdogo Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const isApproved = registration?.status === "APPROVED"

  return (
    <>
      <style>{glassmorphismStyles}</style>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Lipa Mdogo Mdogo Products
            {isApproved && (
              <Badge className="bg-green-500 text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                Approved
              </Badge>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {isApproved
              ? "Browse products available for installment purchase. Pay only 40% upfront!"
              : "Get approved for Lipa Mdogo Mdogo to access these products with installment payments."}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isApproved && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Registration Required</span>
              </div>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Complete your Lipa Mdogo Mdogo registration above to unlock installment purchasing for these products.
              </p>
            </div>
          )}

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass-input"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 glass-input">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48 glass-input">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products Grid */}
          {sortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No installment products available at the moment"}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedProducts.map((product) => {
                const installmentDetails = calculateInstallmentDetails(product.price)

                return (
                  <div key={product.id} className="group">
                    <Card className="glass-card">
                      <CardContent className="p-4">
                        <div className="relative overflow-hidden rounded-lg bg-muted aspect-square mb-4">
                          <img
                            src={product.main_image || "/placeholder.svg?height=300&width=300&query=product"}
                            alt={product.name}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                          />
                          <Badge className="absolute top-2 right-2 bg-gradient-to-r from-primary to-secondary">
                            Installment Available
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Full Price:</span>
                              <span className="font-bold text-lg text-primary">{formatCurrency(product.price)}</span>
                            </div>

                            {isApproved && (
                              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                  <Calculator className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                    Installment Plan
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Pay Today:</span>
                                    <p className="font-semibold text-primary">
                                      {formatCurrency(installmentDetails.depositAmount)}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Monthly:</span>
                                    <p className="font-semibold">{formatCurrency(installmentDetails.monthlyPayment)}</p>
                                  </div>
                                </div>

                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                  3 months • 40% deposit • 0% interest
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleAddToCart(product.id)}
                              disabled={!isApproved}
                              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              {isApproved ? "Add to Cart" : "Registration Required"}
                            </Button>

                            {onProductSelect && (
                              <Button
                                variant="outline"
                                onClick={() => onProductSelect(product)}
                                className="glass-input bg-transparent border-white/20 hover:bg-white/10"
                              >
                                <CreditCard className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              })}
            </div>
          )}

          {/* Info Section */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg">
            <h3 className="font-semibold mb-3">How Lipa Mdogo Mdogo Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
                <div>
                  <p className="font-medium">Choose Products</p>
                  <p className="text-muted-foreground">Browse and select items for installment purchase</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
                <div>
                  <p className="font-medium">Pay 40% Deposit</p>
                  <p className="text-muted-foreground">Make your initial payment at checkout</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
                <div>
                  <p className="font-medium">Monthly Payments</p>
                  <p className="text-muted-foreground">Complete remaining balance in easy installments</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}