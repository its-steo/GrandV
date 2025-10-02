"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Plus, Loader2, CreditCard, Smartphone } from "lucide-react"
import { ApiService } from "@/lib/api"
import { toast } from "sonner"
//import { formatCurrency } from "@/lib/utils"

interface DepositFormProps {
  onSuccess: () => void
}

export function DepositForm({ onSuccess }: DepositFormProps) {
  const [amount, setAmount] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [mpesaCode, setMpesaCode] = useState("")
  const [isDepositing, setIsDepositing] = useState(false)
  const [depositMethod, setDepositMethod] = useState<"stk" | "manual">("stk")

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
    <Card className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Plus className="h-6 w-6 text-blue-400" />
          <span className="font-bold">Deposit Funds</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={depositMethod}
          onValueChange={(value) => setDepositMethod(value as "stk" | "manual")}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2 glass-card border-white/20">
            <TabsTrigger value="stk" className="bg-blue-700 hover:bg-blue-900 text-white">
              M-Pesa STK Push
            </TabsTrigger>
            <TabsTrigger value="manual" className="bg-purple-700 hover:bg-purple-900 text-white">
              Manual Deposit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stk" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-white font-medium">
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
                  className="glass-card border-white/20 text-white placeholder:text-gray-300 text-lg"
                  required
                />
                <p className="text-xs text-gray-300">Minimum deposit: KSH 100.00</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone-number" className="text-white font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone-number"
                  type="text"
                  placeholder="e.g., 254712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="glass-card border-white/20 text-white placeholder:text-gray-300 text-lg"
                  required
                />
                <p className="text-xs text-gray-300">Enter phone number for M-Pesa STK Push</p>
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-500 text-white hover:bg-blue-600 text-lg py-6 font-semibold"
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
            <div className="p-4 glass-card border-white/20">
              <p className="text-sm text-gray-300 font-medium">
                Pay to <strong className="text-white">Paybill 516600</strong>, Account{" "}
                <strong className="text-white">938628</strong>, then enter the M-Pesa transaction code below.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manual-amount" className="text-white font-medium">
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
                  className="glass-card border-white/20 text-white placeholder:text-gray-300 text-lg"
                  required
                />
                <p className="text-xs text-gray-300">Minimum deposit: KSH 1.00</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mpesa-code" className="text-white font-medium">
                  M-Pesa Transaction Code
                </Label>
                <Input
                  id="mpesa-code"
                  type="text"
                  placeholder="e.g., ABC123DEF4"
                  value={mpesaCode}
                  onChange={(e) => setMpesaCode(e.target.value)}
                  className="glass-card border-white/20 text-white placeholder:text-gray-300 text-lg"
                  required
                />
                <p className="text-xs text-gray-300">
                  Enter the 10-character M-Pesa code from your confirmation SMS
                </p>
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-500 text-white hover:bg-blue-600 text-lg py-6 font-semibold"
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

        <div className="mt-6 p-4 glass-card border-white/20">
          <p className="text-sm text-gray-300">
            ℹ️ STK Push deposits are instant; manual deposits require admin approval. You will receive an email once approved.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
