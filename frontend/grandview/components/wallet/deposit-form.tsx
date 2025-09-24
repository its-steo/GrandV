// components/wallet/deposit-form.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Plus, Loader2, CreditCard, Smartphone } from "lucide-react"
import { ApiService } from "@/lib/api"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

interface DepositFormProps {
  onSuccess: () => void
}

export function DepositForm({ onSuccess }: DepositFormProps) {
  const [amount, setAmount] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [mpesaCode, setMpesaCode] = useState("")
  const [isDepositing, setIsDepositing] = useState(false)
  const [quickAmounts, setQuickAmounts] = useState<number[]>([100, 500, 1000, 2000])
  const [depositMethod, setDepositMethod] = useState<"stk" | "manual">("stk")

  useEffect(() => {
    const loadDepositConfig = async () => {
      try {
        const config = await ApiService.getDepositConfig()
        if (config.quick_amounts && config.quick_amounts.length > 0) {
          setQuickAmounts(config.quick_amounts)
        }
      } catch {
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

    if (depositMethod === "stk" && !phoneNumber.match(/^2547\d{8}$/)) {
      toast.error("Please enter a valid phone number (e.g., 254712345678)")
      return
    }

    if (depositMethod === "manual" && !mpesaCode.match(/^[A-Z0-9]{10}$/)) {
      toast.error("Please enter a valid 10-character M-Pesa transaction code")
      return
    }

    try {
      setIsDepositing(true)
      const payload = {
        amount: depositAmount,
        deposit_method: depositMethod,
        ...(depositMethod === "stk" && { phone_number: phoneNumber }),
        ...(depositMethod === "manual" && { mpesa_code: mpesaCode }),
      }
      const response = await ApiService.deposit(payload)

      if (depositMethod === "stk") {
        toast.success(response.message || "STK Push initiated. Check your phone for the PIN prompt.")
      } else {
        toast.success(response.message || "Manual deposit submitted. Awaiting admin approval.")
      }

      setAmount("")
      setPhoneNumber("")
      setMpesaCode("")
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
        <Tabs value={depositMethod} onValueChange={(value) => setDepositMethod(value as "stk" | "manual")} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 glass">
            <TabsTrigger value="stk">M-Pesa STK Push</TabsTrigger>
            <TabsTrigger value="manual">Manual Deposit</TabsTrigger>
          </TabsList>

          <TabsContent value="stk" className="space-y-4">
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
                <Label htmlFor="phone-number">Phone Number</Label>
                <Input
                  id="phone-number"
                  type="text"
                  placeholder="e.g., 254712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="glass border-white/20"
                  required
                />
                <p className="text-xs text-muted-foreground">Enter phone number for M-Pesa STK Push</p>
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
                    <Smartphone className="h-4 w-4 mr-2" />
                    Deposit via STK Push
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                Pay to <strong>Paybill 516600</strong>, Account <strong>938628</strong>, then enter the M-Pesa transaction code below.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (KSH)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="Enter amount deposited"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="glass border-white/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mpesa-code">M-Pesa Transaction Code</Label>
                <Input
                  id="mpesa-code"
                  type="text"
                  placeholder="e.g., ABC123DEF4"
                  value={mpesaCode}
                  onChange={(e) => setMpesaCode(e.target.value)}
                  className="glass border-white/20"
                  required
                />
                <p className="text-xs text-muted-foreground">Enter the 10-character M-Pesa code from your confirmation SMS</p>
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
                    Submit Manual Deposit
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            ℹ️ STK Push deposits are instant; manual deposits require admin approval. You will receive an email once approved.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}