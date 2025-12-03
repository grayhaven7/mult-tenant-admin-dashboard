import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { logs } = await request.json()

    if (!logs || logs.length === 0) {
      return NextResponse.json({ error: 'No logs provided' }, { status: 400 })
    }

    // Format logs for the AI
    const logText = logs
      .map((log: any) => {
        const user = log.user?.full_name || log.user?.email || 'Unknown'
        const timestamp = new Date(log.created_at).toLocaleString()
        return `[${timestamp}] ${user}: ${log.action}${log.details ? ` - ${log.details}` : ''}`
      })
      .join('\n')

    const prompt = `Please provide a concise, natural-language summary of the following activity logs. Focus on key patterns, trends, and notable events. Write in a friendly, professional tone as if explaining to a colleague.

Activity Logs:
${logText}

Summary:`

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const summary = message.content[0].type === 'text' ? message.content[0].text : 'Unable to generate summary'

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Error generating summary:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary. Please ensure ANTHROPIC_API_KEY is set.' },
      { status: 500 }
    )
  }
}
