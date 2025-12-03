'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Shield, Users, Zap, BarChart3, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

function DemoButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleTryDemo = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: 'Server error', details: errorText }
        }
        throw new Error(errorData.details || errorData.error || 'Failed to start demo')
      }

      const data = await response.json()

      if (data.success) {
        toast.success('Welcome to the demo!')
        // Small delay to ensure session is set
        await new Promise(resolve => setTimeout(resolve, 500))
        try {
          router.push('/dashboard')
          router.refresh()
        } catch (navError) {
          console.error('Navigation error:', navError)
          // Fallback: use window.location if router fails
          window.location.href = '/dashboard'
        }
      } else {
        console.error('Demo error:', data)
        const errorMsg = data.details 
          ? `${data.error}: ${data.details}` 
          : data.error || 'Failed to start demo'
        toast.error(errorMsg, { duration: 5000 })
        setLoading(false)
      }
    } catch (error) {
      console.error('Demo fetch error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to start demo'
      toast.error(errorMessage, { duration: 5000 })
      setLoading(false)
    }
  }

  return (
    <Button size="lg" className="group" onClick={handleTryDemo} disabled={loading}>
      <Sparkles className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
      {loading ? 'Starting Demo...' : 'Try Demo - No Account Needed'}
      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
    </Button>
  )
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
        <div className="relative container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium transition-all duration-1000 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Shield className="h-4 w-4" />
              Multi-Tenant Admin Dashboard
            </div>
            <h1
              className={`text-6xl md:text-7xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent transition-all duration-1000 delay-200 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Powerful Admin Dashboard
              <br />
              <span className="bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">
                Built for Scale
              </span>
            </h1>
            <p
              className={`text-xl text-muted-foreground max-w-2xl mx-auto transition-all duration-1000 delay-300 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Manage multiple tenants, users, and projects with ease. Beautiful UI, secure by default,
              and ready for production. <span className="text-primary font-medium">No signup required - try it free!</span>
            </p>
            <div
              className={`flex gap-4 justify-center transition-all duration-1000 delay-500 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <DemoButton />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Everything you need to manage your business
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Multi-Tenant Architecture',
                description: 'Complete tenant isolation with row-level security. Each organization sees only their data.',
              },
              {
                icon: Users,
                title: 'Role-Based Access',
                description: 'Three-tier permission system: Admin, Manager, and User roles with granular controls.',
              },
              {
                icon: BarChart3,
                title: 'Real-Time Analytics',
                description: 'Beautiful charts and metrics to track your projects, users, and activity over time.',
              },
              {
                icon: Zap,
                title: 'AI-Powered Insights',
                description: 'Get intelligent summaries of your activity logs with Claude AI integration.',
              },
              {
                icon: Users,
                title: 'User Management',
                description: 'Invite users, manage permissions, and track activity across your organization.',
              },
              {
                icon: Shield,
                title: 'Secure by Default',
                description: 'Built on Supabase with enterprise-grade security and authentication.',
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="group relative p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
            <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Explore the demo and see how easy it is to manage your multi-tenant application.
              <br />
              <span className="text-sm text-muted-foreground/80">No signup, no credit card, just click and explore!</span>
            </p>
            <DemoButton />
          </div>
        </div>
      </div>
    </div>
  )
}
