import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST() {
  try {
    // Check if Neon database is configured
    if (!process.env.POSTGRES_URL) {
      console.error('POSTGRES_URL is not set')
      return NextResponse.json(
        {
          error: 'Database not configured',
          details: 'POSTGRES_URL environment variable is not set. Please set up Neon database in Vercel.',
        },
        { status: 500 }
      )
    }

    const demoEmail = 'demo@acme.com'
    const demoPassword = 'demo123456'

    // Check if demo user exists
    let existingUser
    try {
      existingUser = await sql`
        SELECT id, email, password_hash, role, tenant_id
        FROM users
        WHERE email = ${demoEmail}
      `
    } catch (dbError) {
      console.error('Database query error:', dbError)
      return NextResponse.json(
        {
          error: 'Database connection failed',
          details: dbError instanceof Error ? dbError.message : 'Unknown database error',
        },
        { status: 500 }
      )
    }

    let userId: string
    let tenantId: string

    // Get or create tenant
    let tenantResult
    try {
      tenantResult = await sql`
        SELECT id FROM tenants WHERE name = 'Acme Corporation' LIMIT 1
      `
    } catch (error) {
      console.error('Error querying tenants:', error)
      return NextResponse.json(
        {
          error: 'Database error',
          details: error instanceof Error ? error.message : 'Failed to query tenants table',
        },
        { status: 500 }
      )
    }

    if (tenantResult.rows.length > 0) {
      tenantId = tenantResult.rows[0].id
    } else {
      try {
        const newTenant = await sql`
          INSERT INTO tenants (id, name)
          VALUES (${'f0ebecb1-7dce-4c05-afeb-f7d71c816f9e'}, 'Acme Corporation')
          RETURNING id
        `
        tenantId = newTenant.rows[0].id
      } catch (error) {
        console.error('Error creating tenant:', error)
        return NextResponse.json(
          {
            error: 'Database error',
            details: error instanceof Error ? error.message : 'Failed to create tenant',
          },
          { status: 500 }
        )
      }
    }

    // Create or update demo user
    const passwordHash = await bcrypt.hash(demoPassword, 10)
    
    try {
      if (existingUser.rows.length > 0) {
        userId = existingUser.rows[0].id
        // Update user to ensure it's an admin
        await sql`
          UPDATE users
          SET password_hash = ${passwordHash},
              role = 'admin',
              tenant_id = ${tenantId}
          WHERE id = ${userId}
        `
      } else {
        userId = 'f94c574c-a81b-47bd-99bb-3303ede20539'
        await sql`
          INSERT INTO users (id, email, password_hash, full_name, role, tenant_id)
          VALUES (${userId}, ${demoEmail}, ${passwordHash}, 'Demo User', 'admin', ${tenantId})
          ON CONFLICT (id) DO UPDATE
          SET password_hash = ${passwordHash},
              role = 'admin',
              tenant_id = ${tenantId}
        `
      }
    } catch (error) {
      console.error('Error creating/updating user:', error)
      return NextResponse.json(
        {
          error: 'Database error',
          details: error instanceof Error ? error.message : 'Failed to create/update user',
        },
        { status: 500 }
      )
    }

    // Verify user was created/updated
    let verifyUser
    try {
      verifyUser = await sql`
        SELECT id, email, role, tenant_id
        FROM users
        WHERE id = ${userId}
      `
    } catch (error) {
      console.error('Error verifying user:', error)
      return NextResponse.json(
        {
          error: 'Database error',
          details: error instanceof Error ? error.message : 'Failed to verify user',
        },
        { status: 500 }
      )
    }

    if (verifyUser.rows.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create demo user', details: 'User was not found after creation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Demo user ready. Please sign in with demo@acme.com / demo123456',
      userId,
      email: demoEmail,
      password: demoPassword, // Frontend will use this to sign in
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
