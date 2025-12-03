-- ULTIMATE FIX: This should resolve the RLS issue completely
-- Run this ENTIRE script in your Supabase SQL Editor

-- Step 1: Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies that might conflict
DROP POLICY IF EXISTS "Users can view their own record" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can view users in their tenant" ON users;

-- Step 3: Recreate policies in the correct order
-- IMPORTANT: The "Users can view their own record" policy MUST be created FIRST
-- This ensures it's evaluated before other policies

-- Policy 1: Users can ALWAYS see their own record (CRITICAL - must be first)
CREATE POLICY "Users can view their own record"
  ON users FOR SELECT
  USING (id = auth.uid());

-- Policy 2: Admins can see all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- Policy 3: Users can see users in their tenant
CREATE POLICY "Users can view users in their tenant"
  ON users FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Step 4: Verify all policies were created
SELECT 
  policyname,
  cmd,
  qual as using_clause,
  CASE 
    WHEN policyname = 'Users can view their own record' 
      AND cmd = 'SELECT' 
      AND qual = '(id = auth.uid())'
    THEN '✓ CRITICAL POLICY IS CORRECT'
    WHEN policyname LIKE '%view%' AND cmd = 'SELECT'
    THEN '✓ Policy exists'
    ELSE '⚠ Check this policy'
  END as status
FROM pg_policies
WHERE tablename = 'users'
AND cmd = 'SELECT'
ORDER BY policyname;

-- Step 5: Test query (this will return NULL in SQL Editor, but works in app)
SELECT 
  'Test' as check_type,
  auth.uid() as current_user_id,
  CASE 
    WHEN auth.uid() IS NULL THEN '⚠ auth.uid() is NULL (expected in SQL Editor)'
    ELSE '✓ auth.uid() returns: ' || auth.uid()::text
  END as note;

-- Step 6: Verify user record exists (bypasses RLS)
SELECT 
  'User Record Check' as check_type,
  id,
  email,
  role,
  tenant_id
FROM users
WHERE email = 'demo@acme.com';

-- If the above query returns a row, the user record exists
-- The RLS policy should now allow the user to see their own record when authenticated

