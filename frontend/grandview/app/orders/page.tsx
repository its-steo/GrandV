"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { OrderManagement } from "@/components/orders/order-management"

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <Sidebar />
      <div className="ml-0 md:ml-64 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <OrderManagement />
        </div>
      </div>
    </div>
  )
}
