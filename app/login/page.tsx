'use client'

import { useState, useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    setMounted(true)
    
    // Check for error query parameters
    const error = searchParams.get('error')
    if (error === 'user_record_missing') {
      toast.error('User record not found. Please try the demo again or contact support.', { duration: 5000 })
    } else if (error === 'auth_error') {
      toast.error('Authentication error. Please check your credentials or try the demo.', { duration: 5000 })
    } else if (error === 'Configuration') {
      toast.error('Server configuration error. Please check environment variables (NEXTAUTH_SECRET, NEXTAUTH_URL).', { duration: 8000 })
    } else if (error === 'CredentialsSignin') {
      toast.error('Invalid email or password.', { duration: 5000 })
    } else if (error) {
      toast.error(`Authentication error: ${error}`, { duration: 5000 })
    }
  }, [searchParams])

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
      console.error('Login error:', error)
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
      // First, try to create/ensure demo user exists
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
        
        toast.error(errorMsg, { duration: 8000 })
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
          router.push('/dashboard')
          router.refresh()
        } else {
          console.error('Sign in error:', signInResult?.error)
          toast.error(`Sign in failed: ${signInResult?.error || 'Unknown error'}. Please try again.`, { duration: 8000 })
          setLoading(false)
        }
      } else {
        toast.error(apiData.error || 'Failed to create demo user', { duration: 5000 })
        setLoading(false)
      }
    } catch (error) {
      console.error('Demo login error:', error)
      toast.error('Failed to connect to demo service. Please try again.', { duration: 5000 })
      setLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md border-border/50 shadow-2xl bg-card/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                disabled={loading}
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
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6">
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
              className="w-full mt-4"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {loading ? 'Setting up demo...' : 'Try Demo - No Account Needed'}
            </Button>
          </div>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <Card className="w-full max-w-md border-border/50 shadow-2xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
