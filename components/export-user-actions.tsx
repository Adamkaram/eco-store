import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { getUserActions } from '@/lib/actions/userActions'

export function ExportUserActions({ userId }: { userId: string }) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const actions = await getUserActions(userId)
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Action Type,Details,Date\n"
        + actions.map(action => {
          return `${action.action_type},"${JSON.stringify(action.action_details)}",${action.created_at}`
        }).join("\n")

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `user_actions_${userId}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error exporting user actions:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button onClick={handleExport} disabled={isExporting}>
      {isExporting ? 'Exporting...' : 'Export User Actions'}
    </Button>
  )
}

