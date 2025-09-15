"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, CreditCard, CheckCircle, Info } from "lucide-react"
import type { Product } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"

interface InstallmentPricingModalProps {
  product: Product
  onClose: () => void
  onSelectPlan: (plan: any) => void
}

export function InstallmentPricingModal({ product, onClose, onSelectPlan }: InstallmentPricingModalProps) {
  if (!product.installment_available || !product.installment_plans?.length) {
    return null
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl glass-card border-white/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Lipa Mdogo Mdogo - Installment Plans
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <img
              src={product.main_image || "/placeholder.svg?height=80&width=80"}
              alt={product.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div>
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-muted-foreground">Full Price: {formatCurrency(product.price)}</p>
            </div>
          </div>

          {/* Installment Plans */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Choose Your Payment Plan
            </h4>

            <div className="grid gap-3">
              {product.installment_plans.map((plan, index) => (
                <Card key={index} className="glass-card border-white/20 hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {plan.months} Months
                          </Badge>
                          {index === 0 && (
                            <Badge className="bg-green-500 text-white text-xs">
                              <CheckCircle className="h-2 w-2 mr-1" />
                              Most Popular
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Monthly Payment:</span>
                            <p className="font-semibold text-primary">{formatCurrency(plan.monthly_payment)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Deposit Required:</span>
                            <p className="font-medium">{formatCurrency(plan.deposit_required)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total Amount:</span>
                            <p className="font-medium">{formatCurrency(plan.total_amount)}</p>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => onSelectPlan(plan)}
                        className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                      >
                        Select Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <Card className="glass-card border-blue-500/20 bg-blue-50/10">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">How Lipa Mdogo Mdogo Works:</p>
                  <ul className="text-blue-600 dark:text-blue-400 space-y-1 text-xs">
                    <li>• Pay a small deposit to secure your item</li>
                    <li>• Make affordable monthly payments</li>
                    <li>• Get your product delivered immediately after deposit</li>
                    <li>• No hidden fees or interest charges</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
