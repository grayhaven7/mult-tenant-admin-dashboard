import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST() {
  try {
    const demoEmail = 'demo@acme.com'
    const demoPassword = 'demo123456'

    // Check if demo user exists
    const existingUser = await sql`
      SELECT id, email, password_hash, role, tenant_id
      FROM users
      WHERE email = ${demoEmail}
    `

    let userId: string
    let tenantId: string

    // Get or create tenant
    const tenantResult = await sql`
      SELECT id FROM tenants WHERE name = 'Acme Corporation' LIMIT 1
    `

    if (tenantResult.rows.length > 0) {
      tenantId = tenantResult.rows[0].id
    } else {
      const newTenant = await sql`
        INSERT INTO tenants (id, name)
        VALUES (${'f0ebecb1-7dce-4c05-afeb-f7d71c816f9e'}, 'Acme Corporation')
        RETURNING id
      `
      tenantId = newTenant.rows[0].id
    }

    // Create or update demo user
    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id
      // Update user to ensure it's an admin
      const passwordHash = await bcrypt.hash(demoPassword, 10)
      await sql`
        UPDATE users
        SET password_hash = ${passwordHash},
            role = 'admin',
            tenant_id = ${tenantId}
        WHERE id = ${userId}
      `
    } else {
      userId = 'f94c574c-a81b-47bd-99bb-3303ede20539'
      const passwordHash = await bcrypt.hash(demoPassword, 10)
      await sql`
        INSERT INTO users (id, email, password_hash, full_name, role, tenant_id)
        VALUES (${userId}, ${demoEmail}, ${passwordHash}, 'Demo User', 'admin', ${tenantId})
        ON CONFLICT (id) DO UPDATE
        SET password_hash = ${passwordHash},
            role = 'admin',
            tenant_id = ${tenantId}
      `
    }

    // Verify user was created/updated
    const verifyUser = await sql`
      SELECT id, email, role, tenant_id
      FROM users
      WHERE id = ${userId}
    `

    if (verifyUser.rows.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create demo user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Demo user ready. Please sign in with demo@acme.com / demo123456',
      userId,
    })
  } catch (error) {
    console.error('Demo route error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}
