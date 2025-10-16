"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/layout/sidebar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  DollarSign,
  ArrowDownToLine,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Clock,
  Smartphone,
  Shield,
  Zap,
  History,
  Wallet,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Transaction {
  id: number
  amount: string
  transaction_type: string
  description: string
  created_at: string
}

export default function WithdrawPage() {
  const [balance, setBalance] = useState<number>(0)
  const [canWithdraw, setCanWithdraw] = useState<boolean>(false)
  const [amount, setAmount] = useState<string>("")
  const [mpesaNumber, setMpesaNumber] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [fetchingData, setFetchingData] = useState<boolean>(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showLoadingModal, setShowLoadingModal] = useState<boolean>(false)
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchWithdrawalData()
    fetchTransactionHistory()
  }, [])

const fetchWithdrawalData = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      console.log("[v0] Fetching withdrawal data with token:", token ? "Token exists" : "No token found")

      //const response = await fetch("http://localhost:8000/api/withdraw/", {
      //  headers: {
      //    Authorization: `Token ${token}`,
      //  },
      //})
      const response = await fetch("https://grandview-shop.onrender.com/api/withdraw/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      })

      console.log("[v0] Withdrawal data response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Withdrawal data received:", data)
      setBalance(parseFloat(data.views_earnings_balance) || 0)  // Parse to number for comparisons
      setCanWithdraw(data.can_withdraw || false)
    } catch (error) {
      console.error("[v0] Error fetching withdrawal data:", error)
      toast({
        title: "Error",
        description: "Failed to load withdrawal data. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setFetchingData(false)
    }
  }

  const fetchTransactionHistory = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      console.log("[v0] Fetching transaction history")

      //const response = await fetch("http://localhost:8000/api/transactions/", {
      //  headers: {
      //    Authorization: `Token ${token}`,
      //  },
      //})

      const response = await fetch("https://grandview-shop.onrender.com/api/transactions/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      })

      console.log("[v0] Transaction history response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Transaction history received:", data)

      const transactionArray = data.transactions || []  // Fixed: Use data.transactions directly
      const withdrawals = transactionArray.filter((t: Transaction) => t.transaction_type === 'WITHDRAWAL')  // Uppercase to match backend
      setTransactions(withdrawals)
    } catch (error) {
      console.error("[v0] Error fetching transaction history:", error)
      toast({
        title: "Error",
        description: "Failed to load transaction history. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleWithdraw = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    if (!mpesaNumber || mpesaNumber.trim() === "") {
      toast({
        title: "M-Pesa Number Required",
        description: "Please enter your M-Pesa number",
        variant: "destructive",
      })
      return
    }

    // Basic M-Pesa number validation (Kenyan format)
    const mpesaRegex = /^(254|0)[17]\d{8}$/
    if (!mpesaRegex.test(mpesaNumber.replace(/\s/g, ""))) {
      toast({
        title: "Invalid M-Pesa Number",
        description: "Please enter a valid Kenyan M-Pesa number (e.g., 0712345678 or 254712345678)",
        variant: "destructive",
      })
      return
    }

    if (Number.parseFloat(amount) > balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance to withdraw this amount",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setShowLoadingModal(true)

    try {
      const token = localStorage.getItem("auth_token")
      console.log("[v0] Processing withdrawal:", { amount, mpesaNumber })

      //const response = await fetch("http://localhost:8000/api/withdraw/", {
      //  method: "POST",
      //  headers: {
      //    "Content-Type": "application/json",
      //    Authorization: `Token ${token}`,
      //  },
      //  body: JSON.stringify({
      //    amount: Number.parseFloat(amount),
      //    mpesa_number: mpesaNumber,
      //  }),
      //})

      const response = await fetch("https://grandview-shop.onrender.com/api/withdraw/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          amount: Number.parseFloat(amount),
          mpesa_number: mpesaNumber,
        }),
      })

      console.log("[v0] Withdrawal response status:", response.status)
      const data = await response.json()
      console.log("[v0] Withdrawal response data:", data)

      setShowLoadingModal(false)

      if (data.success) {
        setShowSuccessModal(true)
        setBalance(data.new_balance)
        setAmount("")
        setMpesaNumber("")
        fetchTransactionHistory()
      } else {
        toast({
          title: "Withdrawal Failed",
          description: data.message || "Something went wrong",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error processing withdrawal:", error)
      setShowLoadingModal(false)
      toast({
        title: "Error",
        description: "Failed to process withdrawal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const quickAmounts = [100, 500, 1000, 2000, 5000]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-green-950">
      <Sidebar />

      <main className="flex-1 md:ml-72 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Withdraw Earnings</h1>
                <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-1">
                  <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Powered by M-Pesa • Instant & Secure
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 w-fit">
              <Smartphone className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                Direct to M-Pesa • No Hidden Fees
              </span>
            </div>
          </div>

          {/* Balance Card */}
          <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-green-500 via-green-600 to-emerald-600">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />

            <div className="relative p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Available Balance
                  </p>
                  {fetchingData ? (
                    <div className="h-12 w-48 bg-white/20 rounded-lg animate-pulse" />
                  ) : (
                    <h3 className="text-4xl md:text-6xl font-bold text-white mb-2">KSH {balance.toLocaleString()}</h3>
                  )}
                  <p className="text-green-100 text-sm">From views earnings</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
              </div>

              {!canWithdraw && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/20 backdrop-blur-sm border border-amber-300/30">
                  <AlertCircle className="h-5 w-5 text-amber-200 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold text-sm">Upgrade Required</p>
                    <p className="text-green-100 text-sm">
                      Verify your account. Upgrade to unlock withdrawals
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Withdrawal Form */}
            <Card className="p-6 border-2 border-green-200 dark:border-green-800 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30">
                  <ArrowDownToLine className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Withdraw to M-Pesa</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Instant transfer to your phone</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    M-Pesa Number
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      type="tel"
                      placeholder="0712345678 or 254712345678"
                      value={mpesaNumber}
                      onChange={(e) => setMpesaNumber(e.target.value)}
                      className="pl-12 h-14 text-lg font-semibold border-2 border-slate-200 dark:border-slate-700 focus:border-green-500 dark:focus:border-green-500 rounded-xl"
                      disabled={!canWithdraw || loading}
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-1">
                    Enter your Kenyan M-Pesa number
                  </p>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    Enter Amount (KSH)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-12 h-14 text-lg font-semibold border-2 border-slate-200 dark:border-slate-700 focus:border-green-500 dark:focus:border-green-500 rounded-xl"
                      disabled={!canWithdraw || loading}
                    />
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Quick Select</p>
                  <div className="grid grid-cols-5 gap-2">
                    {quickAmounts.map((quickAmount) => (
                      <Button
                        key={quickAmount}
                        variant="outline"
                        size="sm"
                        onClick={() => setAmount(quickAmount.toString())}
                        disabled={!canWithdraw || loading || quickAmount > balance}
                        className={cn(
                          "h-10 font-semibold border-2 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-500 dark:hover:border-green-500 hover:text-green-700 dark:hover:text-green-300 transition-all",
                          amount === quickAmount.toString() &&
                            "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300",
                        )}
                      >
                        {quickAmount}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Withdraw Button */}
                <Button
                  onClick={handleWithdraw}
                  disabled={!canWithdraw || loading || !amount || Number.parseFloat(amount) <= 0 || !mpesaNumber}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Withdraw to M-Pesa
                    </div>
                  )}
                </Button>

                {/* Security Notice */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Your withdrawal will be processed instantly and sent directly to your M-Pesa number
                  </p>
                </div>
              </div>
            </Card>

            {/* Features Card */}
            <Card className="p-6 border-2 border-slate-200 dark:border-slate-800 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <CheckCircle2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Why Choose M-Pesa?</h3>
              </div>

              <div className="space-y-4">
                {[
                  {
                    icon: Zap,
                    title: "Instant Transfer",
                    description: "Money reaches your M-Pesa in seconds",
                    color: "text-yellow-600 dark:text-yellow-400",
                    bg: "bg-yellow-100 dark:bg-yellow-900/30",
                  },
                  {
                    icon: Shield,
                    title: "100% Secure",
                    description: "Bank-level encryption & protection",
                    color: "text-green-600 dark:text-green-400",
                    bg: "bg-green-100 dark:bg-green-900/30",
                  },
                  {
                    icon: DollarSign,
                    title: "No Hidden Fees",
                    description: "What you see is what you get",
                    color: "text-blue-600 dark:text-blue-400",
                    bg: "bg-blue-100 dark:bg-blue-900/30",
                  },
                  {
                    icon: Smartphone,
                    title: "Mobile First",
                    description: "Access your money anywhere, anytime",
                    color: "text-purple-600 dark:text-purple-400",
                    bg: "bg-purple-100 dark:bg-purple-900/30",
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className={cn("p-2 rounded-lg", feature.bg)}>
                      <feature.icon className={cn("h-5 w-5", feature.color)} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{feature.title}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Withdrawal History */}
          <Card className="p-6 border-2 border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                <History className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Withdrawal History</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Track all your M-Pesa withdrawals</p>
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                  <History className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-medium">No withdrawals yet</p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                  Your withdrawal history will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 hover:border-green-200 dark:hover:border-green-800 hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                        <ArrowDownToLine className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">M-Pesa Withdrawal</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {new Date(transaction.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        -KSH {Math.abs(parseFloat(transaction.amount)).toLocaleString()}
                      </p>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-0">
                        Completed
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>

      <Dialog open={showLoadingModal} onOpenChange={setShowLoadingModal}>
        <DialogContent
          className="sm:max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative mb-6">
              <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-green-600 dark:text-green-400 animate-spin" />
              </div>
            </div>
            <DialogHeader className="text-center">
              <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Processing Withdrawal
              </DialogTitle>
              <DialogDescription className="text-base text-slate-600 dark:text-slate-400">
                Please wait while we process your withdrawal to M-Pesa...
              </DialogDescription>
            </DialogHeader>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative mb-6">
              <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-in zoom-in-50 duration-300">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <div className="absolute inset-0 h-20 w-20 rounded-full bg-green-500/20 animate-ping" />
            </div>
            <DialogHeader className="text-center">
              <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Withdrawal Successful!
              </DialogTitle>
              <DialogDescription className="text-base text-slate-600 dark:text-slate-400">
                Your money has been sent to your M-Pesa number. You should receive a confirmation SMS shortly.
              </DialogDescription>
            </DialogHeader>
            <Button
              onClick={() => setShowSuccessModal(false)}
              className="mt-6 w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
