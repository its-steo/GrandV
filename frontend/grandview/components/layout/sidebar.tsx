"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Home,
  Package,
  Wallet,
  ShoppingBag,
  User,
  LogOut,
  Menu,
  X,
  CreditCard,
  ShoppingCart,
  Megaphone,
  TrendingUp,
  MessageCircle,
  DollarSign, // Added for Withdraw icon
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home, description: "Overview & Analytics", iconColor: "text-blue-500 dark:text-blue-400" },
  { name: "Advertise", href: "/ads", icon: Megaphone, description: "WhatsApp Ad Campaigns", badge: "New", iconColor: "text-green-500 dark:text-green-400" },
  { name: "Withdraw", href: "/withdraw", icon: DollarSign,description: "Views Earning Withdrawals", iconColor: "text-green-500 dark:text-green-400" },
  { name: "Wallet", href: "/wallet", icon: Wallet, description: "Payments & Billing", iconColor: "text-teal-500 dark:text-teal-400" },
  { name: "Packages", href: "/packages", icon: Package, description: "Subscription Plans", iconColor: "text-amber-500 dark:text-amber-400" },
  { name: "Store", href: "/store", icon: ShoppingBag, description: "Marketing Tools", iconColor: "text-purple-500 dark:text-purple-400" },
  { name: "Support", href: "/support", icon: MessageCircle, description: "Help & Assistance", iconColor: "text-pink-500 dark:text-pink-400" },
]

const quickActions = [
  { name: "Profile", href: "/profile", icon: User, iconColor: "text-cyan-500 dark:text-cyan-400" },
  { name: "Orders", href: "/orders", icon: ShoppingCart, iconColor: "text-orange-500 dark:text-orange-400" },
  { name: "Lipa Mdogo", href: "/lipa", icon: CreditCard, iconColor: "text-red-500 dark:text-red-400" },
   // Added Withdraw
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const router = useRouter()

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-[60] md:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5 text-gray-600 dark:text-gray-300" /> : <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-[55] w-72 transform transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
          {/* Logo & Company Info */}
          <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex flex-col items-center gap-0 mb-2 sm:mb-3">
              <img
                src="/images/grandvlogo.png"
                alt="GrandView Logo"
                className="h-56 w-56 sm:h-64 sm:w-64 object-contain"
              />
              <div className="flex flex-col items-center text-center -mt-20">
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Advertise on WhatsApp and Earn</span>
              </div>
            </div>

            {/* Company tagline */}
            <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 dark:from-green-900/20 dark:via-blue-900/20 dark:to-purple-900/20 border border-green-200/50 dark:border-green-700/30">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium text-center">
                🚀 Reach millions through WhatsApp
              </p>
            </div>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-slate-200/30 dark:border-slate-700/30">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-700/50 border border-slate-200/50 dark:border-slate-600/50 shadow-sm">
              <Avatar className="h-11 w-11 ring-2 ring-blue-400/30 shadow-md">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user?.username || "User"}</p>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      user?.is_marketer ? "bg-green-500 animate-pulse" : "bg-blue-500 animate-pulse",
                    )}
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user?.is_marketer ? "Pro Marketer" : "Member"}
                  </span>
                  {user?.is_marketer && (
                    <Badge
                      variant="secondary"
                      className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    >
                      PRO
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Marketing Hub
              </h3>
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                      isActive
                        ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50 shadow-sm"
                        : "text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50/50 dark:hover:from-slate-800 dark:hover:to-blue-900/20 hover:border-blue-200/30 dark:hover:border-blue-700/30 border border-transparent",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 transition-colors duration-200 flex-shrink-0",
                        isActive ? "text-blue-600 dark:text-blue-400" : item.iconColor,
                        isActive ? "" : "group-hover:text-blue-600 dark:group-hover:text-blue-400",
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{item.name}</span>
                        {item.badge && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.description}</p>
                    </div>
                    {isActive && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />}
                  </Link>
                )
              })}
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-slate-200/30 dark:border-slate-700/30">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Quick Actions
              </h3>
              {quickActions.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                      isActive
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 flex-shrink-0",
                        isActive ? "text-slate-900 dark:text-white" : item.iconColor,
                      )}
                    />
                    <span className="truncate">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Performance Stats */}
          <div className="p-4 border-t border-slate-200/30 dark:border-slate-700/30">
            <div className="p-3 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200/50 dark:border-green-700/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-semibold text-green-700 dark:text-green-300">This Month</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Campaigns</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">12</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Reach</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">2.4K</p>
                </div>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="p-4 border-t border-slate-200/30 dark:border-slate-700/30">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl py-3 font-medium transition-all duration-200"
              onClick={() => {
                logout()
                router.push("/auth")
              }}
            >
              <LogOut className="h-5 w-5 text-red-500 dark:text-red-400" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-[50] bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}