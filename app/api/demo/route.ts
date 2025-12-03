import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { 
          error: 'Supabase not configured', 
          details: 'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables' 
        },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    
    // Try to sign in with demo account, or create one if it doesn't exist
    const demoEmail = 'demo@acme.com'
    const demoPassword = 'demo123456'

    // First, try to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    })

    console.log('Demo sign in attempt:', { hasUser: !!signInData?.user, error: signInError?.message })

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
      console.log('Sign in failed, attempting sign up:', signInError.message)
      
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

      console.log('Sign up result:', { hasUser: !!signUpData?.user, error: signUpError?.message })

      if (signUpError) {
        console.error('Sign up error:', signUpError)
        return NextResponse.json(
          { error: 'Failed to create demo account', details: signUpError.message },
          { status: 500 }
        )
      }

      if (signUpData?.user) {
        // Wait a moment for the trigger to create the user record
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Get or create tenant
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        let tenantId: string | null = null

        if (serviceKey) {
          try {
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
              const { data: newTenant, error: tenantError } = await serviceClient
                .from('tenants')
                .insert({ name: 'Acme Corporation' })
                .select('id')
                .single()
              
              if (tenantError) {
                console.error('Error creating tenant:', tenantError)
              } else {
                tenantId = newTenant?.id || null
              }
            }

            // Update user record with tenant and role
            if (tenantId) {
              const { error: updateError } = await serviceClient
                .from('users')
                .update({
                  full_name: 'Demo User',
                  role: 'admin',
                  tenant_id: tenantId,
                })
                .eq('id', signUpData.user.id)
              
              if (updateError) {
                console.error('Error updating user:', updateError)
              }
            }
          } catch (serviceError) {
            console.error('Service client error:', serviceError)
          }
        } else {
          console.log('No service role key, trying with regular client')
          // Try to get or create tenant with regular client
          const { data: tenants } = await supabase
            .from('tenants')
            .select('id')
            .limit(1)
          
          tenantId = tenants?.[0]?.id
        }

        // Try to sign in - even if email confirmation is required, 
        // Supabase might allow it if auto-confirm is enabled
        const { data: finalSignIn, error: finalSignInError } = await supabase.auth.signInWithPassword({
          email: demoEmail,
          password: demoPassword,
        })

        console.log('Final sign in attempt:', { hasUser: !!finalSignIn?.user, error: finalSignInError?.message })

        if (finalSignIn?.user) {
          return NextResponse.json({ success: true, user: finalSignIn.user })
        } else if (finalSignInError) {
          // If sign in fails due to email confirmation, return the user anyway
          // The frontend can handle this
          if (signUpData.user && !signUpData.user.email_confirmed_at) {
            return NextResponse.json({ 
              success: true, 
              user: signUpData.user,
              needsConfirmation: true 
            })
          }
          return NextResponse.json(
            { error: 'Failed to sign in after signup', details: finalSignInError.message },
            { status: 500 }
          )
        }
      }
    }

    console.error('Demo login failed - no user created or signed in')
    return NextResponse.json(
      { 
        error: 'Failed to create demo session',
        details: 'Unable to sign in or create demo account. Please check your Supabase configuration and ensure email confirmation is disabled.'
      },
      { status: 500 }
    )
  } catch (error) {
    console.error('Demo login error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('Error stack:', errorStack)
    
    // Ensure we always return valid JSON
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: errorMessage 
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )
  }
}

