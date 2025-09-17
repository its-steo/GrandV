const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// Utility function to safely parse JSON responses
async function safeParseJSON(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`Invalid JSON response: ${text}`)
  }
}

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
  sub_images: { id: number; image: string }[]
  category: {
    id: number
    name: string
    slug: string
  }
  is_featured: boolean
  specifications?: string
  installment_available: boolean
  installment_plans: Array<{
    months: number
    monthly_payment: string
    deposit_required: string
    total_amount: string
  }>
}

export interface WalletBalance {
  main_balance: string
  referral_balance: string
  deposit_balance?: string
  views_earnings_balance?: string
  total_balance: string
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
  transaction_type: "deposit" | "withdrawal" | "commission" | "purchase" | "refund" | "installment_payment"
  amount: string
  description: string
  status: "pending" | "completed" | "failed" | "cancelled"
  balance_type: "deposit" | "views_earnings" | "referral" | "main"
  created_at: string
  updated_at: string
  reference_id?: string
  metadata?: {
    order_id?: number
    installment_id?: number
    commission_source?: string
  }
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
  pending_commission: string
  referral_code: string
  referral_link: string
  commission_rate: number
}

export interface Referral {
  id: number
  referred_user: {
    id: number
    username: string
    email: string
    date_joined: string
  }
  commission_earned: string
  status: "pending" | "active" | "inactive"
  created_at: string
  last_activity: string
}

export interface CommissionTransaction {
  id: number
  referral: number
  transaction_type: "signup_bonus" | "purchase_commission" | "activity_bonus"
  amount: string
  description: string
  status: "pending" | "approved" | "paid"
  created_at: string
  metadata?: {
    order_id?: number
    activity_type?: string
  }
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

export interface LipaRegistration {
  id: number
  user: number
  full_name: string
  date_of_birth: string
  address: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  created_at: string
  updated_at?: string
  id_front?: string
  id_back?: string
  passport_photo?: string
}

export interface InstallmentOrder {
  id: number
  order: number
  total_amount: string
  deposit_amount: string
  remaining_amount: string
  monthly_payment: string
  months: number
  status: "active" | "completed" | "defaulted"
  next_payment_date: string
  created_at: string
}

export interface InstallmentPayment {
  id: number
  installment_order: number
  amount: string
  payment_date: string
  status: "pending" | "completed" | "failed"
}

export interface Order {
  id: number
  user: number
  total_amount: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  payment_type: "full" | "installment"
  address: string
  phone: string
  delivery_fee: string
  coupon_code?: string
  created_at: string
  updated_at: string
  items: OrderItem[]
  installment_order?: InstallmentOrder
}

export interface OrderItem {
  id: number
  product: {
    id: number
    name: string
    price: string
    main_image: string
  }
  quantity: number
  price: string
  subtotal: string
}

interface CartResponse {
  success: boolean
  message?: string
  item?: CartItem
}

interface CheckoutResponse {
  success: boolean
  order_id: number
  message?: string
}

interface DepositResponse {
  success: boolean
  transaction_id: string
  amount: string
  message?: string
}

interface WithdrawalResponse {
  success: boolean
  transaction_id: string
  amount: string
  message?: string
}

interface AdvertSubmissionResponse {
  success: boolean
  submission_id: number
  earnings: string
  message?: string
}

interface OrderTrackingResponse {
  order_id: number
  status: string
  tracking_number?: string
  estimated_delivery?: string
  updates: Array<{
    status: string
    timestamp: string
    description: string
  }>
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
      const error = await safeParseJSON(response)
      throw new Error((error as { message?: string }).message || "Registration failed")
    }

