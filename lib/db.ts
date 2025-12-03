import { sql } from '@vercel/postgres'

export { sql }

// Helper function to execute queries with error handling
export async function query<T = any>(queryText: string, params?: any[]): Promise<T[]> {
  try {
    const result = await sql.query(queryText, params)
    return result.rows as T[]
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// Helper function for single row queries
export async function queryOne<T = any>(queryText: string, params?: any[]): Promise<T | null> {
  const results = await query<T>(queryText, params)
  return results[0] || null
}

