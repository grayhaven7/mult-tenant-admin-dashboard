import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ActivityLogTable } from '@/components/activity-log-table'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { sql } from '@vercel/postgres'
import type { ActivityLog, User, ActivityLogWithRelations } from '@/types/database'

export default async function ActivityPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const userId = session.user.id
  const userRole = session.user.role
  const tenantId = session.user.tenantId

  // Get current user's role and tenant
  const currentUserResult = await sql`
    SELECT role, tenant_id
    FROM users
    WHERE id = ${userId}
  `

  if (currentUserResult.rows.length === 0) {
    redirect('/login')
  }

  const currentUser = currentUserResult.rows[0]
  const isAdmin = currentUser.role === 'admin'

  // Get activity logs with user info
  let activityQuery = sql`
    SELECT 
      al.*,
      u.id as user_id,
      u.full_name as user_full_name,
      u.avatar_url as user_avatar_url,
      u.email as user_email
    FROM activity_logs al
    JOIN users u ON al.user_id = u.id
    ORDER BY al.created_at DESC
    LIMIT 100
  `

  if (!isAdmin) {
    activityQuery = sql`
      SELECT 
        al.*,
        u.id as user_id,
        u.full_name as user_full_name,
        u.avatar_url as user_avatar_url,
        u.email as user_email
      FROM activity_logs al
      JOIN users u ON al.user_id = u.id
      WHERE al.tenant_id = ${currentUser.tenant_id}
      ORDER BY al.created_at DESC
      LIMIT 100
    `
  }

  const activityResult = await activityQuery
  const activityLogs: ActivityLogWithRelations[] = activityResult.rows.map(row => ({
    id: row.id,
    user_id: row.user_id,
    action: row.action,
    details: row.details,
    tenant_id: row.tenant_id,
    created_at: row.created_at,
    user: {
      id: row.user_id,
      email: row.user_email,
      full_name: row.user_full_name,
      role: 'user' as const,
      tenant_id: row.tenant_id,
      avatar_url: row.user_avatar_url,
      created_at: '',
    },
  }))

  // Get users for filter
  let usersQuery = sql`
    SELECT id, full_name, email, role, tenant_id, avatar_url, created_at
    FROM users
    ORDER BY full_name
  `

  if (!isAdmin) {
    usersQuery = sql`
      SELECT id, full_name, email, role, tenant_id, avatar_url, created_at
      FROM users
      WHERE tenant_id = ${currentUser.tenant_id}
      ORDER BY full_name
    `
  }

  const usersResult = await usersQuery
  const users: User[] = usersResult.rows.map(row => ({
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    role: row.role,
    tenant_id: row.tenant_id,
    avatar_url: row.avatar_url,
    created_at: row.created_at,
  }))

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Activity Log</h1>
          <p className="text-muted-foreground">Track all actions and events across your organization</p>
        </div>

        <ActivityLogTable 
          initialLogs={activityLogs} 
          users={users}
        />
      </div>
    </DashboardLayout>
  )
}
