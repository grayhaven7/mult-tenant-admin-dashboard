import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Try to sign in with demo account, or create one if it doesn't exist
    const demoEmail = 'demo@acme.com'
    const demoPassword = 'demo123456'

    // First, try to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    })

    if (signInData?.user) {
      // Check if user exists in users table
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', signInData.user.id)
        .single()

      if (!user) {
        // User record should be created by trigger, but if not, try to create it
        // Get first tenant or create one
        const { data: tenants } = await supabase
          .from('tenants')
          .select('id')
          .limit(1)

        let tenantId = tenants?.[0]?.id

        if (!tenantId) {
          // Try to create tenant (might fail due to RLS, but worth trying)
          const { data: newTenant } = await supabase
            .from('tenants')
            .insert({ name: 'Acme Corporation' })
            .select('id')
            .single()
          tenantId = newTenant?.id || null
        }

        // Try to update user record (trigger should have created it)
        // If service role key is available, use it for admin operations
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (serviceKey && tenantId) {
          const serviceClient = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceKey
          )
          await serviceClient
            .from('users')
            .update({
              full_name: 'Demo User',
              role: 'admin',
              tenant_id: tenantId,
            })
            .eq('id', signInData.user.id)
        } else if (tenantId) {
          // Try with regular client (user can update their own record)
          await supabase
            .from('users')
            .update({
              full_name: 'Demo User',
              role: 'admin',
              tenant_id: tenantId,
            })
            .eq('id', signInData.user.id)
        }
      }

      return NextResponse.json({ success: true, user: signInData.user })
    }

    // If sign in failed, try to sign up
    if (signInError) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: demoEmail,
        password: demoPassword,
        options: {
          data: {
            full_name: 'Demo User',
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
        },
      })

      if (signUpError) {
        return NextResponse.json(
          { error: 'Failed to create demo account', details: signUpError.message },
          { status: 500 }
        )
      }

      if (signUpData?.user) {
        // Wait a moment for the trigger to create the user record
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Get or create tenant
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        let tenantId: string | null = null

        if (serviceKey) {
          const serviceClient = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceKey
          )
          
          // Get existing tenant or create one
          const { data: tenants } = await serviceClient
            .from('tenants')
            .select('id')
            .limit(1)

          tenantId = tenants?.[0]?.id

          if (!tenantId) {
            const { data: newTenant } = await serviceClient
              .from('tenants')
              .insert({ name: 'Acme Corporation' })
              .select('id')
              .single()
            tenantId = newTenant?.id || null
          }

          // Update user record with tenant and role
          if (tenantId) {
            await serviceClient
              .from('users')
              .update({
                full_name: 'Demo User',
                role: 'admin',
                tenant_id: tenantId,
              })
              .eq('id', signUpData.user.id)
          }
        }

        // Sign in after creating account
        const { data: finalSignIn } = await supabase.auth.signInWithPassword({
          email: demoEmail,
          password: demoPassword,
        })

        if (finalSignIn?.user) {
          return NextResponse.json({ success: true, user: finalSignIn.user })
        }
      }
    }

    return NextResponse.json({ error: 'Failed to create demo session' }, { status: 500 })
  } catch (error) {
    console.error('Demo login error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

