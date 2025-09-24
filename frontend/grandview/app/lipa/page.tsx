"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { LipaRegistrationForm } from "@/components/lipa/lipa-registration-form"
import { LipaProductBrowser } from "@/components/lipa/lipa-product-browser"
import { LipaSuccessActions } from "@/components/lipa/lipa-success-actions"
import { InstallmentOrderCard } from "@/components/lipa/installment-order-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CreditCard,
  Calendar,
  DollarSign,
  Loader2,
  Package,
  ShoppingCart,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
} from "lucide-react"
import { ApiService, type LipaRegistration, type InstallmentOrder } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

export default function LipaPage() {
  const [registration, setRegistration] = useState<LipaRegistration | null>(null)
  const [installmentOrders, setInstallmentOrders] = useState<InstallmentOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("registration")

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (registration?.status === "APPROVED" && activeTab === "registration") {
      setActiveTab("products")
    }
  }, [registration, activeTab])

  const fetchData = async () => {
    try {
      const [regData, ordersData] = await Promise.all([
        ApiService.getLipaRegistration().catch(() => null),
        ApiService.getInstallmentOrders().catch(() => []),
      ])
      setRegistration(regData)
      setInstallmentOrders(ordersData)
    } catch (error) {
      toast.error("Failed to load Lipa Mdogo Mdogo data")
      console.error("Failed to fetch Lipa data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegistrationUpdate = (newRegistration: LipaRegistration) => {
    setRegistration(newRegistration)
    if (newRegistration.status === "APPROVED") {
      setActiveTab("products")
      toast.success("Registration approved! You can now browse products for installment purchase.")
    }
    fetchData()
  }

  const handlePaymentSuccess = () => {
    fetchData()
  }

const calculateInstallmentStats = () => {
  // Define active statuses based on backend serializer
  const activeStatuses = ["ONGOING", "OVERDUE"];
  const completedStatuses = ["PAID"];

  // Filter active and completed orders
  const activeOrders = installmentOrders.filter((order) =>
    activeStatuses.includes(order.status.toUpperCase())
  );
  const completedOrders = installmentOrders.filter((order) =>
    completedStatuses.includes(order.status.toUpperCase())
  );

  // Calculate totalOwed and totalPaid
  const totalOwed = activeOrders.reduce((sum, order) => {
    const remaining = Number.parseFloat(order.remaining_amount || "0");
    return sum + (isNaN(remaining) ? 0 : remaining);
  }, 0);

  const totalPaid = installmentOrders.reduce((sum, order) => {
    // Calculate total_amount as in installment-order-card.tsx
    const initialDeposit = Number.parseFloat(order.initial_deposit || "0");
    const remainingAmount = Number.parseFloat(order.remaining_amount || "0");
    const paymentsSum = order.payments.reduce(
      (paymentSum, p) => paymentSum + Number.parseFloat(p.amount || "0"),
      0
    );
    const totalAmount = initialDeposit + remainingAmount + paymentsSum;
    const paidAmount = totalAmount - remainingAmount;
    return sum + (isNaN(paidAmount) ? 0 : paidAmount);
  }, 0);

  // Calculate overdue orders
  const overdueOrders = activeOrders.filter((order) => {
    const dueDate = new Date(order.next_payment_date);
    const today = new Date();
    return dueDate < today && !isNaN(dueDate.getTime());
  });

  return {
    activeOrders: activeOrders.length,
    completedOrders: completedOrders.length,
    totalOwed,
    totalPaid,
    overdueOrders: overdueOrders.length,
  };
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <Sidebar />
        <div className="ml-0 md:ml-64 p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-center h-32 sm:h-48 md:h-64">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    )
  }

  const isApproved = registration?.status === "APPROVED"
  const stats = calculateInstallmentStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <Sidebar />
      <div className="ml-0 md:ml-64 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">Lipa Mdogo Mdogo</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Buy now, pay later with our flexible installment program
            </p>
          </div>

          {isApproved && <LipaSuccessActions registration={registration} />}

          {isApproved && installmentOrders.length > 0 && (
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
              <Card className="glass-card border-white/20">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                      <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Active Plans</p>
                      <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.activeOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/20">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex-shrink-0">
                      <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Total Owed</p>
                      <p className="text-lg sm:text-2xl font-bold text-orange-600">{formatCurrency(stats.totalOwed)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/20">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Total Paid</p>
                      <p className="text-lg sm:text-2xl font-bold text-green-600">{formatCurrency(stats.totalPaid)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/20">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div
                      className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                        stats.overdueOrders > 0 ? "bg-red-100 dark:bg-red-900/30" : "bg-green-100 dark:bg-green-900/30"
                      }`}
                    >
                      {stats.overdueOrders > 0 ? (
                        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {stats.overdueOrders > 0 ? "Overdue" : "Completed"}
                      </p>
                      <p
                        className={`text-lg sm:text-2xl font-bold ${stats.overdueOrders > 0 ? "text-red-600" : "text-green-600"}`}
                      >
                        {stats.overdueOrders > 0 ? stats.overdueOrders : stats.completedOrders}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <TabsList className="glass grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
              <TabsTrigger
                value="registration"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3"
              >
                <CreditCard className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Registration</span>
                {registration && (
                  <Badge
                    className={`ml-0 sm:ml-1 text-xs ${
                      registration.status === "APPROVED"
                        ? "bg-green-500"
                        : registration.status === "PENDING"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    } text-white`}
                  >
                    {registration.status === "APPROVED" && <CheckCircle className="h-3 w-3 mr-1" />}
                    <span className="hidden sm:inline">
                      {registration.status
                        ? registration.status.charAt(0).toUpperCase() + registration.status.slice(1).toLowerCase()
                        : "Unknown"}
                    </span>
                  </Badge>
                )}
              </TabsTrigger>

              <TabsTrigger
                value="products"
                disabled={!isApproved}
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3"
              >
                <Package className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Products</span>
                {!isApproved && <span className="text-xs opacity-50 hidden sm:inline">(Approval Required)</span>}
              </TabsTrigger>

              <TabsTrigger value="orders" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3">
                <ShoppingCart className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Orders</span>
                {installmentOrders.length > 0 && (
                  <Badge variant="secondary" className="ml-0 sm:ml-1 text-xs">
                    {installmentOrders.length}
                  </Badge>
                )}
                {stats.overdueOrders > 0 && (
                  <Badge variant="destructive" className="ml-0 sm:ml-1 text-xs">
                    {stats.overdueOrders} Overdue
                  </Badge>
                )}
              </TabsTrigger>

              <TabsTrigger value="info" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3">
                <Calendar className="h-4 w-4" />
                <span className="text-xs sm:text-sm">How It Works</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="registration" className="space-y-4 sm:space-y-6">
              <LipaRegistrationForm registration={registration} onRegistrationUpdate={handleRegistrationUpdate} />
            </TabsContent>

            <TabsContent value="products" className="space-y-4 sm:space-y-6">
              {isApproved ? (
                <LipaProductBrowser registration={registration} />
              ) : (
                <Card className="glass-card border-white/20 text-center py-8 sm:py-12">
                  <CardContent className="px-4">
                    <Package className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Registration Required</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-4">
                      Complete your Lipa Mdogo Mdogo registration to access installment products.
                    </p>
                    <Button onClick={() => setActiveTab("registration")} className="w-full sm:w-auto">
                      Go to Registration
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="orders" className="space-y-4 sm:space-y-6">
              {installmentOrders.length > 0 ? (
                <div className="space-y-4">
                  {installmentOrders.map((order) => (
                    <InstallmentOrderCard key={order.id} order={order} onPaymentSuccess={handlePaymentSuccess} />
                  ))}
                </div>
              ) : (
                <Card className="glass-card border-white/20 text-center py-8 sm:py-12">
                  <CardContent className="px-4">
                    <ShoppingCart className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Installment Orders</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-4">
                      {isApproved
                        ? "Start shopping with installment payments to see your orders here."
                        : "Complete your registration to start making installment purchases."}
                    </p>
                    {isApproved ? (
                      <Button onClick={() => setActiveTab("products")} className="w-full sm:w-auto">
                        Browse Products
                      </Button>
                    ) : (
                      <Button onClick={() => setActiveTab("registration")} className="w-full sm:w-auto">
                        Complete Registration
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="info" className="space-y-4 sm:space-y-6">
              <Card className="glass-card border-white/20">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">How Lipa Mdogo Mdogo Works</CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Our flexible installment program makes shopping affordable and convenient.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="text-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-lg sm:text-xl">1</span>
                      </div>
                      <h3 className="font-semibold mb-2 text-sm sm:text-base">Register & Get Approved</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Submit your documents and get instant approval for qualified applicants
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-lg sm:text-xl">2</span>
                      </div>
                      <h3 className="font-semibold mb-2 text-sm sm:text-base">Shop & Pay Deposit</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Browse products and pay only 40% upfront at checkout
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-accent to-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-lg sm:text-xl">3</span>
                      </div>
                      <h3 className="font-semibold mb-2 text-sm sm:text-base">Pay Monthly</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Complete remaining balance in easy monthly installments
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2 text-sm sm:text-base">
                        Benefits
                      </h4>
                      <ul className="text-xs sm:text-sm text-green-600 dark:text-green-400 space-y-1">
                        <li>• Only 40% deposit required</li>
                        <li>• 0% interest for approved customers</li>
                        <li>• Flexible payment terms (3, 6, or 12 months)</li>
                        <li>• Instant approval process</li>
                        <li>• No hidden fees</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 text-sm sm:text-base">
                        Requirements
                      </h4>
                      <ul className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 space-y-1">
                        <li>• Valid government ID</li>
                        <li>• Passport-size photo</li>
                        <li>• Proof of address</li>
                        <li>• Must be 18+ years old</li>
                        <li>• Active phone number</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
