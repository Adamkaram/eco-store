import { useState, useEffect } from 'react'
import { getUserActions } from '@/lib/actions/userActions'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type UserAction = {
  id: string
  user_id: string
  action_type: string
  action_details: any
  created_at: string
}

export function UserActions({ userId }: { userId: string }) {
  const [actions, setActions] = useState<UserAction[]>([])

  useEffect(() => {
    fetchUserActions()
  }, [userId])

  const fetchUserActions = async () => {
    const userActions = await getUserActions(userId)
    setActions(userActions)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Action Type</TableHead>
          <TableHead>Details</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {actions.map((action) => (
          <TableRow key={action.id}>
            <TableCell>{action.action_type}</TableCell>
            <TableCell>{JSON.stringify(action.action_details)}</TableCell>
            <TableCell>{new Date(action.created_at).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

