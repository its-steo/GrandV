
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, PieChart } from "lucide-react"
import { ApiService } from "@/lib/api"
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js"
import { Pie } from "react-chartjs-2"

// Register Chart.js components
Chart.register(ArcElement, Tooltip, Legend)

// Glassmorphism styles
const glassmorphismStyles = `
  .glass-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
  }
  .glass-card:hover {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
  .dark .glass-card {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }
  .dark .glass-card:hover {
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.25);
  }
`

interface ActivityMetrics {
  action_counts: { [key: string]: number }
  total_activities: number
}

export function AnalyticsChart() {
  const [activeTab, setActiveTab] = useState<"action_counts">("action_counts")
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d")
  const [metrics, setMetrics] = useState<ActivityMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
  }, [timeRange])

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      const activities = await ApiService.getRecentActivities(1, 100)
      const actionCounts: { [key: string]: number } = {}

      // Type guard for activity object
      function isActivity(obj: unknown): obj is { action_display: string } {
        if (typeof obj !== "object" || obj === null) {
          return false
        }
        const activity = obj as Record<string, unknown>
        return (
          "action_display" in activity &&
          typeof activity.action_display === "string"
        )
      }

      activities.results.forEach((activity: unknown) => {
        if (isActivity(activity)) {
          actionCounts[activity.action_display] = (actionCounts[activity.action_display] || 0) + 1
        }
      })
      setMetrics({
        action_counts: actionCounts,
        total_activities: activities.results.length,
      })
    } catch (error) {
      console.error("Failed to fetch metrics:", error)
    } finally {
      setLoading(false)
    }
  }

  const getPieChartData = () => {
    if (!metrics || !metrics.action_counts) {
      return {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
          },
        ],
      }
    }

    const labels = Object.keys(metrics.action_counts)
    const data = Object.values(metrics.action_counts)
    const backgroundColor = [
      "#FF6B6B", // Vibrant Red
      "#4ECDC4", // Bright Teal
      "#FFD93D", // Maize Yellow
      "#6AB04C", // Vivid Green
      "#FF8C94", // Soft Pink
      "#5E60CE", // Bright Purple
      "#F48C06", // Orange
    ].slice(0, labels.length)

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor,
          borderColor: backgroundColor.map(color => color.replace("0.6", "1")),
          borderWidth: 1,
        },
      ],
    }
  }

  const totalActivities = metrics?.total_activities || 0
  const avgActivitiesPerDay = totalActivities / (timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90)
  const growth = totalActivities > 0 ? ((totalActivities - (totalActivities * 0.9)) / (totalActivities * 0.9)) * 100 : 0

  return (
    <>
      <style>{glassmorphismStyles}</style>
      <Card className="glass-card text-white shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl font-bold">
                <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                  <PieChart className="h-4 w-4 text-white" />
                </div>
                Performance Analytics
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-gray-300">
                Track your activity distribution over time
              </CardDescription>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant={timeRange === "7d" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("7d")}
                className="text-xs sm:text-sm bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                7D
              </Button>
              <Button
                variant={timeRange === "30d" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("30d")}
                className="text-xs sm:text-sm bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                30D
              </Button>
              <Button
                variant={timeRange === "90d" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("90d")}
                className="text-xs sm:text-sm bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                90D
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
            <Button
              variant={activeTab === "action_counts" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("action_counts")}
              className="flex items-center gap-2 text-xs sm:text-sm bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <PieChart className="h-4 w-4" />
              Activity Distribution
            </Button>
          </div>

          {loading ? (
            <p className="text-gray-300 text-center">Loading metrics...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className="text-center p-3 sm:p-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 shadow-sm">
                  <p className="text-xs sm:text-sm text-gray-300">Total Activities</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{totalActivities}</p>
                </div>
                <div className="text-center p-3 sm:p-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 shadow-sm">
                  <p className="text-xs sm:text-sm text-gray-300">Avg. Activities/Day</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">{avgActivitiesPerDay.toFixed(1)}</p>
                </div>
                <div className="text-center p-3 sm:p-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 shadow-sm">
                  <p className="text-xs sm:text-sm text-gray-300">Growth</p>
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-400">{growth > 0 ? "+" : ""}{growth.toFixed(1)}%</p>
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="w-full h-48 sm:h-64 md:h-80 max-w-full mx-auto">
                <Pie
                  data={getPieChartData()}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          font: {
                            size: window.innerWidth < 640 ? 10 : 12,
                          },
                          color: "#FFFFFF",
                        },
                      },
                      tooltip: {
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        titleFont: { size: window.innerWidth < 640 ? 12 : 14 },
                        bodyFont: { size: window.innerWidth < 640 ? 10 : 12 },
                      },
                    },
                  }}
                />
              </div>

              <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <TrendingUp className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1 text-sm sm:text-base">Performance Insight</h4>
                    <p className="text-xs sm:text-sm text-gray-300">
                      Your activity distribution shows {totalActivities} total actions.
                      {growth > 10
                        ? " Excellent engagement!"
                        : growth > 0
                          ? " Keep up the good work!"
                          : " Consider increasing your activity."}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  )
}
