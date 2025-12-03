import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { logActivity } from '@/lib/activity-logger'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get user's role and tenant
    const userResult = await sql`
      SELECT role, tenant_id
      FROM users
      WHERE id = ${userId}
    `

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = userResult.rows[0]
    const isAdmin = user.role === 'admin'

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
        WHERE p.tenant_id = ${user.tenant_id}
        ORDER BY p.created_at DESC
      `
    }

    const projectsResult = await projectsQuery
    const projects = projectsResult.rows.map(row => ({
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

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { name, status, assigned_user_id } = await request.json()

    // Get user's tenant
    const userResult = await sql`
      SELECT tenant_id
      FROM users
      WHERE id = ${userId}
    `

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const tenantId = userResult.rows[0].tenant_id

    // Create project
    const result = await sql`
      INSERT INTO projects (name, status, assigned_user_id, tenant_id)
      VALUES (${name}, ${status}, ${assigned_user_id || null}, ${tenantId})
      RETURNING *
    `

    const project = result.rows[0]

    // Log activity
    await logActivity(userId, tenantId, 'created project', `Project: ${name}`)

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { id, name, status, assigned_user_id } = await request.json()

    // Get user's tenant
    const userResult = await sql`
      SELECT tenant_id, role
      FROM users
      WHERE id = ${userId}
    `

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = userResult.rows[0]

    // Check if user can edit this project
    const projectResult = await sql`
      SELECT tenant_id FROM projects WHERE id = ${id}
    `

    if (projectResult.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (user.role !== 'admin' && projectResult.rows[0].tenant_id !== user.tenant_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update project
    const result = await sql`
      UPDATE projects
      SET name = ${name},
          status = ${status},
          assigned_user_id = ${assigned_user_id || null},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    const project = result.rows[0]

    // Log activity
    await logActivity(userId, user.tenant_id, 'edited project', `Project: ${name}`)

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    // Get user's tenant and role
    const userResult = await sql`
      SELECT tenant_id, role
      FROM users
      WHERE id = ${userId}
    `

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = userResult.rows[0]

    // Get project to check permissions and get name for logging
    const projectResult = await sql`
      SELECT name, tenant_id FROM projects WHERE id = ${id}
    `

    if (projectResult.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (user.role !== 'admin' && projectResult.rows[0].tenant_id !== user.tenant_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete project
    await sql`DELETE FROM projects WHERE id = ${id}`

    // Log activity
    await logActivity(userId, user.tenant_id, 'deleted project', `Project: ${projectResult.rows[0].name}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

