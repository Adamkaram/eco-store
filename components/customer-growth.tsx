"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type GrowthData = {
  date: string
  totalCustomers: number
}

export function CustomerGrowth() {
  const [data, setData] = useState<GrowthData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState("30") // Default to 30 days
  const supabase = getSupabaseClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchCustomerGrowthData()
  }, [timeRange])

  const fetchCustomerGrowthData = async () => {
    try {
      setLoading(true)
      setError(null)
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - Number.parseInt(timeRange))

      const { data, error } = await supabase.rpc("get_customer_growth", {
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
      })

      if (error) throw error

      let cumulativeTotal = 0
      const formattedData = data.map((item: any) => {
        cumulativeTotal += Number(item.new_customers)
        return {
          date: new Date(item.date).toLocaleDateString(),
          totalCustomers: cumulativeTotal,
        }
      })

      setData(formattedData)
    } catch (error: any) {
      console.error("Error fetching customer growth data:", error)
      setError(error.message || "An error occurred while fetching customer growth data")
      toast({
        title: "Error",
        description: "Failed to fetch customer growth data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      <Select value={timeRange} onValueChange={handleTimeRangeChange}>
        <SelectTrigger className="w-[180px] mb-4">
          <SelectValue placeholder="Select time range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7">Last 7 days</SelectItem>
          <SelectItem value="30">Last 30 days</SelectItem>
          <SelectItem value="90">Last 90 days</SelectItem>
        </SelectContent>
      </Select>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
          <YAxis />
          <Tooltip
            labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
            formatter={(value: number) => [`${value} new customers`, "New Customers"]}
          />
          <Line
            type="monotone"
            dataKey="totalCustomers"
            stroke="#8884d8"
            strokeWidth={2}
            dot={false}
            name="New Customers"
          />
        </LineChart>
      </ResponsiveContainer>
    </>
  )
}

