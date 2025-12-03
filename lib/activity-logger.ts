import { createClient } from './supabase/server'

export async function logActivity(
  userId: string,
  tenantId: string,
  action: string,
  details: string | null = null
) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('activity_logs')
    .insert({
      user_id: userId,
      tenant_id: tenantId,
      action,
      details,
    })

  if (error) {
    console.error('Failed to log activity:', error)
  }
}

