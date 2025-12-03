import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { SettingsContent } from '@/components/settings-content'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get current user with full details
  const { data: currentUser } = await supabase
    .from('users')
    .select('*, tenant:tenants(*)')
    .eq('id', user.id)
    .single()

  if (!currentUser) {
    redirect('/login')
  }

  // Get all users if admin
  let usersQuery = supabase
    .from('users')
    .select('*, tenant:tenants(*)')
    .order('created_at', { ascending: false })

  if (currentUser.role !== 'admin') {
    usersQuery = usersQuery.eq('tenant_id', currentUser.tenant_id)
  }

  const { data: users } = await usersQuery

  // Get all tenants if admin
  let tenantsQuery = supabase.from('tenants').select('*').order('created_at', { ascending: false })
  const { data: tenants } = currentUser.role === 'admin' ? await tenantsQuery : { data: null }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your profile and organization settings</p>
        </div>

        <SettingsContent
          currentUser={currentUser}
          users={users || []}
          tenants={tenants || []}
        />
      </div>
    </DashboardLayout>
  )
}

