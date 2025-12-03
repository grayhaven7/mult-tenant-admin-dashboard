import { createClient } from '@/lib/supabase/server'
import { logActivity } from '@/lib/activity-logger'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: currentUser } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { action, details } = await request.json()

    await logActivity(user.id, currentUser.tenant_id, action, details)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging activity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

