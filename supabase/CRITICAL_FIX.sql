-- CRITICAL FIX: Run this ENTIRE script in Supabase SQL Editor
-- This will fix the RLS policy issue

-- Step 1: Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL instances of the policy (in case there are duplicates or conflicts)
DROP POLICY IF EXISTS "Users can view their own record" ON users;

-- Step 3: Create the policy with the EXACT syntax needed
-- This policy MUST be created for users to read their own record
CREATE POLICY "Users can view their own record"
  ON users FOR SELECT
  USING (id = auth.uid());

-- Step 4: Verify it was created correctly
SELECT 
  'Policy Verification' as check_type,
  policyname,
  cmd,
  qual as using_clause,
  CASE 
    WHEN policyname = 'Users can view their own record' 
      AND cmd = 'SELECT' 
      AND qual = '(id = auth.uid())'
    THEN '✓ Policy is CORRECT'
    ELSE '✗ Policy is INCORRECT - check syntax'
  END as status
FROM pg_policies
WHERE tablename = 'users'
AND policyname = 'Users can view their own record';

-- Step 5: Check ALL policies to ensure no conflicts
SELECT 
  'All Policies' as check_type,
  policyname,
  cmd,
  qual as using_clause
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname, cmd;

-- IMPORTANT NOTES:
-- 1. In SQL Editor, auth.uid() returns NULL (this is expected)
-- 2. The policy will work when users are authenticated in your app
-- 3. To test if the user record exists, run this (bypasses RLS):
--    SELECT id, email, role, tenant_id FROM users WHERE email = 'demo@acme.com';
-- 4. The policy should allow authenticated users to see their own record

