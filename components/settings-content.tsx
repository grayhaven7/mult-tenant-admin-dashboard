'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Users, Building2, Mail } from 'lucide-react'
import { User as UserType, Tenant } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface SettingsContentProps {
  currentUser: UserType & { tenant: Tenant }
  users: (UserType & { tenant: Tenant })[]
  tenants: Tenant[]
}

export function SettingsContent({ currentUser, users, tenants }: SettingsContentProps) {
  const [fullName, setFullName] = useState(currentUser.full_name || '')
  const [loading, setLoading] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('users')
      .update({ full_name: fullName })
      .eq('id', currentUser.id)

    if (error) {
      toast.error('Failed to update profile')
      setLoading(false)
      return
    }

    toast.success('Profile updated successfully')
    setLoading(false)
    router.refresh()
  }

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviteLoading(true)

    // In a real app, you'd send an invitation email
    // For now, we'll just show a success message
    toast.success(`Invitation sent to ${inviteEmail}`)
    setInviteEmail('')
    setInviteLoading(false)

    // Log activity
    await fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'invited user',
        details: `Invited ${inviteEmail} to join the organization`,
      }),
    })
  }

  return (
    <Tabs defaultValue="profile" className="space-y-4">
      <TabsList>
        <TabsTrigger value="profile" className="gap-2">
          <User className="h-4 w-4" />
          Profile
        </TabsTrigger>
        {(currentUser.role === 'manager' || currentUser.role === 'admin') && (
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
        )}
        {currentUser.role === 'admin' && (
          <TabsTrigger value="tenants" className="gap-2">
            <Building2 className="h-4 w-4" />
            Tenants
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="profile" className="space-y-4">
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={currentUser.avatar_url || undefined} />
                <AvatarFallback className="text-2xl">
                  {currentUser.full_name?.[0] || currentUser.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{currentUser.full_name || 'No name set'}</p>
                <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                <p className="text-sm text-muted-foreground capitalize">{currentUser.role}</p>
              </div>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Organization</CardTitle>
            <CardDescription>Your organization information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm font-medium">Tenant</p>
              <p className="text-muted-foreground">{currentUser.tenant.name}</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {(currentUser.role === 'manager' || currentUser.role === 'admin') && (
        <TabsContent value="users" className="space-y-4">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Invite User</CardTitle>
              <CardDescription>Send an invitation to join your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInviteUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Email Address</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                  />
                </div>
                <Button type="submit" disabled={inviteLoading} className="gap-2">
                  <Mail className="h-4 w-4" />
                  {inviteLoading ? 'Sending...' : 'Send Invitation'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Organization Users</CardTitle>
              <CardDescription>All users in your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>
                          {user.full_name?.[0] || user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.full_name || 'No name'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm capitalize px-2 py-1 rounded bg-primary/10 text-primary">
                        {user.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      )}

      {currentUser.role === 'admin' && (
        <TabsContent value="tenants" className="space-y-4">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>All Tenants</CardTitle>
              <CardDescription>Manage all organizations in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tenants.map((tenant) => (
                  <div
                    key={tenant.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{tenant.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(tenant.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      )}
    </Tabs>
  )
}