    return safeParseJSON(response)
  }

  static async login(credentials: { username: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/accounts/login/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { error?: string }).error || "Login failed")
    }

    const data = await safeParseJSON(response)
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", (data as { token: string }).token)
    }
    return data
  }

  static async updateUserInfo(data: { username?: string; email?: string; phone_number?: string }) {
    const response = await fetch(`${API_BASE_URL}/accounts/users/update/`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { message?: string }).message || "Failed to update profile")
    }
    return safeParseJSON(response)
  }

  static async changePassword(data: { current_password: string; new_password: string; new_password_confirm: string }) {
    const response = await fetch(`${API_BASE_URL}/accounts/users/change-password/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { message?: string }).message || "Failed to change password")
    }
    return safeParseJSON(response)
  }

  // Dashboard endpoints (from dashboard app)
  static async getFeaturedProducts(): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/dashboard/products/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch featured products")
    }

    return safeParseJSON(response) as Promise<Product[]>
  }

  static async getProduct(id: number): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/dashboard/products/${id}/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch product")
    }

    return safeParseJSON(response) as Promise<Product>
  }

  // Cart endpoints
  static async getCart(): Promise<{ items: CartItem[]; total: string }> {
    const response = await fetch(`${API_BASE_URL}/dashboard/cart/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch cart")
    }

    return safeParseJSON(response) as Promise<{ items: CartItem[]; total: string }>
  }

  static async addToCart(data: { product_id: number; quantity?: number }): Promise<CartResponse> {
    const response = await fetch(`${API_BASE_URL}/dashboard/cart/add/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { error?: string }).error || "Failed to add to cart")
    }

    return (await safeParseJSON(response)) as CartResponse
  }

  static async updateCartItem(data: { cart_item_id: number; quantity: number }): Promise<CartResponse> {
    const response = await fetch(`${API_BASE_URL}/dashboard/cart/update/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { error?: string }).error || "Failed to update cart")
    }

    return (await safeParseJSON(response)) as CartResponse
  }

  static async removeFromCart(cartItemId: number): Promise<CartResponse> {
    const response = await fetch(`${API_BASE_URL}/dashboard/cart/remove/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ cart_item_id: cartItemId }),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { error?: string }).error || "Failed to remove item")
    }

    return (await safeParseJSON(response)) as CartResponse
  }

  static async checkout(data: {
    address: string
    phone: string
    delivery_fee?: number
    payment_type: "full" | "installment"
    months?: number
    coupon_code?: string
  }): Promise<CheckoutResponse> {
    const response = await fetch(`${API_BASE_URL}/dashboard/checkout/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { error?: string }).error || "Failed to checkout")
    }

    return (await safeParseJSON(response)) as CheckoutResponse
  }

  // Real store endpoints for products and categories
  static async getAllProducts(): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/dashboard/all-products/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch products")
    }

    return safeParseJSON(response) as Promise<Product[]>
  }

  static async getCategories(): Promise<Category[]> {
    const response = await fetch(`${API_BASE_URL}/dashboard/categories/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch categories")
    }

    return safeParseJSON(response) as Promise<Category[]>
  }

  static async registerForLipa(registrationData: {
    full_name: string
    date_of_birth: string
    address: string
    id_front: File
    id_back: File
    passport_photo: File
  }): Promise<LipaRegistration> {
    const formData = new FormData()
    formData.append("full_name", registrationData.full_name)
    formData.append("date_of_birth", registrationData.date_of_birth)
    formData.append("address", registrationData.address)
    formData.append("id_front", registrationData.id_front)
    formData.append("id_back", registrationData.id_back)
    formData.append("passport_photo", registrationData.passport_photo)

    const response = await fetch(`${API_BASE_URL}/dashboard/lipa/register/`, {
      method: "POST",
      headers: getAuthHeaders(true),
      body: formData,
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error(JSON.stringify(error) || "Registration failed")
    }

    return safeParseJSON(response) as Promise<LipaRegistration>
  }

  static async getLipaRegistration(): Promise<LipaRegistration | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/lipa/registration/`, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.error("Authentication error: Invalid or missing token")
          return null
        }
        if (response.status === 404) {
          return null
        }
        const error = await response.text()
        console.error(`Failed to fetch Lipa registration: ${response.status} ${response.statusText} - ${error}`)
        return null
      }

      const contentType = response.headers.get("Content-Type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error(`Unexpected Content-Type: ${contentType}`)
        return null
      }

      const data = await safeParseJSON(response)

      if (!data || (!(data as LipaRegistration).full_name && !(data as LipaRegistration).status)) {
        return null
      }

      return data as LipaRegistration
    } catch (error) {
      console.error("Network error fetching Lipa registration:", error)
      return null
    }
  }

  static async makeInstallmentPayment(data: {
    installment_order_id: number
    amount: number
  }): Promise<InstallmentPayment> {
    const response = await fetch(`${API_BASE_URL}/dashboard/installment/pay/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { error?: string }).error || "Failed to make installment payment")
    }

    return safeParseJSON(response) as Promise<InstallmentPayment>
  }

  static async validateCoupon(code: string): Promise<{ valid: boolean; discount: number; message?: string }> {
    try {
      // Use the code parameter to validate coupon
      console.log(`Validating coupon: ${code}`)
      return { valid: false, discount: 0, message: "Coupon validation not implemented" }
    } catch (error) {
      console.error("Error validating coupon:", error)
      return { valid: false, discount: 0, message: "Coupon validation failed" }
    }
  }

  static async createOrder(orderData: {
    address: string
    phone: string
    payment_method: "FULL" | "INSTALLMENT"
    coupon_code?: string
    installment_months?: number
  }): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/dashboard/checkout/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { message?: string }).message || "Failed to create order")
    }

    return safeParseJSON(response) as Promise<Order>
  }

  static async getOrders(): Promise<Order[]> {
    const response = await fetch(`${API_BASE_URL}/dashboard/orders/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch orders")
    }

    const data = await safeParseJSON(response)
    return Array.isArray(data) ? data : (data as { results?: Order[] }).results || []
  }

  static async getInstallmentOrders(): Promise<InstallmentOrder[]> {
    const response = await fetch(`${API_BASE_URL}/dashboard/installment/orders/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch installment orders")
    }

    const data = await safeParseJSON(response)
    return Array.isArray(data) ? data : (data as { results?: InstallmentOrder[] }).results || []
  }

  static async cancelOrder(orderId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/dashboard/orders/${orderId}/cancel/`, {
      method: "POST",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { message?: string }).message || "Failed to cancel order")
    }
  }

  static async trackOrder(orderId: number): Promise<OrderTrackingResponse> {
    const response = await fetch(`${API_BASE_URL}/dashboard/orders/${orderId}/track/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch tracking info")
    }

    return (await safeParseJSON(response)) as OrderTrackingResponse
  }

  // Wallet endpoints
  static async getWalletBalance(): Promise<WalletBalance> {
    const response = await fetch(`${API_BASE_URL}/wallet/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch wallet balance")
    }

    return safeParseJSON(response) as Promise<WalletBalance>
  }

  static async deposit(amount: number): Promise<DepositResponse> {
    const response = await fetch(`${API_BASE_URL}/wallet/deposit/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount }),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { message?: string }).message || "Deposit failed")
    }

    return (await safeParseJSON(response)) as DepositResponse
  }

  static async withdrawMain(amount: number): Promise<WithdrawalResponse> {
    const response = await fetch(`${API_BASE_URL}/wallet/withdraw/main/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount }),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { message?: string }).message || "Withdrawal failed")
    }

    return (await safeParseJSON(response)) as WithdrawalResponse
  }

  static async withdrawReferral(amount: number): Promise<WithdrawalResponse> {
    const response = await fetch(`${API_BASE_URL}/wallet/withdraw/referral/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount }),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { message?: string }).message || "Withdrawal failed")
    }

    return (await safeParseJSON(response)) as WithdrawalResponse
  }

  static async getTransactionHistory(): Promise<Transaction[]> {
    const response = await fetch(`${API_BASE_URL}/wallet/transactions/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch transactions")
    }

    return safeParseJSON(response) as Promise<Transaction[]>
  }

  static async getReferralStats(): Promise<ReferralStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/users/referral-stats/`, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch referral stats")
      }

      return safeParseJSON(response) as Promise<ReferralStats>
    } catch (error) {
      console.error("Error fetching referral stats:", error)
      return {
        total_referrals: 0,
        active_referrals: 0,
        total_commission: "0.00",
        this_month_commission: "0.00",
        pending_commission: "0.00",
        referral_code: "",
        referral_link: "",
        commission_rate: 0,
      }
    }
  }

  static async getDepositConfig(): Promise<DepositConfig> {
    return {
      quick_amounts: [100, 500, 1000, 2000, 5000],
      minimum_amount: 50,
      maximum_amount: 100000,
    }
  }

  // Packages endpoints
  static async getPackages(): Promise<{ packages: PackageType[]; user_package: UserPackage | null }> {
    const response = await fetch(`${API_BASE_URL}/packages/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch packages")
    }

    const packagesData = await safeParseJSON(response)
    return {
      packages: Array.isArray(packagesData) ? packagesData : [],
      user_package: null,
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

      const purchases = await safeParseJSON(response)
      const now = new Date().toISOString()

      // Properly type the purchases array
      const purchasesArray = Array.isArray(purchases) ? purchases : []
      const activePurchase = purchasesArray.find((p: unknown) => {
        const purchase = p as {
          expiry_date: string
          package: { name: string; rate_per_view: number }
          days_remaining: number
        }
        return new Date(purchase.expiry_date) > new Date(now)
      })

      if (activePurchase) {
        const purchase = activePurchase as {
          package: { name: string; rate_per_view: number }
          expiry_date: string
          days_remaining: number
        }
        return {
          name: purchase.package.name,
          rate_per_view: purchase.package.rate_per_view,
          expiry_date: purchase.expiry_date,
          days_remaining: purchase.days_remaining,
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
      const error = await safeParseJSON(response)
      throw new Error((error as { message?: string }).message || "Failed to purchase package")
    }
  }

  static async getPackageFeatures(): Promise<PackageFeature[]> {
    return [
      { name: "Access to advertisements", basic: true, standard: true, premium: true },
      { name: "Instant earnings", basic: true, standard: true, premium: true },
      { name: "24/7 support", basic: true, standard: true, premium: true },
      { name: "Priority ad access", basic: false, standard: true, premium: true },
      { name: "Exclusive high-rate ads", basic: false, standard: false, premium: true },
    ]
  }

  // Ads endpoints
  static async getAdverts(): Promise<{ adverts: Advert[]; user_package: UserPackage | null }> {
    const response = await fetch(`${API_BASE_URL}/adverts/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch adverts")
    }

    const responseData = (await safeParseJSON(response)) as {
      adverts?: Advert[]
      user_package?: UserPackage
    }
    return {
      adverts: Array.isArray(responseData.adverts) ? responseData.adverts : (responseData as unknown as Advert[]),
      user_package: responseData.user_package || null,
    }
  }

  static async downloadAdvert(advertId: number): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/adverts/${advertId}/download/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to download advert file")
    }

    return response.blob()
  }

  static async submitAdvert(advertId: number, viewsCount: number, screenshot: File): Promise<AdvertSubmissionResponse> {
    const formData = new FormData()
    formData.append("advert_id", advertId.toString())
    formData.append("views_count", viewsCount.toString())
    formData.append("screenshot", screenshot)

    const response = await fetch(`${API_BASE_URL}/adverts/submit/`, {
      method: "POST",
      headers: getAuthHeaders(true),
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      let error
      try {
        error = JSON.parse(errorText)
      } catch {
        error = { error: errorText }
      }
      throw new Error(error.error || "Failed to submit advert")
    }

    return (await safeParseJSON(response)) as AdvertSubmissionResponse
  }

  static async getCartCount(): Promise<number> {
    try {
      const cart = await this.getCart()
      return cart.items.reduce((total, item) => total + item.quantity, 0)
    } catch (error) {
      console.warn("Cart service unavailable, returning 0 count:", error)
      return 0
    }
  }

  static logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  }

  static async getProducts(params?: {
    page?: number
    limit?: number
    search?: string
    category?: string
  }): Promise<{
    results: Product[]
    count: number
    next: string | null
    previous: string | null
  }> {
    const searchParams = new URLSearchParams()

    if (params?.page) searchParams.append("page", params.page.toString())
    if (params?.limit) searchParams.append("limit", params.limit.toString())
    if (params?.search) searchParams.append("search", params.search)
    if (params?.category) searchParams.append("category", params.category)

    const url = `${API_BASE_URL}/dashboard/all-products/${searchParams.toString() ? "?" + searchParams.toString() : ""}`

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch products")
    }

    const data = await safeParseJSON(response)

    if (Array.isArray(data)) {
      return {
        results: data,
        count: data.length,
        next: null,
        previous: null,
      }
    }

    return data as {
      results: Product[]
      count: number
      next: string | null
      previous: string | null
    }
  }
}
