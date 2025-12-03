import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProjectsTable } from '@/components/projects-table'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProjectsPage() {
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

  // Get projects
  let projectsQuery = supabase
    .from('projects')
    .select(`
      *,
      assigned_user:users!projects_assigned_user_id_fkey(id, full_name, avatar_url)
    `)
    .order('created_at', { ascending: false })

  if (currentUser.role !== 'admin') {
    projectsQuery = projectsQuery.eq('tenant_id', currentUser.tenant_id)
  }

  const { data: projects } = await projectsQuery

  // Get users for assignment dropdown
  let usersQuery = supabase
    .from('users')
    .select('id, full_name, avatar_url, email, role, tenant_id, created_at')
    .order('full_name')

  if (currentUser.role !== 'admin') {
    usersQuery = usersQuery.eq('tenant_id', currentUser.tenant_id)
  }

  const { data: users } = await usersQuery

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Projects</h1>
            <p className="text-muted-foreground">Manage and track all your projects</p>
          </div>
        </div>

        <ProjectsTable 
          initialProjects={projects || []} 
          users={users || []}
          currentUser={currentUser}
        />
      </div>
    </DashboardLayout>
  )
}

