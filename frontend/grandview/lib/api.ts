const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// Helper function to get auth headers
function getAuthHeaders(excludeContentType = false) {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
  const headers: Record<string, string> = {}

  if (!excludeContentType) {
    headers["Content-Type"] = "application/json"
  }

  if (token) {
    headers["Authorization"] = `Token ${token}`
  }

  return headers
}

// Interfaces
export interface Product {
  id: number
  name: string
  description: string
  price: string
  main_image: string
  sub_images: { id: number; image: string }[] // Updated for backend sub_images via ProductImage
  category: {
    id: number
    name: string
    slug: string
  }
  is_featured: boolean
  specifications?: string
}

export interface WalletBalance {
  main_balance: string // From serializer: deposit + views_earnings
  referral_balance: string
  deposit_balance?: string // Optional for detailed views
  views_earnings_balance?: string
  transactions?: Transaction[]
}

export interface DashboardStats {
  total_earnings: string
  active_package: string | null
  ads_viewed_today: number
  referrals_count: number
}

export interface Transaction {
  id: number
  transaction_type: string
  amount: string
  description: string
  created_at: string
  status?: string
}

export interface PackageFeature {
  name: string
  basic: boolean
  standard: boolean
  premium: boolean
}

export interface DepositConfig {
  quick_amounts: number[]
  minimum_amount: number
  maximum_amount: number
}

export interface Category {
  id: number
  name: string
  slug: string
  count?: number
}

export interface ReferralStats {
  total_referrals: number
  active_referrals: number
  total_commission: string
  this_month_commission: string
}

export interface Advert {
  id: number
  title: string
  file: string
  rate_category: number
  upload_date: string
  can_submit: boolean
  has_submitted: boolean
}

// Added CartItem interface
export interface CartItem {
  id: number
  product: Product
  quantity: number
  total_price: string
}

export interface UserPackage {
  name: string
  rate_per_view: number
  expiry_date: string
  days_remaining: number
}

export interface SubmissionResponse {
  submission: {
    id: number
    earnings: string
    views_count: number
  }
}

export interface PackageType {
  id: number
  name: string
  image: string
  validity_days: number
  rate_per_view: number
  description: string
  price: string
}

export class ApiService {
  // Auth endpoints (from accounts app)
  static async register(userData: {
    username: string
    email: string
    phone_number: string
    password: string
    password2: string
    referral_code?: string
  }) {
    const response = await fetch(`${API_BASE_URL}/accounts/register/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Registration failed")
    }

    return response.json()
  }

  static async login(credentials: { username: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/accounts/login/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Login failed")
    }

    const data = await response.json()
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", data.token)
    }
    return data
  }

  // Removed duplicate getReferralStats implementation to fix error

  static async updateUserInfo(data: { username?: string; email?: string; phone_number?: string }) {
    const response = await fetch(`${API_BASE_URL}/accounts/users/update/`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update profile")
    }
    return response.json()
  }

  static async changePassword(data: { current_password: string; new_password: string; new_password_confirm: string }) {
    const response = await fetch(`${API_BASE_URL}/accounts/users/change-password/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to change password")
    }
    return response.json()
  }

