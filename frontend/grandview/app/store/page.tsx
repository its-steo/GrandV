"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { ProductCard } from "@/components/store/product-card" // Ensure this path matches exactly (case-sensitive)
import { CategoryFilter } from "@/components/store/category-filter"
import ShoppingCart from "@/components/store/shopping-cart"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ApiService, type Product } from "@/lib/api"
import { toast } from "sonner" // Changed: Use sonner directly for global toast
import { Search, Filter, Grid, List, Loader2, ShoppingBag } from "lucide-react"

interface Category {
  id: number
  name: string
  count?: number
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [cartCount, setCartCount] = useState(0)
  // Removed: const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchCartCount()
  }, []) // Empty deps: runs once on mount

  const fetchProducts = async () => {
    try {
      const productsData = await ApiService.getAllProducts()
      setProducts(productsData)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load products",
        // Removed: variant: "destructive" and className (handled globally)
      )
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const categoriesData = await ApiService.getCategories()
      setCategories(categoriesData)
    } catch (error) {
      console.error("Failed to load categories:", error)
      // Keep empty categories if API fails
    }
  }

  const fetchCartCount = async () => {
    try {
      const cartData = await ApiService.getCart()
      setCartCount(cartData.items?.length || 0) // Fixed: Use items.length
    } catch (error) {
      console.error("Failed to fetch cart count:", error)
      setCartCount(0)
      if (error instanceof Error && error.message.includes("401")) {
        toast.error("Please log in again to view your cart")
      }
    }
  }

  const handleCartUpdate = () => {
    fetchCartCount() // Refetch count after add/remove
  }

  const filteredProducts = products.filter((product) => {
    const matchesCategory = !selectedCategory || product.category.id === selectedCategory
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <Sidebar />
      <div className="ml-0 lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Store
              </h1>
              <ShoppingCart cartCount={cartCount} onCartUpdate={handleCartUpdate} />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-gradient-to-r from-primary to-secondary" : "glass"}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-gradient-to-r from-primary to-secondary" : "glass"}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="glass-card border-white/20 mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 glass border-white/20"
                  />
                </div>

                <Button variant="outline" className="glass border-white/20 bg-transparent">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Filters */}
            <div className="lg:col-span-1">
              <Card className="glass-card border-white/20">
                <CardContent className="p-4">
                  <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {filteredProducts.length === 0 ? (
                <Card className="glass-card border-white/20 text-center py-12">
                  <CardContent>
                    <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery ? "Try adjusting your search terms" : "No products available in this category"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onAddToCart={handleCartUpdate} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
