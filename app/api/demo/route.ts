import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'

// Ensure this route only accepts POST
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
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

    // Create a mutable response object to handle cookies properly
    // In API routes, we create a response that we'll modify
    let response = new NextResponse(null, {
      status: 200,
    })

    // Create Supabase client with proper cookie handling for API routes
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )
    
    // Demo account - automatically created if it doesn't exist
    // Users don't need to sign up - this happens behind the scenes
    const demoEmail = 'demo@acme.com'
    const demoPassword = 'demo123456'

    // First, try to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    })

    console.log('Demo sign in attempt:', { hasUser: !!signInData?.user, error: signInError?.message })

    if (signInData?.user) {
      // Wait a moment for trigger to create user record (if trigger exists)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Use service role key to ensure user record exists (bypasses RLS)
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (!serviceKey) {
        console.error('Service role key not available - cannot create user record')
        return NextResponse.json(
          { error: 'Service role key required', details: 'SUPABASE_SERVICE_ROLE_KEY must be set to create demo accounts' },
          { status: 500 }
        )
      }

      const serviceClient = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey
      )

      // Get or create tenant first
      let { data: tenants, error: tenantSelectError } = await serviceClient
        .from('tenants')
        .select('id')
        .limit(1)

      if (tenantSelectError) {
        console.error('Error selecting tenants:', tenantSelectError)
      }

      let tenantId = tenants?.[0]?.id

      if (!tenantId) {
        const { data: newTenant, error: tenantError } = await serviceClient
          .from('tenants')
          .insert({ name: 'Acme Corporation' })
          .select('id')
          .single()
        
        if (tenantError) {
          console.error('Failed to create tenant:', tenantError)
          return NextResponse.json(
            { error: 'Failed to create tenant', details: tenantError.message },
            { status: 500 }
          )
        }
        tenantId = newTenant?.id
        console.log('Created tenant:', tenantId)
      } else {
        console.log('Using existing tenant:', tenantId)
      }

      // Create or update user record with service role key (upsert)
      const { data: upsertedUser, error: createError } = await serviceClient
        .from('users')
        .upsert({
          id: signInData.user.id,
          email: signInData.user.email || 'demo@acme.com',
          full_name: 'Demo User',
          role: 'admin',
          tenant_id: tenantId,
        }, {
          onConflict: 'id'
        })
        .select()
        .single()

      if (createError) {
        console.error('Failed to create/update user record:', createError)
        return NextResponse.json(
          { error: 'Failed to create user record', details: createError.message },
          { status: 500 }
        )
      }

      console.log('User record created/updated successfully:', upsertedUser?.id)

      // Verify the user record exists by querying it
      const { data: verifyUser, error: verifyError } = await serviceClient
        .from('users')
        .select('id, role, tenant_id')
        .eq('id', signInData.user.id)
        .single()

      if (!verifyUser) {
        console.error('User record verification failed:', verifyError)
        return NextResponse.json(
          { error: 'User record verification failed', details: verifyError?.message || 'User record not found after creation' },
          { status: 500 }
        )
      }

      console.log('User record verified:', verifyUser)

      // Wait a moment to ensure the record is fully committed
      await new Promise(resolve => setTimeout(resolve, 500))

      // IMPORTANT: Verify the user can actually read their own record with RLS
      // This is the final check before returning success
      const { data: rlsCheck, error: rlsError } = await supabase
        .from('users')
        .select('id, role, tenant_id')
        .eq('id', signInData.user.id)
        .single()

      if (!rlsCheck && rlsError) {
        console.error('❌ RLS CHECK FAILED:', {
          error: rlsError.message,
          code: rlsError.code,
          hint: rlsError.hint,
          details: rlsError.details,
          userId: signInData.user.id
        })
        
        // Still return success, but with a warning
        // The dashboard will handle the error more gracefully
        return NextResponse.json({ 
          success: true, 
          user: signInData.user,
          userRecord: verifyUser,
          warning: 'User record created but RLS policy may not be working. Please run supabase/ULTIMATE_FIX.sql',
          rlsError: rlsError.message
        }, {
          headers: response.headers,
        })
      }

      console.log('✓ RLS check passed - user can read their own record')

      // Return success - the dashboard will handle RLS verification
      // The session cookies are already set in the response object from signInWithPassword
      return NextResponse.json({ 
        success: true, 
        user: signInData.user,
        userRecord: verifyUser 
      }, {
        headers: response.headers,
      })
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

            // Create or update user record with tenant and role (upsert)
            if (tenantId) {
              const { error: upsertError } = await serviceClient
                .from('users')
                .upsert({
                  id: signUpData.user.id,
                  email: signUpData.user.email || 'demo@acme.com',
                  full_name: 'Demo User',
                  role: 'admin',
                  tenant_id: tenantId,
                }, {
                  onConflict: 'id'
                })
              
              if (upsertError) {
                console.error('Error upserting user:', upsertError)
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
          return NextResponse.json({ success: true, user: finalSignIn.user }, {
            headers: response.headers,
          })
        } else if (finalSignInError) {
          // If sign in fails due to email confirmation, return the user anyway
          // The frontend can handle this
          if (signUpData.user && !signUpData.user.email_confirmed_at) {
            return NextResponse.json({ 
              success: true, 
              user: signUpData.user,
              needsConfirmation: true 
            }, {
              headers: response.headers,
            })
          }
          return NextResponse.json(
            { error: 'Failed to sign in after signup', details: finalSignInError.message },
            { status: 500, headers: response.headers }
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
    const errorName = error instanceof Error ? error.name : 'UnknownError'
    console.error('Error name:', errorName)
    console.error('Error stack:', errorStack)
    
    // Return detailed error for debugging
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: errorMessage,
        errorName: errorName,
        // Include stack trace in response for debugging (remove in production if needed)
        ...(process.env.NODE_ENV === 'development' && errorStack ? { stack: errorStack } : {})
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

