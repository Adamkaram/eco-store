import { SidebarProvider } from "@/components/ui/sidebar"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        {children}
      </div>
    </SidebarProvider>
  )
}

