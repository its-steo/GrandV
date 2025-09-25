"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Zap, User, ChevronDown } from "lucide-react"

export function TopBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAuthenticated } = useAuth()

  const handleWhatsAppClick = () => {
    window.open("https://wa.me/your-phone-number", "_blank")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-500/20 bg-gradient-to-r from-slate-900/95 via-purple-900/90 to-slate-900/95 backdrop-blur-xl shadow-xl relative">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-cyan-500/10 via-transparent to-orange-500/10"></div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
      </div>

      <div className="container flex h-16 items-center justify-between px-4 relative z-10">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-cyan-500/50 transition-all duration-300 animate-pulse">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-purple-300 transition-all duration-300">
            GrandView
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="text-slate-300 hover:text-cyan-400 transition-all duration-300 relative group font-medium"
          >
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            href="/features"
            className="text-slate-300 hover:text-cyan-400 transition-all duration-300 relative group font-medium"
          >
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            href="/packages"
            className="text-slate-300 hover:text-cyan-400 transition-all duration-300 relative group font-medium"
          >
            Packages
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              {/* WhatsApp Icon with proper WhatsApp styling */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleWhatsAppClick}
                className="text-green-400 hover:bg-green-500/10 hover:text-green-300 transition-all duration-300"
                title="Contact us on WhatsApp"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
              </Button>

              {/* User Profile */}
              <div className="flex items-center space-x-2 text-cyan-300">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium hidden sm:block">{user?.username || "User"}</span>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/auth">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 hover:text-cyan-300 transition-all duration-300 hover:shadow-cyan-500/25 hover:shadow-lg bg-transparent"
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            </div>
          )}

          <div className="md:hidden relative">
            <Button
              variant="ghost"
              size="sm"
              className="text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 transition-all duration-300 flex items-center space-x-1"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="text-sm font-medium">Menu</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`} />
            </Button>

            {/* Dropdown menu positioned absolutely to appear above all content */}
            {isMenuOpen && (
              <>
                {/* Backdrop overlay */}
                <div
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
                  onClick={() => setIsMenuOpen(false)}
                />

                {/* Dropdown menu */}
                <div className="fixed right-4 top-16 w-64 bg-gradient-to-r from-slate-900/98 via-purple-900/95 to-slate-900/98 backdrop-blur-xl border border-cyan-500/20 rounded-lg shadow-2xl shadow-cyan-500/20 overflow-hidden z-[9999] animate-in slide-in-from-top-2 duration-200">
                  <nav className="py-3">
                    <Link
                      href="/"
                      className="block px-4 py-3 text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300 font-medium border-b border-cyan-500/10 last:border-b-0"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                        <span>Home</span>
                      </div>
                    </Link>
                    <Link
                      href="/features"
                      className="block px-4 py-3 text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300 font-medium border-b border-cyan-500/10 last:border-b-0"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                        <span>Features</span>
                      </div>
                    </Link>
                    <Link
                      href="/packages"
                      className="block px-4 py-3 text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300 font-medium border-b border-cyan-500/10 last:border-b-0"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                        <span>Packages</span>
                      </div>
                    </Link>

                    {isAuthenticated && (
                      <>
                        <div className="border-t border-cyan-500/20 my-2"></div>
                        <button
                          onClick={() => {
                            handleWhatsAppClick()
                            setIsMenuOpen(false)
                          }}
                          className="w-full flex items-center px-4 py-3 text-green-400 hover:bg-green-500/10 hover:text-green-300 transition-all duration-300"
                        >
                          <svg className="h-4 w-4 mr-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                          </svg>
                          WhatsApp Support
                        </button>
                      </>
                    )}

                    {!isAuthenticated && (
                      <>
                        <div className="border-t border-cyan-500/20 my-2"></div>
                        <div className="px-4 py-3">
                          <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 hover:text-cyan-300 transition-all duration-300 bg-transparent"
                            >
                              <User className="h-4 w-4 mr-2" />
                              Sign In
                            </Button>
                          </Link>
                        </div>
                      </>
                    )}
                  </nav>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
