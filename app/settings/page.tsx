import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { SettingsContent } from '@/components/settings-content'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { sql } from '@vercel/postgres'
import type { User, Tenant } from '@/types/database'

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const userId = session.user.id

  // Get current user with full details
  const currentUserResult = await sql`
    SELECT 
      u.*,
      t.id as tenant_id,
      t.name as tenant_name,
      t.created_at as tenant_created_at
    FROM users u
    LEFT JOIN tenants t ON u.tenant_id = t.id
    WHERE u.id = ${userId}
  `

  if (currentUserResult.rows.length === 0) {
    redirect('/login')
  }

  const currentUserRow = currentUserResult.rows[0]
  const currentUser = {
    id: currentUserRow.id,
    email: currentUserRow.email,
    full_name: currentUserRow.full_name,
    role: currentUserRow.role,
    tenant_id: currentUserRow.tenant_id,
    avatar_url: currentUserRow.avatar_url,
    created_at: currentUserRow.created_at,
    tenant: currentUserRow.tenant_id ? {
      id: currentUserRow.tenant_id,
      name: currentUserRow.tenant_name,
      created_at: currentUserRow.tenant_created_at,
    } : null,
  }

  const isAdmin = currentUser.role === 'admin'

  // Get all users if admin
  let usersQuery = sql`
    SELECT 
      u.*,
      t.id as tenant_id,
      t.name as tenant_name,
      t.created_at as tenant_created_at
    FROM users u
    LEFT JOIN tenants t ON u.tenant_id = t.id
    ORDER BY u.created_at DESC
  `

  if (!isAdmin) {
    usersQuery = sql`
      SELECT 
        u.*,
        t.id as tenant_id,
        t.name as tenant_name,
        t.created_at as tenant_created_at
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
      WHERE u.tenant_id = ${currentUser.tenant_id}
      ORDER BY u.created_at DESC
    `
  }

  const usersResult = await usersQuery
  const users: (User & { tenant: Tenant | null })[] = usersResult.rows.map(row => ({
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    role: row.role,
    tenant_id: row.tenant_id,
    avatar_url: row.avatar_url,
    created_at: row.created_at,
    tenant: row.tenant_id ? {
      id: row.tenant_id,
      name: row.tenant_name,
      created_at: row.tenant_created_at,
    } : null,
  }))

  // Get all tenants if admin
  let tenants: Tenant[] = []
  if (isAdmin) {
    const tenantsResult = await sql`
      SELECT * FROM tenants
      ORDER BY created_at DESC
    `
    tenants = tenantsResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      created_at: row.created_at,
    }))
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your profile and organization settings</p>
        </div>

        <SettingsContent
          currentUser={currentUser as any}
          users={users as any}
          tenants={tenants}
        />
      </div>
    </DashboardLayout>
  )
}
