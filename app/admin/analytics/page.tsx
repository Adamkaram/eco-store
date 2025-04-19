"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"

type AnalyticsData = {
  date: string
  orders: number
  revenue: number
}

type CustomerGrowthData = {
  date: string
  newCustomers: number
}

type TopSellingProduct = {
  name: string
  sales: number
}

type CategorySales = {
  category: string
  sales: number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function AnalyticsPage() {
  const [revenueData, setRevenueData] = useState<AnalyticsData[]>([])
  const [customerGrowthData, setCustomerGrowthData] = useState<CustomerGrowthData[]>([])
  const [topSellingProducts, setTopSellingProducts] = useState<TopSellingProduct[]>([])
  const [categorySales, setCategorySales] = useState<CategorySales[]>([])
  const [averageOrderValue, setAverageOrderValue] = useState<AnalyticsData[]>([])
  const [timeRange, setTimeRange] = useState("30")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - Number.parseInt(timeRange))

      const [revenueResponse, customerResponse] = await Promise.all([
        supabase.rpc("get_revenue_over_time", {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        }),
        supabase.rpc("get_customer_growth", {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        }),
      ])

      if (revenueResponse.error) throw revenueResponse.error
      if (customerResponse.error) throw customerResponse.error

      setRevenueData(revenueResponse.data || [])
      setCustomerGrowthData(customerResponse.data || [])

      // Simulated data for additional charts
      setTopSellingProducts([
        { name: "Product A", sales: 120 },
        { name: "Product B", sales: 80 },
        { name: "Product C", sales: 70 },
        { name: "Product D", sales: 50 },
        { name: "Product E", sales: 30 },
      ])

      setCategorySales([
        { category: "Electronics", sales: 5000 },
        { category: "Clothing", sales: 3500 },
        { category: "Books", sales: 2000 },
        { category: "Home & Garden", sales: 1500 },
        { category: "Toys", sales: 1000 },
      ])

      setAverageOrderValue(
        revenueResponse.data.map((item: AnalyticsData) => ({
          ...item,
          averageOrderValue: item.orders > 0 ? (item.revenue / item.orders).toFixed(2) : "0.00",
        })),
      )
    } catch (error: any) {
      console.error("Error fetching analytics data:", error)
      setError(error.message || "An error occurred while fetching analytics data.")
      toast({
        title: "Error",
        description: "Failed to fetch analytics data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Analytics</CardTitle>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue and Orders Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="orders" fill="#8884d8" name="Orders" />
                    <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={customerGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="newCustomers" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topSellingProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categorySales}
                      dataKey="sales"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {categorySales.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Average Order Value Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={averageOrderValue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`$${value}`, "Average Order Value"]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line type="monotone" dataKey="averageOrderValue" stroke="#82ca9d" name="Average Order Value" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

