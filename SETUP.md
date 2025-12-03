# Setup Guide

This guide will help you set up the Multi-Tenant Admin Dashboard from scratch.

## Prerequisites

1. **Node.js 18+** and npm installed
2. **Supabase Account** - Sign up at [supabase.com](https://supabase.com)
3. **Anthropic API Key** - Get one from [console.anthropic.com](https://console.anthropic.com) (for AI features)

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned
3. Note down your project URL and anon key from Settings > API

## Step 2: Set Up Database Schema

1. In your Supabase project, go to SQL Editor
2. Copy the contents of `supabase/schema.sql`
3. Paste and run it in the SQL Editor
4. This will create:
   - All necessary tables (tenants, users, projects, activity_logs)
   - Row-level security policies
   - Indexes and triggers

## Step 3: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ANTHROPIC_API_KEY=your-anthropic-api-key
   ```

## Step 4: Create Demo Users

### Option A: Using Supabase Dashboard

1. Go to Authentication > Users in Supabase dashboard
2. Click "Add User" > "Create New User"
3. Create the following users:

**Admin User:**
- Email: `admin@acme.com`
- Password: `admin123456`
- Auto Confirm: Yes

**Manager User:**
- Email: `manager@acme.com`
- Password: `manager123456`
- Auto Confirm: Yes

**Regular User:**
- Email: `user@acme.com`
- Password: `user123456`
- Auto Confirm: Yes

### Option B: Using Supabase CLI (if installed)

```bash
supabase auth users create admin@acme.com --password admin123456
supabase auth users create manager@acme.com --password manager123456
supabase auth users create user@acme.com --password user123456
```

## Step 5: Seed Database

After creating users in Supabase Auth, you need to:

1. Get the user IDs from Authentication > Users in Supabase dashboard
2. Go to SQL Editor and run the following (replace USER_IDs with actual IDs):

```sql
-- Create tenants
INSERT INTO tenants (id, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Acme Corporation'),
  ('00000000-0000-0000-0000-000000000002', 'TechFlow Solutions'),
  ('00000000-0000-0000-0000-000000000003', 'Global Dynamics Inc')
ON CONFLICT (id) DO NOTHING;

-- Link users to tenants (replace USER_IDs with actual IDs from auth.users)
INSERT INTO users (id, email, full_name, role, tenant_id) VALUES
  ('ADMIN_USER_ID', 'admin@acme.com', 'Sarah Johnson', 'admin', '00000000-0000-0000-0000-000000000001'),
  ('MANAGER_USER_ID', 'manager@acme.com', 'Michael Chen', 'manager', '00000000-0000-0000-0000-000000000001'),
  ('USER_USER_ID', 'user@acme.com', 'Emily Rodriguez', 'user', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  tenant_id = EXCLUDED.tenant_id;

-- Create some demo projects
INSERT INTO projects (name, status, assigned_user_id, tenant_id) VALUES
  ('Website Redesign', 'in_progress', 'USER_USER_ID', '00000000-0000-0000-0000-000000000001'),
  ('Mobile App Development', 'planning', 'USER_USER_ID', '00000000-0000-0000-0000-000000000001'),
  ('API Integration', 'completed', 'USER_USER_ID', '00000000-0000-0000-0000-000000000001'),
  ('Database Migration', 'in_progress', 'USER_USER_ID', '00000000-0000-0000-0000-000000000001'),
  ('Security Audit', 'planning', 'USER_USER_ID', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Create some activity logs
INSERT INTO activity_logs (user_id, tenant_id, action, details) VALUES
  ('ADMIN_USER_ID', '00000000-0000-0000-0000-000000000001', 'user logged in', 'Admin logged into the system'),
  ('USER_USER_ID', '00000000-0000-0000-0000-000000000001', 'created project', 'Created project: Website Redesign'),
  ('USER_USER_ID', '00000000-0000-0000-0000-000000000001', 'edited project', 'Updated project: Website Redesign')
ON CONFLICT DO NOTHING;
```

## Step 6: Install Dependencies and Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 7: Test the Application

1. Go to the landing page
2. Click "View Demo" or go to `/login`
3. Try logging in with:
   - Email: `admin@acme.com`
   - Password: `admin123456`
4. Explore the dashboard, projects, activity logs, and settings

## Troubleshooting

### "User not found" error
- Make sure you've created the user in the `users` table with the correct auth user ID
- The user ID in `users` table must match the ID in `auth.users`

### RLS Policy errors
- Verify that all RLS policies were created correctly
- Check that users have the correct `tenant_id` set

### AI Summarization not working
- Verify `ANTHROPIC_API_KEY` is set correctly
- Check the API key has sufficient credits

### Demo login not working
- Make sure you've created a user with email `demo@acme.com` and password `demo123456`
- The user must exist in both `auth.users` and the `users` table

## Next Steps

- Customize the branding and colors
- Add more features as needed
- Deploy to Vercel (see README.md)

