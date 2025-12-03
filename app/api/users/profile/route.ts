import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function PUT(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { full_name } = await request.json()

    await sql`
      UPDATE users
      SET full_name = ${full_name}
      WHERE id = ${userId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

