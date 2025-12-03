/**
 * Seed script for demo data
 * 
 * This script should be run after:
 * 1. Database schema is set up (supabase/schema.sql)
 * 2. At least one user is created in Supabase Auth
 * 
 * Usage:
 * 1. Create users in Supabase Auth dashboard first
 * 2. Update the USER_IDS below with actual auth user IDs
 * 3. Run: npx tsx scripts/seed-demo-data.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Update these with actual user IDs from Supabase Auth
const USER_IDS = {
  admin: 'YOUR_ADMIN_USER_ID',
  manager1: 'YOUR_MANAGER_USER_ID',
  user1: 'YOUR_USER_ID_1',
  user2: 'YOUR_USER_ID_2',
}

async function seed() {
  console.log('Starting seed...')

  // 1. Create tenants
  const { data: tenants, error: tenantsError } = await supabase
    .from('tenants')
    .upsert([
      { id: '00000000-0000-0000-0000-000000000001', name: 'Acme Corporation' },
      { id: '00000000-0000-0000-0000-000000000002', name: 'TechFlow Solutions' },
      { id: '00000000-0000-0000-0000-000000000003', name: 'Global Dynamics Inc' },
    ])
    .select()

  if (tenantsError) {
    console.error('Error creating tenants:', tenantsError)
    return
  }

  console.log('✓ Tenants created')

  // 2. Create users (update with actual auth user IDs)
  // Note: Users must be created in Supabase Auth first
  const { error: usersError } = await supabase
    .from('users')
    .upsert([
      {
        id: USER_IDS.admin,
        email: 'admin@acme.com',
        full_name: 'Sarah Johnson',
        role: 'admin',
        tenant_id: '00000000-0000-0000-0000-000000000001',
      },
      {
        id: USER_IDS.manager1,
        email: 'manager@acme.com',
        full_name: 'Michael Chen',
        role: 'manager',
        tenant_id: '00000000-0000-0000-0000-000000000001',
      },
      {
        id: USER_IDS.user1,
        email: 'user1@acme.com',
        full_name: 'Emily Rodriguez',
        role: 'user',
        tenant_id: '00000000-0000-0000-0000-000000000001',
      },
      {
        id: USER_IDS.user2,
        email: 'user2@acme.com',
        full_name: 'David Kim',
        role: 'user',
        tenant_id: '00000000-0000-0000-0000-000000000001',
      },
    ])

  if (usersError) {
    console.error('Error creating users:', usersError)
    console.log('Note: Make sure users exist in Supabase Auth first')
    return
  }

  console.log('✓ Users created')

  // 3. Create projects
  const { error: projectsError } = await supabase.from('projects').insert([
    { name: 'Website Redesign', status: 'in_progress', assigned_user_id: USER_IDS.user1, tenant_id: '00000000-0000-0000-0000-000000000001' },
    { name: 'Mobile App Development', status: 'planning', assigned_user_id: USER_IDS.user2, tenant_id: '00000000-0000-0000-0000-000000000001' },
    { name: 'API Integration', status: 'completed', assigned_user_id: USER_IDS.user1, tenant_id: '00000000-0000-0000-0000-000000000001' },
    { name: 'Database Migration', status: 'in_progress', assigned_user_id: USER_IDS.user2, tenant_id: '00000000-0000-0000-0000-000000000001' },
    { name: 'Security Audit', status: 'planning', assigned_user_id: USER_IDS.user1, tenant_id: '00000000-0000-0000-0000-000000000001' },
  ])

  if (projectsError) {
    console.error('Error creating projects:', projectsError)
    return
  }

  console.log('✓ Projects created')

  // 4. Create activity logs
  const { error: activityError } = await supabase.from('activity_logs').insert([
    { user_id: USER_IDS.admin, tenant_id: '00000000-0000-0000-0000-000000000001', action: 'user logged in', details: 'Admin logged into the system' },
    { user_id: USER_IDS.user1, tenant_id: '00000000-0000-0000-0000-000000000001', action: 'created project', details: 'Created project: Website Redesign' },
    { user_id: USER_IDS.user2, tenant_id: '00000000-0000-0000-0000-000000000001', action: 'created project', details: 'Created project: Mobile App Development' },
    { user_id: USER_IDS.user1, tenant_id: '00000000-0000-0000-0000-000000000001', action: 'edited project', details: 'Updated project: Website Redesign' },
  ])

  if (activityError) {
    console.error('Error creating activity logs:', activityError)
    return
  }

  console.log('✓ Activity logs created')
  console.log('✓ Seed completed successfully!')
}

seed().catch(console.error)

