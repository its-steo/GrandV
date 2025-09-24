"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Home,
  Play,
  Package,
  Wallet,
  ShoppingBag,
  User,
  LogOut,
  Menu,
  X,
  Building2,
  CreditCard,
  ShoppingCart,
  MessageCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "View Ads", href: "/ads", icon: Play },
  { name: "Packages", href: "/packages", icon: Package },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "Store", href: "/store", icon: ShoppingBag },
  { name: "Support", href: "/support", icon: MessageCircle },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Lipa Mdogo Mdogo", href: "/lipa", icon: CreditCard },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
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
        className="fixed top-4 left-4 z-[60] md:hidden neon-card neon-glow-cyan bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm border border-cyan-500/30 hover:from-cyan-500/30 hover:to-purple-500/30"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5 text-cyan-300" /> : <Menu className="h-5 w-5 text-cyan-300" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-[55] w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col bg-gradient-to-b from-slate-50/95 via-purple-50/30 to-slate-50/95 dark:from-slate-900/95 dark:via-purple-900/20 dark:to-slate-900/95 backdrop-blur-xl border-r border-purple-200/50 dark:border-white/10 shadow-xl">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-purple-200/50 dark:border-white/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-lg animate-pulse">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                GrandView
              </span>
              <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Business Platform</span>
            </div>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-purple-200/30 dark:border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-cyan-100/80 to-purple-100/80 dark:from-cyan-900/20 dark:to-purple-900/20 border border-cyan-200/50 dark:border-cyan-500/30 shadow-sm">
              <Avatar className="h-11 w-11 ring-2 ring-cyan-400/50 shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white font-semibold">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user?.username}</p>
                <div className="text-xs text-purple-600 dark:text-purple-400 truncate flex items-center gap-1">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full animate-pulse",
                      user?.is_marketer ? "bg-green-500" : "bg-cyan-500",
                    )}
                  />
                  {user?.is_marketer ? "Marketer" : "Member"}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-400/30 shadow-md neon-glow-cyan"
                      : "text-slate-600 dark:text-slate-300 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-gradient-to-r hover:from-cyan-100/50 hover:to-purple-100/50 dark:hover:from-cyan-900/20 dark:hover:to-purple-900/20 hover:border-cyan-300/30 dark:hover:border-cyan-500/30 border border-transparent",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-colors duration-200",
                      isActive
                        ? "text-cyan-600 dark:text-cyan-400"
                        : "text-slate-500 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400",
                    )}
                  />
                  <span className="font-medium">{item.name}</span>
                  {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />}
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-purple-200/30 dark:border-white/10">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300/30 dark:hover:border-red-500/20 border border-transparent rounded-xl py-3 font-medium transition-all duration-200"
              onClick={() => {
                logout()
                router.push("/auth")
              }}
            >
              <LogOut className="h-5 w-5" />
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
