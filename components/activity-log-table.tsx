'use client'

import { useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Sparkles, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ActivityLogWithRelations, User } from '@/types/database'
import { ActivitySummaryDialog } from './activity-summary-dialog'

interface ActivityLogTableProps {
  initialLogs: ActivityLogWithRelations[]
  users: User[]
}

const actionIcons: Record<string, string> = {
  'created project': '✨',
  'edited project': '✏️',
  'deleted project': '🗑️',
  'user logged in': '🔐',
  'user signed up': '👤',
  'invited user': '📧',
}

export function ActivityLogTable({ initialLogs, users }: ActivityLogTableProps) {
  const [logs, setLogs] = useState(initialLogs)
  const [searchQuery, setSearchQuery] = useState('')
  const [userFilter, setUserFilter] = useState<string>('all')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = 
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesUser = userFilter === 'all' || log.user_id === userFilter
      const matchesAction = actionFilter === 'all' || log.action === actionFilter
      return matchesSearch && matchesUser && matchesAction
    })
  }, [logs, searchQuery, userFilter, actionFilter])

  const uniqueActions = useMemo(() => {
    return Array.from(new Set(logs.map((log) => log.action)))
  }, [logs])

  const handleSummarize = async () => {
    setIsLoadingSummary(true)
    setIsSummaryOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activity logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-border bg-background text-foreground"
        >
          <option value="all">All Users</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.full_name || user.email}
            </option>
          ))}
        </select>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-border bg-background text-foreground"
        >
          <option value="all">All Actions</option>
          {uniqueActions.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>
        <Button onClick={handleSummarize} disabled={isLoadingSummary} className="gap-2">
          {isLoadingSummary ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Summarize Activity
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No activity logs found
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-accent/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={log.user.avatar_url || undefined} />
                        <AvatarFallback>
                          {log.user.full_name?.[0] || log.user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">
                          {log.user.full_name || 'Unknown User'}
                        </div>
                        <div className="text-xs text-muted-foreground">{log.user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{actionIcons[log.action] || '📝'}</span>
                      <span className="text-sm">{log.action}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {log.details || '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ActivitySummaryDialog
        open={isSummaryOpen}
        onOpenChange={setIsSummaryOpen}
        logs={logs.slice(0, 50)}
      />
    </div>
  )
}

