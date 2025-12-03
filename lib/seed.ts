import { createClient } from './supabase/server'

// This function should be called from an API route or script
export async function seedDatabase() {
  const supabase = await createClient()

  // First, create tenants
  const { data: tenants, error: tenantsError } = await supabase
    .from('tenants')
    .insert([
      { id: '00000000-0000-0000-0000-000000000001', name: 'Acme Corporation' },
      { id: '00000000-0000-0000-0000-000000000002', name: 'TechFlow Solutions' },
      { id: '00000000-0000-0000-0000-000000000003', name: 'Global Dynamics Inc' },
    ])
    .select()

  if (tenantsError && !tenantsError.message.includes('duplicate')) {
    console.error('Error creating tenants:', tenantsError)
    return
  }

  console.log('Tenants created or already exist')

  // Note: Users need to be created via Supabase Auth first
  // This seed function assumes users already exist in auth.users
  // You would typically create users via the Supabase dashboard or API
  // and then link them to the users table

  return { success: true }
}

