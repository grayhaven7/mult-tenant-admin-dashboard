import { sql } from '@vercel/postgres'

export async function logActivity(
  userId: string,
  tenantId: string,
  action: string,
  details: string | null = null
) {
  try {
    await sql`
      INSERT INTO activity_logs (user_id, tenant_id, action, details)
      VALUES (${userId}, ${tenantId}, ${action}, ${details})
    `
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}
