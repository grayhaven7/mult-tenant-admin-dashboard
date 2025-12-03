'use client'

import { useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { ProjectDialog } from './project-dialog'
import { format } from 'date-fns'
import { ProjectWithRelations, User } from '@/types/database'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ProjectsTableProps {
  initialProjects: ProjectWithRelations[]
  users: User[]
  currentUser: { role: string; tenant_id: string }
}

const statusColors = {
  planning: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  in_progress: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  completed: 'bg-green-500/10 text-green-500 border-green-500/20',
  on_hold: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
}

export function ProjectsTable({ initialProjects, users, currentUser }: ProjectsTableProps) {
  const [projects, setProjects] = useState(initialProjects)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [editingProject, setEditingProject] = useState<ProjectWithRelations | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [projects, searchQuery, statusFilter])

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    const project = projects.find((p) => p.id === projectId)
    const projectName = project?.name || 'project'

    const response = await fetch(`/api/projects?id=${projectId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      toast.error('Failed to delete project')
      return
    }

    setProjects(projects.filter((p) => p.id !== projectId))
    toast.success('Project deleted successfully')
    router.refresh()
  }

  const handleCreate = () => {
    setEditingProject(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (project: ProjectWithRelations) => {
    setEditingProject(project)
    setIsDialogOpen(true)
  }

  const handleDialogClose = async () => {
    setIsDialogOpen(false)
    setEditingProject(null)
    // Refetch projects
    const response = await fetch('/api/projects')
    if (response.ok) {
      const data = await response.json()
      setProjects(data.projects)
    }
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-border bg-background text-foreground"
        >
          <option value="all">All Status</option>
          <option value="planning">Planning</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
        </select>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No projects found
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => (
                <TableRow key={project.id} className="hover:bg-accent/50 transition-colors">
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[project.status]}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {project.assigned_user ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={project.assigned_user.avatar_url || undefined} />
                          <AvatarFallback>
                            {project.assigned_user.full_name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{project.assigned_user.full_name || 'Unknown'}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(project.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(project)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(project.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        project={editingProject}
        users={users}
        currentUser={currentUser}
        onSuccess={handleDialogClose}
      />
    </div>
  )
}

