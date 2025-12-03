-- Seed data for multi-tenant admin dashboard

-- Insert tenants
INSERT INTO tenants (id, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Acme Corporation'),
  ('00000000-0000-0000-0000-000000000002', 'TechFlow Solutions'),
  ('00000000-0000-0000-0000-000000000003', 'Global Dynamics Inc');

-- Note: Users will be created via Supabase Auth, but we'll seed the users table
-- after auth users are created. For demo purposes, we'll create auth users via the seed script
-- but in production, users would sign up through the app.

-- Demo users (these would need to be created in auth.users first)
-- For now, we'll use placeholder UUIDs that should match actual auth user IDs

-- The seed script should be run after creating auth users, or you can use Supabase dashboard
-- to create users and then run this script with the correct user IDs.

-- Example structure (replace UUIDs with actual auth user IDs):
/*
INSERT INTO users (id, email, full_name, role, tenant_id) VALUES
  ('user-uuid-1', 'admin@acme.com', 'Sarah Johnson', 'admin', '00000000-0000-0000-0000-000000000001'),
  ('user-uuid-2', 'manager@acme.com', 'Michael Chen', 'manager', '00000000-0000-0000-0000-000000000001'),
  ('user-uuid-3', 'user1@acme.com', 'Emily Rodriguez', 'user', '00000000-0000-0000-0000-000000000001'),
  ('user-uuid-4', 'user2@acme.com', 'David Kim', 'user', '00000000-0000-0000-0000-000000000001'),
  ('user-uuid-5', 'manager@techflow.com', 'Jessica Martinez', 'manager', '00000000-0000-0000-0000-000000000002'),
  ('user-uuid-6', 'user1@techflow.com', 'Robert Taylor', 'user', '00000000-0000-0000-0000-000000000002'),
  ('user-uuid-7', 'user2@techflow.com', 'Amanda White', 'user', '00000000-0000-0000-0000-000000000002'),
  ('user-uuid-8', 'user3@techflow.com', 'James Wilson', 'user', '00000000-0000-0000-0000-000000000002'),
  ('user-uuid-9', 'manager@global.com', 'Lisa Anderson', 'manager', '00000000-0000-0000-0000-000000000003'),
  ('user-uuid-10', 'user1@global.com', 'Christopher Brown', 'user', '00000000-0000-0000-0000-000000000003'),
  ('user-uuid-11', 'user2@global.com', 'Jennifer Davis', 'user', '00000000-0000-0000-0000-000000000003'),
  ('user-uuid-12', 'user3@global.com', 'Matthew Garcia', 'user', '00000000-0000-0000-0000-000000000003');
*/

-- Projects (these will be inserted after users are created)
-- Using placeholder user IDs - replace with actual user IDs

/*
INSERT INTO projects (name, status, assigned_user_id, tenant_id) VALUES
  -- Acme Corporation projects
  ('Website Redesign', 'in_progress', 'user-uuid-3', '00000000-0000-0000-0000-000000000001'),
  ('Mobile App Development', 'planning', 'user-uuid-4', '00000000-0000-0000-0000-000000000001'),
  ('API Integration', 'completed', 'user-uuid-3', '00000000-0000-0000-0000-000000000001'),
  ('Database Migration', 'in_progress', 'user-uuid-4', '00000000-0000-0000-0000-000000000001'),
  ('Security Audit', 'planning', 'user-uuid-3', '00000000-0000-0000-0000-000000000001'),
  ('Performance Optimization', 'completed', 'user-uuid-4', '00000000-0000-0000-0000-000000000001'),
  ('Cloud Infrastructure', 'in_progress', 'user-uuid-3', '00000000-0000-0000-0000-000000000001'),
  
  -- TechFlow Solutions projects
  ('E-commerce Platform', 'in_progress', 'user-uuid-6', '00000000-0000-0000-0000-000000000002'),
  ('Analytics Dashboard', 'completed', 'user-uuid-7', '00000000-0000-0000-0000-000000000002'),
  ('Payment Gateway', 'in_progress', 'user-uuid-8', '00000000-0000-0000-0000-000000000002'),
  ('Customer Portal', 'planning', 'user-uuid-6', '00000000-0000-0000-0000-000000000002'),
  ('Inventory System', 'completed', 'user-uuid-7', '00000000-0000-0000-0000-000000000002'),
  ('Reporting Tool', 'in_progress', 'user-uuid-8', '00000000-0000-0000-0000-000000000002'),
  ('Mobile App', 'planning', 'user-uuid-6', '00000000-0000-0000-0000-000000000002'),
  
  -- Global Dynamics projects
  ('ERP System', 'in_progress', 'user-uuid-10', '00000000-0000-0000-0000-000000000003'),
  ('HR Management', 'completed', 'user-uuid-11', '00000000-0000-0000-0000-000000000003'),
  ('Financial Dashboard', 'in_progress', 'user-uuid-12', '00000000-0000-0000-0000-000000000003'),
  ('Document Management', 'planning', 'user-uuid-10', '00000000-0000-0000-0000-000000000003'),
  ('Time Tracking', 'completed', 'user-uuid-11', '00000000-0000-0000-0000-000000000003'),
  ('Project Management', 'in_progress', 'user-uuid-12', '00000000-0000-0000-0000-000000000003'),
  ('Communication Hub', 'planning', 'user-uuid-10', '00000000-0000-0000-0000-000000000003');
*/

