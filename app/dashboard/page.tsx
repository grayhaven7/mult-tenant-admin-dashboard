import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/stats-card'
import { Users, FolderKanban, Activity, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ActivityChart } from '@/components/activity-chart'
import { createClient as createServiceClient } from '@supabase/supabase-js'

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
    // If user record doesn't exist, try to create it using service role
    console.error('User record not found in dashboard:', userError)
    console.error('User ID:', user.id, 'Email:', user.email)
    
    // Try to create the user record - this should have been done by the demo route
    // But if it wasn't, we'll try here as a fallback
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (serviceKey) {
      const serviceClient = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey
      )
      
      // Get or create tenant
      let { data: tenants } = await serviceClient
        .from('tenants')
        .select('id')
        .limit(1)
      
      let tenantId = tenants?.[0]?.id
      
      if (!tenantId) {
        const { data: newTenant } = await serviceClient
          .from('tenants')
          .insert({ name: 'Acme Corporation' })
          .select('id')
          .single()
        tenantId = newTenant?.id
      }
      
      if (tenantId) {
        const { data: createdUser } = await serviceClient
          .from('users')
          .upsert({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || 'User',
            role: 'admin',
            tenant_id: tenantId,
          }, {
            onConflict: 'id'
          })
          .select()
          .single()
        
        if (createdUser) {
          console.log('User record created in dashboard fallback:', createdUser.id)
          // Wait a moment for the record to be committed
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // Retry getting the user with regular client
          const { data: retryUser, error: retryError } = await supabase
            .from('users')
            .select('role, tenant_id')
            .eq('id', user.id)
            .single()
          
          if (retryUser) {
            console.log('Successfully retrieved user after creation:', retryUser)
            currentUser = retryUser
          } else {
            console.error('Failed to retrieve user after creation:', retryError)
            // Try one more time with service client to verify it exists
            const { data: serviceUser } = await serviceClient
              .from('users')
              .select('role, tenant_id')
              .eq('id', user.id)
              .single()
            
            if (serviceUser) {
              console.log('User exists when queried with service client, RLS may be blocking')
              // Use the service client data directly
              currentUser = serviceUser
            }
          }
        }
      }
    }
    
    // If still no user, redirect
    if (!currentUser) {
      redirect('/login?error=user_record_missing')
    }
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

