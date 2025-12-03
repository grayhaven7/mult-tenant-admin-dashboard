import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ActivityLogTable } from '@/components/activity-log-table'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ActivityPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get current user's role and tenant
  const { data: currentUser } = await supabase
    .from('users')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  if (!currentUser) {
    redirect('/login')
  }

  // Get activity logs
  let activityQuery = supabase
    .from('activity_logs')
    .select(`
      *,
      user:users!activity_logs_user_id_fkey(id, full_name, avatar_url, email)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (currentUser.role !== 'admin') {
    activityQuery = activityQuery.eq('tenant_id', currentUser.tenant_id)
  }

  const { data: activityLogs } = await activityQuery

  // Get users for filter
  let usersQuery = supabase
    .from('users')
    .select('id, full_name, email')
    .order('full_name')

  if (currentUser.role !== 'admin') {
    usersQuery = usersQuery.eq('tenant_id', currentUser.tenant_id)
  }

  const { data: users } = await usersQuery

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Activity Log</h1>
          <p className="text-muted-foreground">Track all actions and events across your organization</p>
        </div>

        <ActivityLogTable 
          initialLogs={activityLogs || []} 
          users={users || []}
        />
      </div>
    </DashboardLayout>
  )
}

