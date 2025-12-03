import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Get or create default tenant
    let tenantResult = await sql`
      SELECT id FROM tenants LIMIT 1
    `

    let tenantId = tenantResult.rows[0]?.id

    if (!tenantId) {
      const newTenant = await sql`
        INSERT INTO tenants (name)
        VALUES ('Default Organization')
        RETURNING id
      `
      tenantId = newTenant.rows[0].id
    }

    // Create user
    const userId = randomUUID()
    await sql`
      INSERT INTO users (id, email, password_hash, full_name, role, tenant_id)
      VALUES (${userId}, ${email}, ${passwordHash}, ${fullName}, 'user', ${tenantId})
    `

    return NextResponse.json({ success: true, userId })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}

