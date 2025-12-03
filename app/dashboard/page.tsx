import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/stats-card'
import { Users, FolderKanban, Activity, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ActivityChart } from '@/components/activity-chart'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get current user's role and tenant
  let { data: currentUser, error: userError } = await supabase
    .from('users')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  if (!currentUser) {
    // If user record doesn't exist, redirect to login
    // The demo route should have created it, but if it didn't, user needs to try again
    console.error('User record not found in dashboard:', userError)
    console.error('User ID:', user.id, 'Email:', user.email)
    
    // Don't try to create it here - let the demo route handle it
    // This prevents server errors if service role key isn't available
    redirect('/login?error=user_record_missing')
  }

  // Get stats based on user role
  let usersQuery = supabase.from('users').select('id', { count: 'exact', head: true })
  let projectsQuery = supabase.from('projects').select('id', { count: 'exact', head: true })
  let activityQuery = supabase.from('activity_logs').select('id', { count: 'exact', head: true })

  if (currentUser.role !== 'admin') {
    usersQuery = usersQuery.eq('tenant_id', currentUser.tenant_id)
    projectsQuery = projectsQuery.eq('tenant_id', currentUser.tenant_id)
    activityQuery = activityQuery.eq('tenant_id', currentUser.tenant_id)
  }

  const [usersCount, projectsCount, activityCount] = await Promise.all([
    usersQuery,
    projectsQuery,
    activityQuery,
  ])

  // Get recent activity for chart (last 30 days)
  let chartQuery = supabase
    .from('activity_logs')
    .select('created_at')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: true })

  if (currentUser.role !== 'admin') {
    chartQuery = chartQuery.eq('tenant_id', currentUser.tenant_id)
  }

  const { data: activityData } = await chartQuery

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
            value={usersCount.count || 0}
            icon={Users}
            description="Active users in your organization"
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Total Projects"
            value={projectsCount.count || 0}
            icon={FolderKanban}
            description="Projects across all tenants"
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Recent Activity"
            value={activityCount.count || 0}
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

