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
    <Card className="glass-bright border-white/30 scale-on-hover neon-glow-cyan">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Plus className="h-6 w-6 text-blue-400 neon-glow-cyan" />
          <span className="neon-text">Deposit Funds</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={depositMethod}
          onValueChange={(value) => setDepositMethod(value as "stk" | "manual")}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2 glass-bright border border-white/20">
            <TabsTrigger value="stk" className="neon-button-primary">
              M-Pesa STK Push
            </TabsTrigger>
            <TabsTrigger value="manual" className="neon-button-primary">
              Manual Deposit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stk" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-foreground font-medium">
                  Amount (KSH)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="Enter amount to deposit"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-neon text-lg"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone-number" className="text-foreground font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone-number"
                  type="text"
                  placeholder="e.g., 254712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="input-neon text-lg"
                  required
                />
                <p className="text-xs text-muted-foreground">Enter phone number for M-Pesa STK Push</p>
              </div>
              <div className="space-y-3">
                <Label className="text-foreground font-medium">Quick Amounts</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {quickAmounts.map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(quickAmount.toString())}
                      className="neon-button-primary text-xs sm:text-sm font-medium py-2 px-2 sm:px-3"
                    >
                      {formatCurrency(quickAmount)}
                    </Button>
                  ))}
                </div>
              </div>
              <Button
                type="submit"
                className="w-full neon-button-primary text-lg py-6 font-semibold"
                disabled={isDepositing}
              >
                {isDepositing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Smartphone className="h-5 w-5 mr-2" />
                    Deposit via STK Push
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="p-4 glass border border-blue-400/30 rounded-lg neon-glow-cyan">
              <p className="text-sm text-blue-200 font-medium">
                Pay to <strong className="text-blue-100">Paybill 516600</strong>, Account{" "}
                <strong className="text-blue-100">938628</strong>, then enter the M-Pesa transaction code below.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manual-amount" className="text-foreground font-medium">
                  Amount (KSH)
                </Label>
                <Input
                  id="manual-amount"
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="Enter amount deposited"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-neon text-lg"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mpesa-code" className="text-foreground font-medium">
                  M-Pesa Transaction Code
                </Label>
                <Input
                  id="mpesa-code"
                  type="text"
                  placeholder="e.g., ABC123DEF4"
                  value={mpesaCode}
                  onChange={(e) => setMpesaCode(e.target.value)}
                  className="input-neon text-lg"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter the 10-character M-Pesa code from your confirmation SMS
                </p>
              </div>
              <div className="space-y-3">
                <Label className="text-foreground font-medium">Quick Amounts</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {quickAmounts.map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(quickAmount.toString())}
                      className="neon-button-primary text-xs sm:text-sm font-medium py-2 px-2 sm:px-3"
                    >
                      {formatCurrency(quickAmount)}
                    </Button>
                  ))}
                </div>
              </div>
              <Button
                type="submit"
                className="w-full neon-button-primary text-lg py-6 font-semibold"
                disabled={isDepositing}
              >
                {isDepositing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Submit Manual Deposit
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 glass border border-blue-400/30 rounded-lg neon-glow-cyan">
          <p className="text-sm text-blue-200">
            ℹ️ STK Push deposits are instant; manual deposits require admin approval. You will receive an email once
            approved.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
