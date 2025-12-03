// Script to create demo user with proper password hash
// Run with: npx tsx scripts/create-demo-user.ts
// Make sure POSTGRES_URL is set in your environment

import bcrypt from 'bcryptjs'
import { sql } from '@vercel/postgres'

async function createDemoUser() {
  const email = 'demo@acme.com'
  const password = 'demo123456'
  const passwordHash = await bcrypt.hash(password, 10)

  // Create tenant if it doesn't exist
  await sql`
    INSERT INTO tenants (id, name)
    VALUES ('f0ebecb1-7dce-4c05-afeb-f7d71c816f9e', 'Acme Corporation')
    ON CONFLICT (id) DO NOTHING
  `

  // Create demo user
  await sql`
    INSERT INTO users (id, email, password_hash, full_name, role, tenant_id)
    VALUES (
      'f94c574c-a81b-47bd-99bb-3303ede20539',
      ${email},
      ${passwordHash},
      'Demo User',
      'admin',
      'f0ebecb1-7dce-4c05-afeb-f7d71c816f9e'
    )
    ON CONFLICT (id) DO UPDATE
    SET password_hash = ${passwordHash},
        email = ${email},
        role = 'admin',
        tenant_id = 'f0ebecb1-7dce-4c05-afeb-f7d71c816f9e'
  `

  console.log('Demo user created successfully!')
  console.log('Email:', email)
  console.log('Password:', password)
}

createDemoUser().catch(console.error)

