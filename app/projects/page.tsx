import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProjectsTable } from '@/components/projects-table'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { sql } from '@vercel/postgres'
import type { Project, User, ProjectWithRelations } from '@/types/database'

export default async function ProjectsPage() {
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

  const currentUser = currentUserResult.rows[0] as { role: string; tenant_id: string }
  const isAdmin = currentUser.role === 'admin'

  // Get projects with assigned user
  let projectsQuery = sql`
    SELECT 
      p.*,
      u.id as assigned_user_id,
      u.full_name as assigned_user_full_name,
      u.avatar_url as assigned_user_avatar_url
    FROM projects p
    LEFT JOIN users u ON p.assigned_user_id = u.id
    ORDER BY p.created_at DESC
  `

  if (!isAdmin) {
    projectsQuery = sql`
      SELECT 
        p.*,
        u.id as assigned_user_id,
        u.full_name as assigned_user_full_name,
        u.avatar_url as assigned_user_avatar_url
      FROM projects p
      LEFT JOIN users u ON p.assigned_user_id = u.id
      WHERE p.tenant_id = ${currentUser.tenant_id}
      ORDER BY p.created_at DESC
    `
  }

  const projectsResult = await projectsQuery
  const projects: ProjectWithRelations[] = projectsResult.rows.map(row => ({
    id: row.id,
    name: row.name,
    status: row.status,
    assigned_user_id: row.assigned_user_id,
    tenant_id: row.tenant_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    assigned_user: row.assigned_user_id ? {
      id: row.assigned_user_id,
      email: '',
      full_name: row.assigned_user_full_name,
      role: 'user' as const,
      tenant_id: row.tenant_id,
      avatar_url: row.assigned_user_avatar_url,
      created_at: '',
    } : null,
  }))

  // Get users for assignment dropdown
  let usersQuery = sql`
    SELECT id, full_name, avatar_url, email, role, tenant_id, created_at
    FROM users
    ORDER BY full_name
  `

  if (!isAdmin) {
    usersQuery = sql`
      SELECT id, full_name, avatar_url, email, role, tenant_id, created_at
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Projects</h1>
            <p className="text-muted-foreground">Manage and track all your projects</p>
          </div>
        </div>

        <ProjectsTable 
          initialProjects={projects} 
          users={users}
          currentUser={currentUser}
        />
      </div>
    </DashboardLayout>
  )
}
