"use client"

import { Home, ShoppingBag, Users, BarChart, Settings, Package } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import Link from 'next/link'

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/admin/dashboard" },
  { icon: ShoppingBag, label: "Orders", href: "/admin/orders" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: Users, label: "Customers", href: "/admin/customers" },
  { icon: BarChart, label: "Analytics", href: "/admin/analytics" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
]

export function DashboardSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <h2 className="text-xl font-bold px-6 py-4">Glow Beauty Admin</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild>
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}

