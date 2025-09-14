"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Home, Play, Package, Wallet, ShoppingBag, User, LogOut, Menu, X, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "View Ads", href: "/ads", icon: Play },
  { name: "Packages", href: "/packages", icon: Package },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "Store", href: "/store", icon: ShoppingBag },
  { name: "Profile", href: "/profile", icon: User },
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
        className="fixed top-4 left-4 z-[60] md:hidden bg-sidebar/80 backdrop-blur-sm border border-sidebar-border hover:bg-sidebar-accent/20"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-[55] w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col bg-sidebar/95 backdrop-blur-xl border-r border-sidebar-border shadow-xl">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-sidebar-border/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-accent shadow-lg">
              <Building2 className="h-6 w-6 text-sidebar-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-sidebar-primary to-sidebar-accent bg-clip-text text-transparent">
                GrandView
              </span>
              <span className="text-xs text-muted-foreground font-medium">Business Platform</span>
            </div>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-sidebar-border/30">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent/5 border border-sidebar-border/20">
              <Avatar className="h-11 w-11 ring-2 ring-sidebar-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-sidebar-primary to-sidebar-accent text-sidebar-primary-foreground font-semibold">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">{user?.username}</p>
                <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      user?.is_marketer ? "bg-sidebar-accent" : "bg-sidebar-primary",
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
                      ? "bg-gradient-to-r from-sidebar-primary/15 to-sidebar-accent/10 text-sidebar-primary border border-sidebar-primary/20 shadow-sm"
                      : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/5 hover:border-sidebar-border/30 border border-transparent",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-colors duration-200",
                      isActive ? "text-sidebar-primary" : "text-muted-foreground group-hover:text-sidebar-foreground",
                    )}
                  />
                  <span className="font-medium">{item.name}</span>
                  {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-sidebar-accent" />}
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-sidebar-border/30">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-sidebar-foreground hover:bg-destructive/5 hover:border-destructive/20 border border-transparent rounded-xl py-3 font-medium transition-all duration-200"
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