'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    
    // Check for error query parameter
    const params = new URLSearchParams(window.location.search)
    const error = params.get('error')
    if (error === 'user_record_missing') {
      toast.error('User record not found. Please try the demo again or contact support.', { duration: 5000 })
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Invalid email or password')
        setLoading(false)
        return
      }

      if (result?.ok) {
        toast.success('Welcome back!')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      toast.error('Failed to connect to authentication service')
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    // Pre-fill the form with demo credentials
    setEmail('demo@acme.com')
    setPassword('demo123456')
    
    // Small delay to show the fields being filled
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Now automatically submit the form
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email: 'demo@acme.com',
        password: 'demo123456',
        redirect: false,
      })

      if (result?.error) {
        // If sign in fails, try creating the account via API
        const response = await fetch('/api/demo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          let errorText = ''
          let errorData: any = {}
          
          try {
            errorText = await response.text()
            console.error('Raw error response:', errorText)
            
            try {
              errorData = JSON.parse(errorText)
            } catch (parseError) {
              errorData = { error: 'Server error', details: errorText }
            }
          } catch (fetchError) {
            console.error('Error reading response:', fetchError)
            errorData = { error: 'Failed to read server response', details: String(fetchError) }
          }
          
          console.error('Demo API error details:', {
            status: response.status,
            statusText: response.statusText,
            errorData: errorData,
            rawText: errorText.substring(0, 500)
          })
          
          let errorMsg = errorData.error || 'Server error'
          if (errorData.details) {
            errorMsg += `: ${errorData.details}`
          }
          if (errorData.errorName) {
            errorMsg += ` (${errorData.errorName})`
          }
          
          console.error('Full error object:', errorData)
          if (errorData.stack) {
            console.error('Server error stack:', errorData.stack)
          }
          
          toast.error(errorMsg, { duration: 10000 })
          setLoading(false)
          return
        }

        const apiData = await response.json()

        if (apiData.success) {
          // Demo user created, now sign in with it
          const signInResult = await signIn('credentials', {
            email: apiData.email || 'demo@acme.com',
            password: apiData.password || 'demo123456',
            redirect: false,
          })

          if (signInResult?.ok) {
            toast.success('Welcome to the demo!')
            await new Promise(resolve => setTimeout(resolve, 500))
            window.location.href = '/dashboard'
          } else {
            toast.error('Demo user created but sign in failed. Please try signing in manually.')
            setLoading(false)
          }
        } else {
          console.error('Demo error:', apiData)
          const errorMsg = apiData.details 
            ? `${apiData.error}: ${apiData.details}` 
            : apiData.error || 'Failed to start demo'
          toast.error(errorMsg, { duration: 5000 })
          setLoading(false)
        }
        return
      }

      if (result?.ok) {
        toast.success('Welcome to the demo!')
        await new Promise(resolve => setTimeout(resolve, 1000))
        window.location.href = '/dashboard'
      }
    } catch (error) {
      console.error('Demo login error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to start demo'
      toast.error(errorMessage, { duration: 5000 })
      setLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-accent/20">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">Sign in to your account or try the demo</p>
        </div>

        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full group"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              <Sparkles className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
              Try Demo - No Account Needed
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
