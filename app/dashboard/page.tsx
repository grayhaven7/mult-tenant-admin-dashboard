import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/stats-card'
import { Users, FolderKanban, Activity, TrendingUp } from 'lucide-react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ActivityChart } from '@/components/activity-chart'
import { sql } from '@vercel/postgres'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const userId = session.user.id
  const userRole = session.user.role
  const tenantId = session.user.tenantId

  // Get current user's role and tenant (verify from database)
  const currentUser = await sql`
    SELECT role, tenant_id
    FROM users
    WHERE id = ${userId}
  `

  if (currentUser.rows.length === 0) {
    redirect('/login?error=user_record_missing')
  }

  const user = currentUser.rows[0]
  const isAdmin = user.role === 'admin'

  // Get stats based on user role
  let usersCountQuery = sql`SELECT COUNT(*) as count FROM users`
  let projectsCountQuery = sql`SELECT COUNT(*) as count FROM projects`
  let activityCountQuery = sql`SELECT COUNT(*) as count FROM activity_logs`

  if (!isAdmin) {
    usersCountQuery = sql`SELECT COUNT(*) as count FROM users WHERE tenant_id = ${user.tenant_id}`
    projectsCountQuery = sql`SELECT COUNT(*) as count FROM projects WHERE tenant_id = ${user.tenant_id}`
    activityCountQuery = sql`SELECT COUNT(*) as count FROM activity_logs WHERE tenant_id = ${user.tenant_id}`
  }

  const [usersCountResult, projectsCountResult, activityCountResult] = await Promise.all([
    usersCountQuery,
    projectsCountQuery,
    activityCountQuery,
  ])

  const usersCount = parseInt(usersCountResult.rows[0].count)
  const projectsCount = parseInt(projectsCountResult.rows[0].count)
  const activityCount = parseInt(activityCountResult.rows[0].count)

  // Get recent activity for chart (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  
  let activityQuery = sql`
    SELECT created_at
    FROM activity_logs
    WHERE created_at >= ${thirtyDaysAgo}
    ORDER BY created_at ASC
  `

  if (!isAdmin) {
    activityQuery = sql`
      SELECT created_at
      FROM activity_logs
      WHERE tenant_id = ${user.tenant_id}
        AND created_at >= ${thirtyDaysAgo}
      ORDER BY created_at ASC
    `
  }

  const activityResult = await activityQuery
  const activityData = activityResult.rows.map(row => ({
    created_at: row.created_at as string
  }))

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your organization.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Users"
            value={usersCount}
            icon={Users}
            description="Active users in your organization"
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Total Projects"
            value={projectsCount}
            icon={FolderKanban}
            description="Projects across all tenants"
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Recent Activity"
            value={activityCount}
            icon={Activity}
            description="Activity logs this month"
            trend={{ value: 15, isPositive: true }}
          />
          <StatsCard
            title="Growth Rate"
            value={24}
            icon={TrendingUp}
            description="Overall growth percentage"
            trend={{ value: 5, isPositive: true }}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ActivityChart data={activityData || []} />
        </div>
      </div>
    </DashboardLayout>
  )
}
