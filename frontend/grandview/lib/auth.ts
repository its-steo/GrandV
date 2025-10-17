//const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://grandview-shop.onrender.com/api"

export interface User {
  id: number
  username: string
  email: string
  phone_number: string
  referral_code: string
  is_marketer: boolean
  is_verified_agent?: boolean
  is_email_verified: boolean
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginData {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  phone_number: string
  referral_code?: string
}

export function getReferralCodeFromUrl(): string | null {
  if (typeof window === "undefined") return null

  const urlParams = new URLSearchParams(window.location.search)
  const referralCode = urlParams.get("ref") || urlParams.get("referral") || urlParams.get("referral_code")

  // Store in sessionStorage so it persists during registration flow
  if (referralCode) {
    sessionStorage.setItem("referral_code", referralCode)
  }

  return referralCode || sessionStorage.getItem("referral_code")
}

export class AuthService {
  static async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/accounts/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      const errorMsg = error.error || Object.values(error).flat().join(", ") || "Login failed"
      throw new Error(errorMsg)
    }

    const result = await response.json()
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", result.token)
      localStorage.setItem("user", JSON.stringify(result.user))
    }
    return result
  }

  static async register(data: RegisterData): Promise<AuthResponse> {
    const referralCode = data.referral_code || getReferralCodeFromUrl()

    // Validate phone number format (basic E.164: starts with +, then digits)
    if (!data.phone_number.match(/^\+\d{10,15}$/)) {
      throw new Error("Phone number must be in international format (e.g., +1234567890)")
    }

    const response = await fetch(`${API_BASE_URL}/accounts/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        password2: data.password,
        referral_code: referralCode, // Include referral code
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      const errorMsg = error.error || Object.values(error).flat().join(", ") || "Registration failed"
      throw new Error(errorMsg)
    }

    const result = await response.json()
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", result.token)
      localStorage.setItem("user", JSON.stringify(result.user))
      // Clear referral code from session storage after successful registration
      sessionStorage.removeItem("referral_code")
    }
    return result
  }

  static logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user")
    }
  }

  static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token")
    }
    return null
  }

  static getUser(): User | null {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user")
      return user ? JSON.parse(user) : null
    }
    return null
  }

  static isAuthenticated(): boolean {
    return !!this.getToken()
  }
}
