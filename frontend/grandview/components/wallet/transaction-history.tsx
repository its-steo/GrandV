"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History, ArrowUpRight, ArrowDownLeft, Plus, Minus, Users, Eye } from "lucide-react"
import { ApiService } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"

interface Transaction {
  id: number
  transaction_type: string
  amount: string
  description: string
  created_at: string
  status?: string
}

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await ApiService.getTransactionHistory()
        setTransactions(data)
      } catch (error) {
        console.error("Failed to fetch transactions:", error)
        setTransactions([])
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "DEPOSIT":
        return <Plus className="h-4 w-4 text-blue-400" />
      case "EARNING":
      case "views_earning":
        return <Eye className="h-4 w-4 text-green-400" />
      case "COMMISSION":
      case "referral_commission":
        return <Users className="h-4 w-4 text-purple-400" />
      case "WITHDRAW_PENDING":
      case "WITHDRAW_COMPLETED":
      case "withdrawal":
        return <Minus className="h-4 w-4 text-orange-400" />
      case "PURCHASE":
      case "package_purchase":
        return <ArrowUpRight className="h-4 w-4 text-red-400" />
      default:
        return <ArrowDownLeft className="h-4 w-4 text-gray-300" />
    }
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return null
    const statusMap = {
      PENDING: { variant: "secondary" as const, label: "Pending", className: "bg-teal-500/20 text-teal-300 border-teal-500/30" },
      COMPLETED: { variant: "default" as const, label: "Completed", className: "bg-green-500/20 text-green-300 border-green-500/30" },
      CANCELLED: { variant: "destructive" as const, label: "Cancelled", className: "bg-red-500/20 text-red-300 border-red-500/30" },
    }
    const config = statusMap[status as keyof typeof statusMap]
    if (!config) return null
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>
  }

  const getTransactionColor = (type: string, amount: string) => {
    const isNegative = amount.startsWith("-")
    if (isNegative) {
      return "text-red-400"
    }
    switch (type) {
      case "DEPOSIT":
        return "text-blue-400"
      case "EARNING":
      case "views_earning":
        return "text-green-400"
      case "COMMISSION":
      case "referral_commission":
        return "text-purple-400"
      case "PURCHASE":
        return "text-red-400"
      default:
        return "text-gray-300"
    }
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <History className="h-6 w-6 text-white" />
            <span className="font-bold">Transaction History</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-800 rounded-lg animate-pulse"></div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <History className="h-6 w-6 text-white" />
          <span className="font-bold">Transaction History</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-white">No Transactions Yet</h3>
            <p className="text-gray-300 text-lg">Your transaction history will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction, index) => (
              <div
                key={transaction.id}
                className="flex items-center gap-4 p-4 rounded-lg glass-card border-white/20 hover:border-white/30 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex-shrink-0 p-2 rounded-lg bg-white/10">
                  {getTransactionIcon(transaction.transaction_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-white">{transaction.description}</p>
                  <p className="text-xs text-gray-300">
                    {new Date(transaction.created_at).toLocaleDateString()} at{" "}
                    {new Date(transaction.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(transaction.status)}
                  <span
                    className={`text-lg font-bold ${getTransactionColor(transaction.transaction_type, transaction.amount)}`}
                  >
                    {transaction.amount.startsWith("-") ? "" : "+"}{" "}
                    {formatCurrency(Math.abs(Number.parseFloat(transaction.amount)))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TransactionHistory
