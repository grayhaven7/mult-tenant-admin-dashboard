'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ActivityLogWithRelations } from '@/types/database'
import { Loader2 } from 'lucide-react'

interface ActivitySummaryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  logs: ActivityLogWithRelations[]
}

export function ActivitySummaryDialog({ open, onOpenChange, logs }: ActivitySummaryDialogProps) {
  const [summary, setSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [displayText, setDisplayText] = useState('')

  useEffect(() => {
    if (open && logs.length > 0) {
      fetchSummary()
    } else {
      setSummary('')
      setDisplayText('')
    }
  }, [open, logs])

  const fetchSummary = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/summarize-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate summary')
      }

      const data = await response.json()
      setSummary(data.summary)
      
      // Typewriter effect
      setDisplayText('')
      let index = 0
      const interval = setInterval(() => {
        if (index < data.summary.length) {
          setDisplayText(data.summary.slice(0, index + 1))
          index++
        } else {
          clearInterval(interval)
        }
      }, 10)
    } catch (error) {
      console.error('Error fetching summary:', error)
      setSummary('Failed to generate summary. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Activity Summary</DialogTitle>
          <DialogDescription>
            AI-generated summary of the last {logs.length} activity logs
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {displayText}
                {displayText.length < summary.length && (
                  <span className="animate-pulse">|</span>
                )}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

