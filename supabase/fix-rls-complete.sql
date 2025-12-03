-- Complete RLS Fix Script
-- Run this ENTIRE script in your Supabase SQL Editor

-- Step 1: Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users';

-- If rls_enabled is false, enable it:
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop the policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own record" ON users;

-- Step 3: Create the policy with explicit syntax
-- This policy MUST allow users to see their own record regardless of tenant_id
CREATE POLICY "Users can view their own record"
  ON users FOR SELECT
  USING (id = auth.uid());

-- Step 4: Verify the policy was created
SELECT 
  policyname,
  cmd,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE tablename = 'users'
AND policyname = 'Users can view their own record';

-- Step 5: Check ALL policies on users table to see if there are conflicts
SELECT 
  policyname,
  cmd,
  qual as using_clause,
  with_check,
  permissive
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname, cmd;

-- Step 6: Test if the user record exists (replace with actual user ID from auth.users)
-- First, get the user ID:
SELECT id, email FROM auth.users WHERE email = 'demo@acme.com';

-- Then check if the record exists in public.users (using service role, this bypasses RLS):
-- SELECT id, email, role, tenant_id FROM users WHERE email = 'demo@acme.com';

-- Step 7: If the record exists but RLS still blocks it, try making the policy more permissive
-- This is a temporary test - we'll revert it after
-- DROP POLICY IF EXISTS "Users can view their own record" ON users;
-- CREATE POLICY "Users can view their own record"
--   ON users FOR SELECT
--   USING (true);  -- This allows all users to see all records (TEMPORARY FOR TESTING ONLY)

-- IMPORTANT: If step 7 works, it means the policy syntax is the issue
-- Revert step 7 and use the correct policy from step 3

