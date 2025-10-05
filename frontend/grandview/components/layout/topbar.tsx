"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { User, ChevronDown, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function TopBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAuthenticated } = useAuth()

  const handleWhatsAppClick = () => {
    window.open("https://wa.me/your-phone-number", "_blank")
  }

  useEffect(() => {
    // Any client-side initialization can go here
  }, [])

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 w-full border-b border-gray-700/30 bg-gradient-to-r from-purple-900 via-purple-800/50 to-lime-800/50 backdrop-blur-xl shadow-lg relative"
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-lime-500/20 via-purple-500/10 to-gray-700/20"></div>
        <motion.div
          className="absolute top-3 sm:top-5 left-5 sm:left-12 w-2 sm:w-3 h-2 sm:h-3 bg-lime-400/60 rounded-full blur-sm"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-3 sm:bottom-5 right-5 sm:right-12 w-2 sm:w-3 h-2 sm:h-3 bg-purple-400/60 rounded-full blur-sm"
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.4, 0.9, 0.4],
          }}
          transition={{
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </div>

      <div className="container flex h-16 sm:h-20 md:h-24 items-center justify-between px-4 sm:px-6 md:px-8 relative z-10">
        <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
          <motion.div
            className="w-16 sm:w-20 md:w-24 h-auto rounded-lg overflow-hidden shadow-xl group-hover:shadow-lime-400/50 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <img src="images/grandvlogo.png" alt="GrandView Logo" className="w-full h-full object-contain" />
          </motion.div>
          <span className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-lime-200 bg-clip-text text-transparent group-hover:from-lime-100 group-hover:to-purple-300 transition-all duration-300">
            GrandView
          </span>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-lime-300/80" />
          </motion.div>
        </Link>

        <nav className="hidden md:flex items-center space-x-4 md:space-x-6">
          <Link
            href="/"
            className="text-sm sm:text-base md:text-lg text-white hover:text-lime-200 transition-all duration-300 relative group font-semibold"
          >
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-lime-200 to-purple-300 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            href="/features"
            className="text-sm sm:text-base md:text-lg text-white hover:text-lime-200 transition-all duration-300 relative group font-semibold"
          >
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-lime-200 to-purple-300 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            href="/packages"
            className="text-sm sm:text-base md:text-lg text-white hover:text-lime-200 transition-all duration-300 relative group font-semibold"
          >
            Packages
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-lime-200 to-purple-300 transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </nav>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {isAuthenticated ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleWhatsAppClick}
                className="text-green-400 hover:bg-green-900/30 hover:text-green-300 transition-all duration-300 bg-gray-800/50 backdrop-blur-sm border border-green-800/30 p-2 sm:p-3"
                title="Contact us on WhatsApp"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-lime-200 hover:bg-lime-900/30 transition-all duration-300 bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 flex items-center p-2 sm:p-3"
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline text-sm sm:text-base truncate max-w-[100px] sm:max-w-[140px] md:max-w-[180px]">
                  {user?.username}
                </span>
              </Button>
            </div>
          ) : (
            <Link href="/auth">
              <Button
                variant="outline"
                size="sm"
                className="border-white/30 text-white hover:bg-lime-900/30 hover:border-lime-300 hover:text-lime-200 transition-all duration-300 bg-gray-800/50 backdrop-blur-sm p-2 sm:p-3"
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="text-sm sm:text-base">Sign In</span>
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white hover:bg-gray-700/50 transition-all duration-300 p-2 sm:p-3"
          >
            <ChevronDown className={`h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="md:hidden fixed right-4 sm:right-6 top-16 sm:top-20 w-40 sm:w-48 bg-gray-800/95 backdrop-blur-xl border border-gray-700/30 rounded-lg shadow-2xl shadow-gray-900/20 overflow-hidden z-50"
          >
            <nav className="py-3">
              <Link
                href="/"
                className="block px-4 sm:px-5 py-3 text-white hover:text-lime-200 hover:bg-gray-700/50 transition-all duration-300 font-medium border-b border-gray-700/30 last:border-b-0 text-sm sm:text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-lime-400"></div>
                  <span>Home</span>
                </div>
              </Link>
              <Link
                href="/features"
                className="block px-4 sm:px-5 py-3 text-white hover:text-lime-200 hover:bg-gray-700/50 transition-all duration-300 font-medium border-b border-gray-700/30 last:border-b-0 text-sm sm:text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-purple-400"></div>
                  <span>Features</span>
                </div>
              </Link>
              <Link
                href="/packages"
                className="block px-4 sm:px-5 py-3 text-white hover:text-lime-200 hover:bg-gray-700/50 transition-all duration-300 font-medium border-b border-gray-700/30 last:border-b-0 text-sm sm:text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gray-500"></div>
                  <span>Packages</span>
                </div>
              </Link>

              {isAuthenticated && (
                <>
                  <div className="border-t border-gray-700/30 my-2"></div>
                  <button
                    onClick={() => {
                      handleWhatsAppClick()
                      setIsMenuOpen(false)
                    }}
                    className="w-full flex items-center px-4 sm:px-5 py-3 text-green-400 hover:bg-green-900/30 hover:text-green-300 transition-all duration-300 text-sm sm:text-base"
                  >
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                    </svg>
                    WhatsApp Support
                  </button>
                </>
              )}

              {!isAuthenticated && (
                <>
                  <div className="border-t border-gray-700/30 my-2"></div>
                  <div className="px-4 sm:px-5 py-3">
                    <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-white/30 text-white hover:bg-lime-900/30 hover:border-lime-300 hover:text-lime-200 transition-all duration-300 bg-gray-800/50 backdrop-blur-sm p-2 sm:p-3 text-sm sm:text-base"
                      >
                        <User className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                        Sign In
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}