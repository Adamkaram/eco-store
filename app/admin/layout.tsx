import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <DashboardShell>
        <DashboardSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </DashboardShell>
    </SidebarProvider>
  )
}

