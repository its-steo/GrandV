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
        return <Plus className="h-4 w-4 text-blue-500" />
      case "EARNING":
      case "views_earning":
        return <Eye className="h-4 w-4 text-green-500" />
      case "COMMISSION":
      case "referral_commission":
        return <Users className="h-4 w-4 text-purple-500" />
      case "WITHDRAW_PENDING":
      case "WITHDRAW_COMPLETED":
      case "withdrawal":
        return <Minus className="h-4 w-4 text-orange-500" />
      case "PURCHASE":
      case "package_purchase":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
      default:
        return <ArrowDownLeft className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return null
    const statusMap = {
      PENDING: { variant: "secondary" as const, label: "Pending" },
      COMPLETED: { variant: "default" as const, label: "Completed" },
      CANCELLED: { variant: "destructive" as const, label: "Cancelled" },
    }
    const config = statusMap[status as keyof typeof statusMap]
    if (!config) return null
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getTransactionColor = (type: string, amount: string) => {
    const isNegative = amount.startsWith("-")
    if (isNegative) {
      return "text-red-600"
    }
    switch (type) {
      case "DEPOSIT":
        return "text-blue-600"
      case "EARNING":
      case "views_earning":
        return "text-green-600"
      case "COMMISSION":
      case "referral_commission":
        return "text-purple-600"
      case "PURCHASE":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  if (loading) {
    return (
      <Card className="glass-bright border-white/30 neon-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <History className="h-6 w-6 text-gray-400 neon-glow" />
            <span className="neon-text">Transaction History</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 glass rounded-lg animate-pulse"></div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-bright border-white/30 scale-on-hover neon-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <History className="h-6 w-6 text-gray-400 neon-glow" />
          <span className="neon-text">Transaction History</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <History className="h-16 w-16 text-muted-foreground mx-auto mb-4 neon-glow" />
            <h3 className="text-xl font-semibold mb-2 neon-text">No Transactions Yet</h3>
            <p className="text-muted-foreground text-lg">Your transaction history will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction, index) => (
              <div
                key={transaction.id}
                className="flex items-center gap-4 p-4 rounded-lg glass border border-white/10 hover:border-white/20 transition-all duration-300 scale-on-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex-shrink-0 p-2 rounded-lg glass">
                  {getTransactionIcon(transaction.transaction_type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(transaction.created_at).toLocaleDateString()} at{" "}
                    {new Date(transaction.created_at).toLocaleTimeString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(transaction.status)}
                  <span
                    className={`text-lg font-bold ${getTransactionColor(transaction.transaction_type, transaction.amount)} neon-text`}
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
