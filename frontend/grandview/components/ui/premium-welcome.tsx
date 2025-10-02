"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Crown, Sparkles, Star, Gift, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface PremiumWelcomeProps {
  isOpen: boolean
  onClose: () => void
  userName: string
  packageName: string
  bonusAmount: string
}

export function PremiumWelcome({ isOpen, onClose, userName, packageName, bonusAmount }: PremiumWelcomeProps) {
  const [showStars, setShowStars] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowStars(true)
      const timer = setTimeout(() => setShowStars(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
        >
          {/* Floating stars effect */}
          {showStars && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 0,
                    scale: 0,
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    rotate: 360,
                  }}
                  transition={{
                    duration: 4,
                    delay: Math.random() * 3,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: Math.random() * 2,
                  }}
                  className="absolute"
                >
                  <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotateY: 180 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
          >
            <Card className="premium-welcome w-full max-w-lg relative overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>

              <CardContent className="p-10 text-center">
                {/* Animated golden background */}
                <div className="absolute inset-0 opacity-30">
                  <div className="w-full h-full bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 animate-pulse" />
                </div>

                {/* Crown Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: "spring", damping: 15 }}
                  className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-6 neon-glow"
                >
                  <Crown className="h-12 w-12 text-black" />
                </motion.div>

                {/* Welcome Message */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-6"
                >
                  <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent neon-text">
                    Welcome, {userName}!
                  </h1>
                  <p className="text-xl text-muted-foreground">You have successfully upgraded to</p>
                  <p className="text-2xl font-bold text-yellow-400 neon-text">{packageName} Package</p>
                </motion.div>

                {/* Bonus Section */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, type: "spring" }}
                  className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-xl p-6 mb-6 border-2 border-yellow-400/50"
                >
                  <div className="flex items-center justify-center mb-3">
                    <Gift className="h-6 w-6 text-yellow-400 mr-2" />
                    <span className="text-lg font-semibold text-yellow-400">Welcome Bonus</span>
                  </div>
                  <div className="text-4xl font-bold text-yellow-400 neon-text">+{bonusAmount}</div>
                  <p className="text-sm text-muted-foreground mt-2">Added to your account instantly!</p>
                </motion.div>

                {/* Features List */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="grid grid-cols-2 gap-4 mb-6"
                >
                  {[
                    { icon: <Sparkles className="h-4 w-4" />, text: "Higher Earnings" },
                    { icon: <Crown className="h-4 w-4" />, text: "Premium Support" },
                    { icon: <Star className="h-4 w-4" />, text: "Exclusive Offers" },
                    { icon: <Gift className="h-4 w-4" />, text: "Bonus Rewards" },
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + index * 0.1 }}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <div className="text-yellow-400">{feature.icon}</div>
                      {feature.text}
                    </motion.div>
                  ))}
                </motion.div>

                {/* Action Button */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
                  <Button
                    onClick={onClose}
                    className="w-full h-12 text-lg font-semibold btn-neon bg-gradient-to-r from-yellow-400 to-orange-500 hover:scale-105 transition-all duration-300 text-black"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Earning Premium!
                  </Button>
                </motion.div>

                {/* Floating sparkles around the card */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(15)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        y: [0, -40, -80],
                        x: [0, Math.random() * 60 - 30, Math.random() * 120 - 60],
                        rotate: [0, 180, 360],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: Math.random() * 3,
                      }}
                      className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
