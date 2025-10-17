//const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://grandview-shop.onrender.com/api"
//const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_URL || "http://localhost:8000"
const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_URL || "https://grandview-shop.onrender.com"

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

export interface User {
  id: number
  username: string
  email: string
  phone_number: string
  referral_code: string
  is_manager: boolean
  is_staff: boolean
  is_marketer: boolean
  last_support_view?: string // Add this
  is_verified_agent?: boolean
  is_email_verified: boolean;
}

export interface Product {
  id: number
  name: string
  description: string
  price: string
  main_image: string
  sub_images: { id: number; image: { file: string } }[]
  category: {
    id: number
    name: string
    slug: string
  }
  is_featured: boolean
  specifications?: string
  supports_installments: boolean // Changed from installment_available to match component usage
  installment_available: boolean // Kept for backward compatibility
  installment_plans: Array<{
    months: number
    monthly_payment: string
    deposit_required: string
    total_amount: string
  }>
  available_coupons?: Array<{
    id: number
    code: string
    discount_type: "PERCENT" | "FIXED"
    discount_value: number
  }> // Added to support coupon badge and discount calculations
  discounted_price?: string // Added to support discounted price display
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

export interface Package {
  id: number
  name: string
  image: string // Changed from string | undefined to string
  validity_days: number
  rate_per_view: number
  description: string
  price: string
  features?: string[]
  bonus_amount?: string
}

export interface Purchase {
  id: number
  package: Package
  purchase_date: string
  expiry_date: string
  days_remaining: number
  bonus_amount?: string
  claim_cost?: string
  claimed?: boolean
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

export interface WithdrawalData {
  views_earnings_balance: number
  can_withdraw: boolean
}

export interface CartItem {
  id: number
  product: Product
  quantity: number
  total_price: string
}

export interface WithdrawalResponse {
  success: boolean
  message: string
  new_balance: number
}

export interface UserPackage {
  name: string
  rate_per_view: number
  expiry_date: string
  days_remaining: number
  bonus_amount?: string
  claim_cost?: string
  claimed?: boolean
}

// Add Purchase interface to fix compile error
export interface Purchase {
  id: number
  package: Package
  purchase_date: string
  expiry_date: string
  days_remaining: number
  bonus_amount?: string
  claim_cost?: string
  claimed?: boolean
}

export interface SubmissionResponse {
  submission: {
    id: number
    earnings: string
    views_count: number
  }
}

export interface Submission {
  id: number
  user: number
  advert: number
  advert_title: string
  views_count: number
  screenshot: string // Local URL (e.g., /media/submissions/filename)
  earnings: string
  submission_date: string
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
  remaining_balance?: string
  monthly_payment: string
  months: number
  status: "ACTIVE" | "PAID" | "OVERDUE" // Updated to match backend
  next_payment_date: string
  created_at: string
  installment_status?: string
  due_date?: string
  initial_deposit: string
  payments: { amount: string }[]
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
  rating?: number
  discounted_total?:string
  ordered_at?:string
  
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

interface TrackingInfo {
  tracking_number?: string
  estimated_delivery?: string
  estimated_minutes?: number
  delivery_guy?: {
    name: string
    vehicle_type: string
  }
  history?: Array<{
    description: string
    timestamp: string
  }>
  status?: string
  preparation_steps?: string[]
}

// Add PrivateMessage interface
export interface PrivateMessage {
  id: number
  sender: {
    id: number
    username: string
    email: string
    phone_number?: string
    referral_code?: string
    is_manager?: boolean
    is_staff?: boolean
  }
  receiver: {
    id: number
    username: string
    email: string
    phone_number?: string
    referral_code?: string
  }
  content: string
  image: string | null
  created_at: string
  is_read: boolean
  read_at: string | null
}

// Interfaces
export interface SupportMessage {
  id: number
  content: string
  user: {
    id: number
    username: string
    email: string
    phone_number: string
    referral_code: string
  }
  created_at: string
  image: string | null
  is_private: boolean
  is_pinned: boolean
  is_liked: boolean
  like_count: number
}

export interface SupportComment {
  id: number
  message: number
  user: {
    id: number
    username: string
    email: string
    phone_number: string
    referral_code: string
  }
  content: string
  created_at: string
  parent_comment: number | null
  mentioned_users: Array<{ id: number; username: string }>
}

export interface PresignedUrlResponse {
  upload_url: string
  fields: Record<string, string>
  key: string
}

export interface Activity {
  id: number
  action: string
  action_display: string
  description: string
  timestamp: string
  related_object_detail?: string
}

export interface AgentVerificationPackage {
  id: number
  name: string
  image: string
  validity_days: string
  description: string
  price: string
}

export interface AgentPurchase {
  id: number
  package: AgentVerificationPackage
  purchase_date: string
  expiry_date: string
  status: "ACTIVE" | "EXPIRED"
  days_remaining: number
}

export interface CashbackBonus {
  id: number
  user: number
  amount: string
  claim_cost: string
  claimed: boolean
  claimed_at: string | null
  created_at: string
}

export interface WeeklyBonus {
  id: number
  user: number
  amount: string
  claim_cost: string
  claimed: boolean
  claimed_at: string | null
  created_at: string
  week_start: string
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

