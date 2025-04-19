import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Search } from "lucide-react"

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b">
      <div className="flex items-center">
        <SidebarTrigger />
        <h1 className="text-2xl font-bold ml-4">Dashboard</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input type="search" placeholder="Search..." className="pl-8 w-64" />
        </div>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}

