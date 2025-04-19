"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { getSupabaseClient } from "@/lib/supabase/client"

type RevenueData = {
  date: string
  revenue: number
}

export function RevenueChart() {
  const [data, setData] = useState<RevenueData[]>([])
  const supabase = getSupabaseClient()

  useEffect(() => {
    fetchRevenueData()
  }, [])

  const fetchRevenueData = async () => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data, error } = await supabase.rpc("get_revenue_over_time", {
      start_date: thirtyDaysAgo.toISOString().split("T")[0],
      end_date: new Date().toISOString().split("T")[0],
    })

    if (error) {
      console.error("Error fetching revenue data:", error)
      return
    }

    setData(
      data.map((item) => ({
        date: item.date,
        revenue: Number(item.revenue),
      })),
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  )
}

