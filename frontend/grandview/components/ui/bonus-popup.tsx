"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gift, X, Sparkles, Crown, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface BonusPopupProps {
  isOpen: boolean
  onClose: () => void
  bonusAmount: string
  bonusType: "referral" | "premium" | "daily" | "achievement"
  title: string
  description: string
}

export function BonusPopup({ isOpen, onClose, bonusAmount, bonusType, title, description }: BonusPopupProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const getBonusIcon = () => {
    switch (bonusType) {
      case "premium":
        return <Crown className="h-8 w-8" />
      case "referral":
        return <Gift className="h-8 w-8" />
      case "daily":
        return <Zap className="h-8 w-8" />
      case "achievement":
        return <Sparkles className="h-8 w-8" />
      default:
        return <Gift className="h-8 w-8" />
    }
  }

  const getBonusColor = () => {
    switch (bonusType) {
      case "premium":
        return "from-yellow-400 to-orange-500"
      case "referral":
        return "from-primary to-secondary"
      case "daily":
        return "from-accent to-primary"
      case "achievement":
        return "from-secondary to-accent"
      default:
        return "from-primary to-secondary"
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          {/* Confetti Effect */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 1,
                    y: -20,
                    x: Math.random() * window.innerWidth,
                    rotate: 0,
                  }}
                  animate={{
                    opacity: 0,
                    y: window.innerHeight + 100,
                    rotate: 360,
                  }}
                  transition={{
                    duration: 3,
                    delay: Math.random() * 2,
                    ease: "easeOut",
                  }}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: ["#00ffff", "#ff00ff", "#00ff88", "#ff0066"][Math.floor(Math.random() * 4)],
                  }}
                />
              ))}
            </div>
          )}

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <Card className="bonus-popup w-full max-w-md relative overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>

              <CardContent className="p-8 text-center">
                {/* Animated background */}
                <div className="absolute inset-0 opacity-20">
                  <div className={`w-full h-full bg-gradient-to-br ${getBonusColor()} animate-pulse`} />
                </div>

                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", damping: 15 }}
                  className={`w-20 h-20 rounded-full bg-gradient-to-r ${getBonusColor()} flex items-center justify-center mx-auto mb-6 neon-glow text-black`}
                >
                  {getBonusIcon()}
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent neon-text"
                >
                  {title}
                </motion.h2>

                {/* Bonus Amount */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="text-5xl font-bold mb-4 text-accent neon-text"
                >
                  +{bonusAmount}
                </motion.div>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-muted-foreground mb-6 text-lg"
                >
                  {description}
                </motion.p>

                {/* Action Button */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                  <Button
                    onClick={onClose}
                    className={`w-full h-12 text-lg font-semibold btn-neon bg-gradient-to-r ${getBonusColor()} hover:scale-105 transition-all duration-300 text-black`}
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Awesome!
                  </Button>
                </motion.div>

                {/* Floating particles around the popup */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(10)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        y: [0, -30, -60],
                        x: [0, Math.random() * 40 - 20, Math.random() * 80 - 40],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: Math.random() * 2,
                      }}
                      className="absolute w-1 h-1 bg-accent rounded-full"
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