    const products = (await safeParseJSON(response)) as Product[]
    return products.map((product) => ({
      ...product,
      main_image: product.main_image
        ? product.main_image.startsWith("http")
          ? product.main_image
          : `${MEDIA_BASE_URL}${product.main_image.startsWith("/") ? "" : "/"}${product.main_image}`
        : "http://placehold.co/300x300?text=No+Image&font=montserrat",
    }))
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

  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/users/dashboard-stats/`, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats")
      }

      return safeParseJSON(response) as Promise<DashboardStats>
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      return {
        total_earnings: "0.00",
        active_package: null,
        ads_viewed_today: 0,
        referrals_count: 0,
      }
    }
  }

  // Cart endpoints
  static async getCart(): Promise<{ items: CartItem[]; total: string }> {
    const response = await fetch(`${API_BASE_URL}/dashboard/cart/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch cart")
    }

    const data = (await safeParseJSON(response)) as { items: CartItem[]; total: string }
    return {
      ...data,
      items: data.items.map((item) => ({
        ...item,
        product: {
          ...item.product,
          main_image: item.product.main_image
            ? item.product.main_image.startsWith("http")
              ? item.product.main_image
              : `${MEDIA_BASE_URL}${item.product.main_image.startsWith("/") ? "" : "/"}${item.product.main_image}`
            : "/diverse-products-still-life.png",
        },
      })),
    }
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
  }): Promise<void> {
    // Transform frontend payload to match backend expectations
    const backendData = {
      address: data.address,
      phone: data.phone,
      delivery_fee: data.delivery_fee,
      payment_method: data.payment_type === "full" ? "FULL" : "INSTALLMENT", // Map payment_type to payment_method
      installment_months: data.months, // Map months to installment_months
      coupon_code: data.coupon_code,
    }

    const response = await fetch(`${API_BASE_URL}/dashboard/checkout/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(backendData), // Use transformed data
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { error?: string }).error || "Failed to checkout")
    }
  }

  // Real store endpoints for products and categories
  static async getAllProducts(): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/dashboard/all-products/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch products")
    }

    const products = (await safeParseJSON(response)) as Product[]
    return products.map((product) => ({
      ...product,
      main_image: product.main_image
        ? product.main_image.startsWith("http")
          ? product.main_image
          : `${MEDIA_BASE_URL}${product.main_image.startsWith("/") ? "" : "/"}${product.main_image}`
        : "/diverse-products-still-life.png",
    }))
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

  // Add this static method in the class (assuming ApiService is a class with static methods)
  static async validateCoupon(
    couponCode: string,
  ): Promise<{ code: string; discount_type: string; discount_value: number }> {
    const response = await fetch(`${API_BASE_URL}/dashboard/coupon/validate/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ coupon_code: couponCode }),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { error?: string }).error || "Invalid coupon code")
    }

    return (await safeParseJSON(response)) as { code: string; discount_type: string; discount_value: number }
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

    const orders = (await safeParseJSON(response)) as Order[]
    console.log(
      "Raw order item main_image values:",
      orders.map((order) => order.items.map((item) => item.product.main_image)),
    ) // Debug log
    const transformedOrders = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        product: {
          ...item.product,
          main_image: item.product.main_image
            ? item.product.main_image.startsWith("http")
              ? item.product.main_image
              : `${MEDIA_BASE_URL}${item.product.main_image.startsWith("/") ? "" : "/"}${item.product.main_image}`
            : "/diverse-products-still-life.png",
        },
      })),
    }))
    console.log(
      "Transformed order item main_image values:",
      transformedOrders.map((order) => order.items.map((item) => item.product.main_image)),
    ) // Debug log
    return transformedOrders
  }

  static async getInstallmentOrders(): Promise<InstallmentOrder[]> {
    const response = await fetch(`${API_BASE_URL}/dashboard/installment/orders/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch installment orders")
    }

    const data = (await safeParseJSON(response)) as InstallmentOrder[]
    // Normalize fields
    return data.map((order) => ({
      ...order,
      remaining_amount: order.remaining_amount || order.remaining_balance || "0",
      next_payment_date: order.next_payment_date || order.due_date || "",
      status: order.status || order.installment_status || "ACTIVE",
    }))
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

  static async trackOrder(orderId: number): Promise<TrackingInfo> {
    const response = await fetch(`${API_BASE_URL}/dashboard/orders/${orderId}/track/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch tracking info")
    }

    return safeParseJSON(response) as Promise<TrackingInfo>
  }

  static async getRecentActivities(page = 1, pageSize = 20): Promise<{ results: Activity[]; count: number }> {
    const response = await fetch(`${API_BASE_URL}/dashboard/recent-activity/?page=${page}&page_size=${pageSize}`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { message?: string }).message || "Failed to fetch recent activities")
    }

    return safeParseJSON(response) as Promise<{ results: Activity[]; count: number }>
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

  static async deposit(payload: {
    amount: number
    deposit_method: "stk" | "manual"
    phone_number?: string
    mpesa_code?: string
  }): Promise<{ message: string; checkout_id?: string; deposit_id?: number }> {
    const response = await fetch(`${API_BASE_URL}/wallet/deposit/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      if (typeof error === "object" && error !== null) {
        const errObj = error as { message?: string; detail?: string; non_field_errors?: string[] }
        throw new Error(errObj.message || errObj.detail || errObj.non_field_errors?.[0] || "Failed to process deposit")
      }
      throw new Error("Failed to process deposit")
    }

    return safeParseJSON(response) as Promise<{ message: string; checkout_id?: string; deposit_id?: number }>
  }

  static async withdrawMain(payload: { amount: number; mpesa_number: string }): Promise<{
    message: string
    request_id: number
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/wallet/withdraw/main/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await safeParseJSON(response)
        const errObj = error as { message?: string; detail?: string; non_field_errors?: string[] }
        throw new Error(
          errObj.message || errObj.detail || errObj.non_field_errors?.[0] || "Failed to process withdrawal",
        )
      }

      return safeParseJSON(response) as Promise<{ message: string; request_id: number }>
    } catch (error) {
      throw error
    }
  }

  static async withdrawReferral(payload: { amount: number; mpesa_number: string }): Promise<{
    message: string
    request_id: number
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/wallet/withdraw/referral/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await safeParseJSON(response)
        const errObj = error as { message?: string; detail?: string; non_field_errors?: string[] }
        throw new Error(
          errObj.message || errObj.detail || errObj.non_field_errors?.[0] || "Failed to process withdrawal",
        )
      }

      return safeParseJSON(response) as Promise<{ message: string; request_id: number }>
    } catch (error) {
      throw error
    }
  }

  static async getTransactionHistory(): Promise<Transaction[]> {
    const response = await fetch(`${API_BASE_URL}/wallet/transactions/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch transaction history")
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

  // Removed duplicate getCurrentUserPackage implementation to fix compile error.

  static async purchasePackage(packageId: number): Promise<{
    message: string
    purchase_id: number
    bonus_amount: string
    is_upgrade: boolean
    is_premium_upgrade: boolean
    previous_rate: number
  }> {
    return this.post("/packages/purchase/", { package: packageId })
  }

  static async getUserPurchases(): Promise<Purchase[]> {
    return this.get<Purchase[]>("/packages/purchases/")
  }

  static async getCurrentUserPackage(): Promise<UserPackage | null> {
    const purchases = await this.getUserPurchases()
    const active = purchases.find((p) => p.days_remaining > 0)
    if (!active) return null
    return {
      name: active.package.name,
      rate_per_view: active.package.rate_per_view,
      expiry_date: active.expiry_date,
      days_remaining: active.days_remaining,
      bonus_amount: active.bonus_amount,
      claim_cost: active.claim_cost,
      claimed: active.claimed,
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

  static async claimCashback(): Promise<{ message: string }> {
    return this.post<{ message: string }>("/packages/cashback/claim/", {})
  }

  // Ads endpoints
  static async getAdverts(): Promise<{ adverts: Advert[]; user_package: UserPackage | null }> {
    const response = await fetch(`${API_BASE_URL}/adverts/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { message?: string }).message || "Failed to fetch adverts")
    }

    return safeParseJSON(response) as Promise<{ adverts: Advert[]; user_package: UserPackage | null }>
  }

  static async downloadAdvert(advertId: number): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/adverts/${advertId}/download/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { message?: string }).message || "Failed to download advert")
    }

    return response.blob()
  }

  static async submitAdvert(advertId: number, viewsCount: number, screenshot: File): Promise<Submission> {
    const formData = new FormData()
    formData.append("advert_id", advertId.toString())
    formData.append("views_count", viewsCount.toString())
    formData.append("screenshot", screenshot)

    const response = await fetch(`${API_BASE_URL}/adverts/submit/`, {
      method: "POST",
      headers: getAuthHeaders(true), // Exclude Content-Type for FormData
      body: formData,
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error(JSON.stringify(error) || "Failed to submit advert")
    }

    return safeParseJSON(response) as Promise<Submission>
  }

  static async getSubmissions(): Promise<{ submissions: Submission[]; total_earnings: number }> {
    const response = await fetch(`${API_BASE_URL}/submissions/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { message?: string }).message || "Failed to fetch submission history")
    }

    return safeParseJSON(response) as Promise<{ submissions: Submission[]; total_earnings: number }>
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

  static async getWithdrawalData(): Promise<WithdrawalData> {
    const response = await fetch(`${API_BASE_URL}/withdraw/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { message?: string }).message || "Failed to fetch withdrawal data")
    }

    return safeParseJSON(response) as Promise<WithdrawalData>
  }

  static async postWithdrawal(amount: number): Promise<WithdrawalResponse> {
    const response = await fetch(`${API_BASE_URL}/withdraw/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount }),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { message?: string }).message || "Failed to process withdrawal")
    }

    return safeParseJSON(response) as Promise<WithdrawalResponse>
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

  // Support Messages endpoints
  static async getSupportMessages(params?: {
    search?: string
    page?: number
    category?: string
    priority?: string
    user_id?: number
  }): Promise<{
    results: SupportMessage[]
    count: number
    next: string | null
    previous: string | null
  }> {
    const queryParams = new URLSearchParams()
    if (params?.search) queryParams.append("search", params.search)
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.category && params.category !== "all") queryParams.append("category", params.category)
    if (params?.priority && params.priority !== "all") queryParams.append("priority", params.priority)
    if (params?.user_id) queryParams.append("user_id", params.user_id.toString())

    const response = await fetch(`${API_BASE_URL}/support/messages/?${queryParams}`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { message?: string }).message || "Failed to fetch support messages")
    }

    const data = (await safeParseJSON(response)) as {
      results?: SupportMessage[]
      count?: number
      next?: string | null
      previous?: string | null
    }
    return {
      results: Array.isArray(data) ? data : data.results || [],
      count: Array.isArray(data) ? data.length : data.count || 0,
      next: data.next || null,
      previous: data.previous || null,
    }
  }

  static async createSupportMessage(data: {
    content: string
    image?: string
    is_private?: boolean
  }): Promise<SupportMessage> {
    const url = data.is_private ? `${API_BASE_URL}/support/messages/private/` : `${API_BASE_URL}/support/messages/`
    const formData = new FormData()
    formData.append("content", data.content)
    if (data.image) {
      formData.append("image", data.image)
    }
    if (data.is_private) {
      formData.append("is_private", "true")
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: getAuthHeaders().Authorization,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { message?: string }).message || "Failed to create support message")
    }

    return safeParseJSON(response) as Promise<SupportMessage>
  }

  static async getPresignedUrl(data: {
    doc_type: string
    extension: string
    content_type: string
  }): Promise<PresignedUrlResponse> {
    const response = await fetch(`${API_BASE_URL}/support/upload/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { message?: string }).message || "Failed to get presigned URL")
    }

    return safeParseJSON(response) as Promise<PresignedUrlResponse>
  }

  static async likeSupportMessage(messageId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/support/messages/${messageId}/like/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ message: messageId }),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { message?: string }).message || "Failed to like message")
    }

    return safeParseJSON(response) as Promise<{ message: string }>
  }

  static async getSupportMessageComments(
    messageId: number,
    page?: number,
  ): Promise<{
    results: SupportComment[]
    count: number
    next: string | null
    previous: string | null
  }> {
    const queryParams = new URLSearchParams()
    if (page) queryParams.append("page", page.toString())

    const response = await fetch(`${API_BASE_URL}/support/messages/${messageId}/comment/?${queryParams}`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { message?: string }).message || "Failed to fetch comments")
    }

    const data = (await safeParseJSON(response)) as {
      results?: SupportComment[]
      count?: number
      next?: string | null
      previous?: string | null
    }
    return {
      results: Array.isArray(data) ? data : data.results || [],
      count: Array.isArray(data) ? data.length : data.count || 0,
      next: data.next || null,
      previous: data.previous || null,
    }
  }

  static async createSupportComment(
    messageId: number,
    data: { content: string; parent_comment?: number },
  ): Promise<SupportComment> {
    if (!data.content.trim()) {
      throw new Error("Comment content cannot be empty")
    }
    const response = await fetch(`${API_BASE_URL}/support/messages/${messageId}/comment/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        content: data.content,
        ...(data.parent_comment ? { parent_comment: data.parent_comment } : {}),
      }),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { message?: string }).message || "Failed to create comment")
    }

    return safeParseJSON(response) as Promise<SupportComment>
  }

  static async getUsersForTagging(query: string): Promise<Array<{ id: number; username: string }>> {
    const response = await fetch(`${API_BASE_URL}/support/users/?search=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { message?: string }).message || "Failed to fetch users")
    }

    return safeParseJSON(response) as Promise<Array<{ id: number; username: string }>>
  }

  static async muteSupportUser(userId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/support/users/${userId}/mute/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ user: userId }),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { message?: string }).message || "Failed to mute user")
    }
  }

  static async blockSupportUser(userId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/support/users/${userId}/block/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ user: userId }),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { message?: string }).message || "Failed to block user")
    }
  }
  static async getAdmins() {
    return this.get("/support/admins/")
  }

  // Generic GET method for internal use
  static async get<T = unknown>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { message?: string }).message || `Failed to fetch ${endpoint}`)
    }

    return safeParseJSON(response) as Promise<T>
  }

  static async getPrivateConversations() {
    return this.get("/support/private-messages/")
  }

  static async getPrivateMessages(receiverId: number, page = 1) {
    return this.get(`/support/private-messages/${receiverId}/?page=${page}`)
  }

  static async sendPrivateMessage(data: { receiver: number; content: string; image?: File }) {
    const url = `${API_BASE_URL}/support/private-messages/`
    const formData = new FormData()
    formData.append("receiver", data.receiver.toString())
    formData.append("content", data.content)
    if (data.image) {
      formData.append("image", data.image)
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: getAuthHeaders(true).Authorization, // Exclude Content-Type for FormData
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { message?: string }).message || "Failed to send private message")
    }

    return safeParseJSON(response) as Promise<PrivateMessage>
  }

  // Generic POST method for internal use
  static async post<T = unknown>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { message?: string }).message || `Failed to post to ${endpoint}`)
    }

    return safeParseJSON(response) as Promise<T>
  }
  static async confirmDelivery(orderId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/dashboard/orders/${orderId}/confirm-delivery/`, {
      method: "POST",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { message?: string }).message || "Failed to confirm delivery")
    }
  }

  static async submitRating(orderId: number, rating: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/dashboard/orders/${orderId}/rate/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ rating }),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { message?: string }).message || "Failed to submit rating")
    }
  }

  static async getAgentPackages(): Promise<AgentVerificationPackage[]> {
    const response = await fetch(`${API_BASE_URL}/premium/packages/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch agent packages")
    }

    const packages = (await safeParseJSON(response)) as AgentVerificationPackage[]
    return packages.map((pkg) => ({
      ...pkg,
      image: pkg.image
        ? pkg.image.startsWith("http")
          ? pkg.image
          : `${MEDIA_BASE_URL}${pkg.image.startsWith("/") ? "" : "/"}${pkg.image}`
        : "/premium-package.png",
    }))
  }

  static async purchaseAgentPackage(packageId: number): Promise<{
    message: string
    purchase_id: number
  }> {
    console.log("[v0] Attempting to purchase agent package:", packageId)
    console.log("[v0] Request payload:", { package: packageId })

    const response = await fetch(`${API_BASE_URL}/premium/purchase/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ package: packageId }),
    })

    console.log("[v0] Response status:", response.status)
    console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Error response body:", errorText)

      try {
        const error = JSON.parse(errorText)
        throw new Error((error as { error?: string }).error || "Failed to purchase package")
      } catch (parseError) {
        throw new Error(`Server error (${response.status}): ${errorText}`)
      }
    }

    const result = await safeParseJSON(response)
    console.log("[v0] Purchase successful:", result)
    return result as { message: string; purchase_id: number }
  }

  static async getUserAgentPurchases(): Promise<AgentPurchase[]> {
    const response = await fetch(`${API_BASE_URL}/premium/purchases/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch agent purchases")
    }

    return safeParseJSON(response) as Promise<AgentPurchase[]>
  }

  static async getUserCashbackBonuses(): Promise<CashbackBonus[]> {
    const response = await fetch(`${API_BASE_URL}/premium/cashback/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch cashback bonuses")
    }

    return safeParseJSON(response) as Promise<CashbackBonus[]>
  }

  static async getUserWeeklyBonuses(): Promise<WeeklyBonus[]> {
    const response = await fetch(`${API_BASE_URL}/premium/weekly-bonus/`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch weekly bonuses")
    }

    return safeParseJSON(response) as Promise<WeeklyBonus[]>
  }

  static async claimCashbackBonus(bonusId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/premium/cashback/claim/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ bonus_id: bonusId }),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { error?: string }).error || "Failed to claim cashback bonus")
    }

    return safeParseJSON(response) as Promise<{ message: string }>
  }

  static async claimWeeklyBonus(bonusId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/premium/weekly-bonus/claim/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ bonus_id: bonusId }),
    })

    if (!response.ok) {
      const error = await safeParseJSON(response)
      throw new Error((error as { error?: string }).error || "Failed to claim weekly bonus")
    }

    return safeParseJSON(response) as Promise<{ message: string }>
  }
}
export default ApiService
