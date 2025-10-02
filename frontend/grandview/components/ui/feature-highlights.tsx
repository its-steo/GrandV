"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

interface FeatureHighlightProps {
  icon: LucideIcon
  title: string
  description: string
  badge?: string
  gradient?: string
  index?: number
}

export function FeatureHighlight({
  icon: Icon,
  title,
  description,
  badge,
  gradient = "gradient-primary",
  index = 0,
}: FeatureHighlightProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="group"
    >
      <Card className="card-interactive h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ rotate: 5 }}
              transition={{ duration: 0.2 }}
              className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center shadow-lg flex-shrink-0`}
            >
              <Icon className="h-6 w-6 text-white" />
            </motion.div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{title}</h3>
                {badge && (
                  <Badge variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </div>
          </div>
        </CardContent>
        <motion.div
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />
      </Card>
    </motion.div>
  )
}
