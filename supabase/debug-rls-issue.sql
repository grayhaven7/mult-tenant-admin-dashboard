-- Debug RLS Issue - Run this to diagnose the problem
-- This will help identify why the RLS policy isn't working

-- 1. Check if RLS is enabled
SELECT 
  'RLS Status' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'users' 
      AND rowsecurity = true
    ) 
    THEN '✓ RLS is ENABLED' 
    ELSE '✗ RLS is DISABLED - Run: ALTER TABLE users ENABLE ROW LEVEL SECURITY;' 
  END as status;

-- 2. Check if the policy exists
SELECT 
  'Policy Exists' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'users' 
      AND policyname = 'Users can view their own record'
    ) 
    THEN '✓ Policy EXISTS' 
    ELSE '✗ Policy MISSING' 
  END as status;

-- 3. Check policy syntax
SELECT 
  'Policy Syntax' as check_type,
  policyname,
  cmd,
  qual as using_clause,
  CASE 
    WHEN qual = '(id = auth.uid())' THEN '✓ Syntax looks correct'
    WHEN qual IS NULL THEN '✗ No USING clause'
    ELSE '⚠ Syntax might be wrong: ' || qual
  END as syntax_check
FROM pg_policies
WHERE tablename = 'users'
AND policyname = 'Users can view their own record';

-- 4. List ALL SELECT policies (to check for conflicts)
SELECT 
  'All SELECT Policies' as check_type,
  policyname,
  permissive,
  qual as using_clause
FROM pg_policies
WHERE tablename = 'users'
AND cmd = 'SELECT'
ORDER BY policyname;

-- 5. Check if user record exists (bypassing RLS with service role)
-- Replace 'demo@acme.com' with your actual demo email
-- This query will work even if RLS blocks it (if run with service role)
SELECT 
  'User Record Exists' as check_type,
  id,
  email,
  role,
  tenant_id,
  created_at
FROM users
WHERE email = 'demo@acme.com';

-- 6. Test auth.uid() function
-- Note: In SQL Editor, this will be NULL unless you're authenticated
-- But in the application, it should return the user's ID
SELECT 
  'Auth Context' as check_type,
  auth.uid() as current_user_id,
  CASE 
    WHEN auth.uid() IS NULL THEN '⚠ auth.uid() is NULL (expected in SQL Editor)'
    ELSE '✓ auth.uid() returns: ' || auth.uid()::text
  END as auth_status;

-- 7. Check table permissions
SELECT 
  'Table Permissions' as check_type,
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'users'
AND grantee IN ('authenticated', 'anon', 'public')
ORDER BY grantee, privilege_type;

-- 8. If all above checks pass but RLS still doesn't work, try this:
-- Create a test policy that's more permissive to see if it works
-- (This is for debugging only - remove after testing)
/*
DROP POLICY IF EXISTS "TEST: Users can view their own record" ON users;
CREATE POLICY "TEST: Users can view their own record"
  ON users FOR SELECT
  USING (id = auth.uid() OR true);  -- This should always allow if user is authenticated

-- Test it, then remove:
DROP POLICY IF EXISTS "TEST: Users can view their own record" ON users;
*/

