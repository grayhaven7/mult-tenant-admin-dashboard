export type UserRole = 'admin' | 'manager' | 'user'

export interface Tenant {
  id: string
  name: string
  created_at: string
}

export interface User {
  id: string
  email: string
  password_hash?: string // Only present in database, not in API responses
  full_name: string | null
  role: UserRole
  tenant_id: string
  avatar_url: string | null
  created_at: string
}

export interface Project {
  id: string
  name: string
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold'
  assigned_user_id: string | null
  tenant_id: string
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  user_id: string
  action: string
  details: string | null
  tenant_id: string
  created_at: string
}

export interface ProjectWithRelations extends Project {
  assigned_user: User | null
}

export interface ActivityLogWithRelations extends ActivityLog {
  user: User
}

