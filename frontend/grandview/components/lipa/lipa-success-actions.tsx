"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Package, CreditCard, CheckCircle, ArrowRight, Sparkles } from "lucide-react"
import type { LipaRegistration } from "@/lib/api"
import Link from "next/link"

interface LipaSuccessActionsProps {
  registration: LipaRegistration
}

export function LipaSuccessActions({ registration }: LipaSuccessActionsProps) {
  const isApproved = registration.status === "APPROVED"

  if (!isApproved) {
    return null
  }

  return (
    <Card className="glass-card border-white/20 bg-gradient-to-r from-green-50/50 to-blue-50/50 dark:from-green-900/20 dark:to-blue-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
          <CheckCircle className="h-5 w-5" />
          Congratulations! You Are Approved
          <Badge className="bg-green-500 text-white">
            <Sparkles className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your Lipa Mdogo Mdogo account is now active. Start shopping with flexible installment payments!
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/store" className="block">
            <Button className="w-full h-auto p-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
              <div className="flex flex-col items-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-semibold">Browse Products</p>
                  <p className="text-xs opacity-90">Shop with installments</p>
                </div>
              </div>
            </Button>
          </Link>

          <Link href="/orders" className="block">
            <Button variant="outline" className="w-full h-auto p-4 glass bg-transparent">
              <div className="flex flex-col items-center gap-2">
                <Package className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-semibold">Track Orders</p>
                  <p className="text-xs opacity-70">View your purchases</p>
                </div>
              </div>
            </Button>
          </Link>

          <Link href="/lipa?tab=payments" className="block">
            <Button variant="outline" className="w-full h-auto p-4 glass bg-transparent">
              <div className="flex flex-col items-center gap-2">
                <CreditCard className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-semibold">Manage Payments</p>
                  <p className="text-xs opacity-70">View installments</p>
                </div>
              </div>
            </Button>
          </Link>
        </div>

        <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-green-700 dark:text-green-300">Ready to start shopping?</p>
              <p className="text-sm text-muted-foreground">Pay only 40% upfront, 0% interest</p>
            </div>
            <Link href="/store">
              <Button
                size="sm"
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                Shop Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