  // Dashboard endpoints (from dashboard app)
  static async getFeaturedProducts(): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/dashboard/products/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch featured products")
    }

    return response.json()
  }

  static async getProduct(id: number): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/dashboard/products/${id}/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch product")
    }

    return response.json()
  }

  // Cart endpoints
  static async getCart(): Promise<{ items: CartItem[]; total: string }> {
    const response = await fetch(`${API_BASE_URL}/dashboard/cart/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch cart")
    }

    return response.json()
  }

  static async addToCart(data: { product_id: number; quantity?: number }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/dashboard/cart/add/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to add to cart")
    }

    return response.json()
  }

  static async updateCartItem(data: { cart_item_id: number; quantity: number }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/dashboard/cart/update/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to update cart")
    }

    return response.json()
  }

  static async removeFromCart(cartItemId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/dashboard/cart/remove/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ cart_item_id: cartItemId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to remove item")
    }

    return response.json()
  }

  static async checkout(data: { address: string; phone: string; delivery_fee?: number }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/dashboard/checkout/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to checkout")
    }

    return response.json()
  }

  // Real store endpoints for products and categories
  static async getAllProducts(): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/dashboard/products/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch products")
    }

    return response.json()
  }

  static async getCategories(): Promise<Category[]> {
    try {
      // First try to fetch from dedicated categories endpoint
      const response = await fetch(`${API_BASE_URL}/categories/`, {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        return response.json()
      }
    } catch (error) {
      console.log("Categories endpoint not available, extracting from products")
    }

    // Fallback: Extract unique categories from products
    try {
      const products = await this.getAllProducts()
      const categoryMap = new Map<number, Category>()

      products.forEach((product) => {
        if (product.category && !categoryMap.has(product.category.id)) {
          categoryMap.set(product.category.id, {
            id: product.category.id,
            name: product.category.name,
            slug: product.category.slug,
            count: 1,
          })
        } else if (product.category && categoryMap.has(product.category.id)) {
          const existing = categoryMap.get(product.category.id)!
          existing.count = (existing.count || 0) + 1
        }
      })

      return Array.from(categoryMap.values())
    } catch (error) {
      console.error("Failed to fetch categories:", error)
      return []
    }
  }

  static async getReferralStats(): Promise<ReferralStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/users/referral-stats/`, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch referral stats")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching referral stats:", error)
      // Return defaults if API fails
      return {
        total_referrals: 0,
        active_referrals: 0,
        total_commission: "0.00",
        this_month_commission: "0.00",
      }
    }
  }

  static async getDepositConfig(): Promise<DepositConfig> {
    // Backend doesn't have this; return defaults
    return {
      quick_amounts: [100, 500, 1000, 2000, 5000],
      minimum_amount: 50,
      maximum_amount: 100000,
    }
  }

  // Packages endpoints (fixed)
  static async getPackages(): Promise<{ packages: PackageType[]; user_package: UserPackage | null }> {
    const response = await fetch(`${API_BASE_URL}/packages/`, {
      // Fixed: Single /packages/
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch packages")
    }

    const packagesData = await response.json() // Backend returns array directly
    return {
      packages: Array.isArray(packagesData) ? packagesData : [],
      user_package: null, // Overridden by getCurrentUserPackage
    }
  }

  static async getCurrentUserPackage(): Promise<UserPackage | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/packages/purchases/`, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch user purchases")
      }

      const purchases = await response.json()
      const now = new Date().toISOString()
      const activePurchase = purchases.find((p: any) => new Date(p.expiry_date) > new Date(now))

      if (activePurchase) {
        return {
          name: activePurchase.package.name,
          rate_per_view: activePurchase.package.rate_per_view,
          expiry_date: activePurchase.expiry_date,
          days_remaining: activePurchase.days_remaining,
        }
      }
      return null
    } catch (error) {
      console.error("Error fetching current package:", error)
      return null
    }
  }

  static async purchasePackage(packageId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/packages/purchase/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ package: packageId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to purchase package")
    }
  }

  static async getPackageFeatures(): Promise<PackageFeature[]> {
    // Hardcoded fallback (add backend /packages/features/ for dynamic)
    return [
      { name: "Access to advertisements", basic: true, standard: true, premium: true },
      { name: "Instant earnings", basic: true, standard: true, premium: true },
      { name: "24/7 support", basic: true, standard: true, premium: true },
      { name: "Priority ad access", basic: false, standard: true, premium: true },
      { name: "Exclusive high-rate ads", basic: false, standard: false, premium: true },
    ]
  }

  // Wallet endpoints (fixed URL)
  static async getWalletBalance(): Promise<WalletBalance> {
    const response = await fetch(`${API_BASE_URL}/wallet/`, {
      // Fixed: Single /wallet/
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch wallet balance")
    }

    return response.json()
  }

  static async deposit(amount: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/wallet/deposit/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Deposit failed")
    }

    return response.json()
  }

  static async withdrawMain(amount: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/wallet/withdraw/main/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Withdrawal failed")
    }

    return response.json()
  }

  static async withdrawReferral(amount: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/wallet/withdraw/referral/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Withdrawal failed")
    }

    return response.json()
  }

  static async getTransactionHistory(): Promise<Transaction[]> {
    const response = await fetch(`${API_BASE_URL}/wallet/transactions/`, {
      // Assume /wallet/transactions/ endpoint added if needed
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch transactions")
    }

    return response.json()
  }

  // Ads endpoints
  static async getAdverts(): Promise<{ adverts: Advert[]; user_package: UserPackage | null }> {
    const response = await fetch(`${API_BASE_URL}/adverts/`, {
      headers: getAuthHeaders(), // Defaults to false: includes JSON Content-Type
    })

    if (!response.ok) {
      throw new Error("Failed to fetch adverts")
    }

    const responseData = await response.json()
    return {
      adverts: Array.isArray(responseData.adverts) ? responseData.adverts : responseData,
      user_package: responseData.user_package || null,
    }
  }

  static async downloadAdvert(advertId: number): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/adverts/${advertId}/download/`, {
      headers: getAuthHeaders(), // Defaults to false
    })

    if (!response.ok) {
      throw new Error("Failed to download advert file")
    }

    return response.blob()
  }

  static async submitAdvert(advertId: number, viewsCount: number, screenshot: File): Promise<any> {
    const formData = new FormData()
    formData.append("advert_id", advertId.toString())
    formData.append("views_count", viewsCount.toString())
    formData.append("screenshot", screenshot)

    // Added: Debug log FormData contents (keep for testing; remove in prod if noisy)
    console.log("Submitting FormData:")
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value)
    }

    const response = await fetch(`${API_BASE_URL}/adverts/submit/`, {
      method: "POST",
      headers: getAuthHeaders(true), // true: Excludes Content-Type, lets browser set multipart boundary
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text() // Use .text() first to avoid JSON parse issues
      console.error("Submission error response:", errorText) // Log raw error for debugging
      let error
      try {
        error = JSON.parse(errorText)
      } catch {
        error = { error: errorText }
      }
      throw new Error(error.error || "Failed to submit advert")
    }

    return response.json()
  }

  static async getCartCount(): Promise<number> {
    try {
      const cart = await this.getCart()
      return cart.items.reduce((total, item) => total + item.quantity, 0)
    } catch (error) {
      console.error("Failed to fetch cart count:", error)
      return 0
    }
  }

  static logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  }
}
