import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build/SSR, if env vars aren't available, create a client with placeholders
  // This prevents build errors. The client will work correctly at runtime when env vars are set
  if (!url || !key) {
    // Use a valid-looking placeholder URL to prevent validation errors
    // The actual client will be recreated on the client side with real values
    return createBrowserClient(
      url || 'https://placeholder.supabase.co',
      key || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder'
    )
  }

  return createBrowserClient(url, key)
}

