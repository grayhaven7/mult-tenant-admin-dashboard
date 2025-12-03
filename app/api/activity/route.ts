import { auth } from '@/lib/auth'
import { logActivity } from '@/lib/activity-logger'
import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get user's tenant_id
    const userResult = await sql`
      SELECT tenant_id
      FROM users
      WHERE id = ${userId}
    `

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const tenantId = userResult.rows[0].tenant_id
    const { action, details } = await request.json()

    await logActivity(userId, tenantId, action, details)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging activity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
