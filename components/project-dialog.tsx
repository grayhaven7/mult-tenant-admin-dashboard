'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProjectWithRelations, User } from '@/types/database'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: ProjectWithRelations | null
  users: User[]
  currentUser: { role: string; tenant_id: string }
  onSuccess: () => void
}

export function ProjectDialog({ open, onOpenChange, project, users, currentUser, onSuccess }: ProjectDialogProps) {
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'planning' | 'in_progress' | 'completed' | 'on_hold'>('planning')
  const [assignedUserId, setAssignedUserId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (project) {
      setName(project.name)
      setStatus(project.status)
      setAssignedUserId(project.assigned_user_id || '')
    } else {
      setName('')
      setStatus('planning')
      setAssignedUserId('')
    }
  }, [project, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const projectData = {
      name,
      status,
      assigned_user_id: assignedUserId || null,
      tenant_id: currentUser.tenant_id,
    }

    try {
      if (project) {
        // Update
        const response = await fetch('/api/projects', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: project.id,
            ...projectData,
          }),
        })

        if (!response.ok) {
          toast.error('Failed to update project')
          setLoading(false)
          return
        }

        toast.success('Project updated successfully')
      } else {
        // Create
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData),
        })

        if (!response.ok) {
          toast.error('Failed to create project')
          setLoading(false)
          return
        }

        toast.success('Project created successfully')
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }

    setLoading(false)
    onOpenChange(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{project ? 'Edit Project' : 'Create Project'}</DialogTitle>
          <DialogDescription>
            {project ? 'Update the project details below.' : 'Fill in the details to create a new project.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="assigned">Assigned To</Label>
            <Select value={assignedUserId} onValueChange={setAssignedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : project ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

