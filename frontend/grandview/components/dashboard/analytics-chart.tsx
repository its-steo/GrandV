"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, BarChart3, PieChart, LineChart } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

interface AnalyticsData {
  period: string
  earnings: number
  views: number
  clicks: number
  conversion: number
}

const mockData: AnalyticsData[] = [
  { period: "Jan", earnings: 1200, views: 2400, clicks: 180, conversion: 7.5 },
  { period: "Feb", earnings: 1800, views: 3200, clicks: 240, conversion: 7.8 },
  { period: "Mar", earnings: 2200, views: 3800, clicks: 290, conversion: 8.2 },
  { period: "Apr", earnings: 1900, views: 3400, clicks: 260, conversion: 7.9 },
  { period: "May", earnings: 2800, views: 4200, clicks: 350, conversion: 8.5 },
  { period: "Jun", earnings: 3200, views: 4800, clicks: 420, conversion: 8.8 },
]

export function AnalyticsChart() {
  const [activeTab, setActiveTab] = useState<"earnings" | "views" | "conversion">("earnings")
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d")

  const getChartData = () => {
    switch (activeTab) {
      case "earnings":
        return mockData.map((d) => d.earnings)
      case "views":
        return mockData.map((d) => d.views)
      case "conversion":
        return mockData.map((d) => d.conversion)
      default:
        return mockData.map((d) => d.earnings)
    }
  }

  const chartData = getChartData()
  const maxValue = Math.max(...chartData)

  const BarChart = ({ data }: { data: number[] }) => (
    <div className="flex items-end justify-between h-48 gap-2 mt-6">
      {data.map((value, index) => {
        const height = (value / maxValue) * 100
        return (
          <div key={index} className="flex flex-col items-center gap-2 flex-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
              className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-md min-h-[4px] relative group"
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap">
                {activeTab === "conversion" ? `${value}%` : value.toLocaleString()}
              </div>
            </motion.div>
            <span className="text-xs text-muted-foreground font-medium">{mockData[index].period}</span>
          </div>
        )
      })}
    </div>
  )

  const totalValue = chartData.reduce((sum, value) => sum + value, 0)
  const avgValue = totalValue / chartData.length
  const growth = ((chartData[chartData.length - 1] - chartData[0]) / chartData[0]) * 100

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              Performance Analytics
            </CardTitle>
            <CardDescription>Track your advertising performance and earnings over time</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={timeRange === "7d" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("7d")}>
              7D
            </Button>
            <Button variant={timeRange === "30d" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("30d")}>
              30D
            </Button>
            <Button variant={timeRange === "90d" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("90d")}>
              90D
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Metrics Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { key: "earnings" as const, label: "Earnings", icon: TrendingUp, color: "primary" },
            { key: "views" as const, label: "Ad Views", icon: LineChart, color: "success" },
            { key: "conversion" as const, label: "Conversion", icon: PieChart, color: "info" },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 rounded-lg bg-secondary/20 border border-secondary/30">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-foreground">
              {activeTab === "conversion" ? `${totalValue.toFixed(1)}%` : totalValue.toLocaleString()}
            </p>
          </div>
          <div className="text-center p-4 rounded-lg bg-secondary/20 border border-secondary/30">
            <p className="text-sm text-muted-foreground">Average</p>
            <p className="text-2xl font-bold text-foreground">
              {activeTab === "conversion" ? `${avgValue.toFixed(1)}%` : Math.round(avgValue).toLocaleString()}
            </p>
          </div>
          <div className="text-center p-4 rounded-lg bg-secondary/20 border border-secondary/30">
            <p className="text-sm text-muted-foreground">Growth</p>
            <div className="flex items-center justify-center gap-1">
              <p className="text-2xl font-bold text-success">
                {growth > 0 ? "+" : ""}
                {growth.toFixed(1)}%
              </p>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
          </div>
        </div>

        {/* Chart */}
        <BarChart data={chartData} />

        {/* Insights */}
        <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5">
              <TrendingUp className="h-3 w-3 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Performance Insight</h4>
              <p className="text-sm text-muted-foreground">
                Your {activeTab} has grown by {growth.toFixed(1)}% over the selected period.
                {growth > 10
                  ? " Excellent performance!"
                  : growth > 0
                    ? " Keep up the good work!"
                    : " Consider optimizing your strategy."}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
