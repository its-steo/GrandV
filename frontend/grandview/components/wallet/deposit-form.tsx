"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2, CreditCard } from "lucide-react"
import { ApiService } from "@/lib/api"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

interface DepositFormProps {
  onSuccess: () => void
}

export function DepositForm({ onSuccess }: DepositFormProps) {
  const [amount, setAmount] = useState("")
  const [isDepositing, setIsDepositing] = useState(false)
  const [quickAmounts, setQuickAmounts] = useState<number[]>([10, 25, 50, 100])

  useEffect(() => {
    const loadDepositConfig = async () => {
      try {
        const config = await ApiService.getDepositConfig()
        if (config.quick_amounts && config.quick_amounts.length > 0) {
          setQuickAmounts(config.quick_amounts)
        }
      } catch (error) {
        // Keep default amounts if API fails
        console.log("Using default quick amounts")
      }
    }

    loadDepositConfig()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const depositAmount = Number.parseFloat(amount)
    if (isNaN(depositAmount) || depositAmount <= 0) {
      toast.error("Please enter a valid amount greater than 0")
      return
    }

    if (depositAmount < 1) {
      toast.error("Minimum deposit amount is KSH 1.00")
      return
    }

    try {
      setIsDepositing(true)
      await ApiService.deposit(depositAmount)

      toast.success(` ${formatCurrency(depositAmount)} has been added to your deposit balance`)

      setAmount("")
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to process deposit")
    } finally {
      setIsDepositing(false)
    }
  }

  return (
    <Card className="glass-card border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-blue-500" />
          Deposit Funds
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (KSH)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="1"
              placeholder="Enter amount to deposit"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="glass border-white/20"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Quick Amounts</Label>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="bg-transparent border-white/20 hover:bg-blue-500/10"
                >
                 {formatCurrency(quickAmount)}
                </Button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            disabled={isDepositing}
          >
            {isDepositing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Deposit {formatCurrency(amount || "0.00")}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
