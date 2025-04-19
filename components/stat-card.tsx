import { Card } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
}

export function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        {icon}
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value.toString()}</p>
        </div>
      </div>
    </Card>
  )
}

