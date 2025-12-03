-- Verify RLS is working correctly
-- Run this to check if the is_admin function exists and has proper permissions

-- Step 1: Check if is_admin function exists
SELECT 
  'Function Check' as check_type,
  proname as function_name,
  prosecdef as is_security_definer,
  prorettype::regtype as return_type
FROM pg_proc
WHERE proname = 'is_admin';

-- Step 2: Check function permissions
SELECT 
  'Function Permissions' as check_type,
  p.proname as function_name,
  r.rolname as role_name,
  has_function_privilege(r.rolname, p.oid, 'EXECUTE') as can_execute
FROM pg_proc p
CROSS JOIN pg_roles r
WHERE p.proname = 'is_admin'
AND r.rolname IN ('authenticated', 'anon', 'public')
ORDER BY r.rolname;

-- Step 3: Test the function directly (replace with your user ID)
-- This should return true for admin users
-- SELECT public.is_admin('f94c574c-a81b-47bd-99bb-3303ede20539'::UUID);

-- Step 4: Verify all policies are correct
SELECT 
  'Policy Check' as check_type,
  policyname,
  cmd,
  qual as using_clause
FROM pg_policies
WHERE tablename = 'users'
AND cmd = 'SELECT'
ORDER BY 
  CASE policyname
    WHEN 'Users can view their own record' THEN 1
    WHEN 'Admins can view all users' THEN 2
    WHEN 'Users can view users in their tenant' THEN 3
    ELSE 4
  END;

-- Step 5: Check if RLS is enabled
SELECT 
  'RLS Status' as check_type,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'users';

-- Step 6: Verify user record exists (bypasses RLS with service role)
SELECT 
  'User Record' as check_type,
  id,
  email,
  role,
  tenant_id
FROM users
WHERE email = 'demo@acme.com';

