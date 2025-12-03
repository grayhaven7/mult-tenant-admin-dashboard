-- FINAL VERIFICATION: Check if everything is set up correctly
-- Run this to verify all RLS policies and functions are working

-- Step 1: Verify is_admin function exists and is SECURITY DEFINER
SELECT 
  'Function Status' as check_type,
  proname as function_name,
  prosecdef as is_security_definer,
  prorettype::regtype as return_type,
  CASE 
    WHEN prosecdef = true THEN '✓ Function is SECURITY DEFINER'
    ELSE '✗ Function is NOT SECURITY DEFINER'
  END as status
FROM pg_proc
WHERE proname = 'is_admin';

-- Step 2: Verify function permissions
SELECT 
  'Function Permissions' as check_type,
  has_function_privilege('authenticated', 'public.is_admin(uuid)'::regprocedure, 'EXECUTE') as authenticated_can_execute,
  has_function_privilege('anon', 'public.is_admin(uuid)'::regprocedure, 'EXECUTE') as anon_can_execute,
  CASE 
    WHEN has_function_privilege('authenticated', 'public.is_admin(uuid)'::regprocedure, 'EXECUTE') 
      AND has_function_privilege('anon', 'public.is_admin(uuid)'::regprocedure, 'EXECUTE')
    THEN '✓ All permissions correct'
    ELSE '✗ Missing permissions'
  END as permission_status;

-- Step 3: Verify RLS is enabled
SELECT 
  'RLS Status' as check_type,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity = true THEN '✓ RLS is ENABLED'
    ELSE '✗ RLS is DISABLED'
  END as status
FROM pg_tables
WHERE tablename = 'users';

-- Step 4: Verify all SELECT policies exist and are correct
SELECT 
  'Policy Check' as check_type,
  policyname,
  cmd,
  qual as using_clause,
  CASE 
    WHEN policyname = 'Users can view their own record' 
      AND cmd = 'SELECT' 
      AND qual = '(id = auth.uid())'
    THEN '✓ CRITICAL POLICY CORRECT'
    WHEN policyname = 'Admins can view all users'
      AND cmd = 'SELECT'
      AND qual LIKE '%is_admin%'
    THEN '✓ ADMIN POLICY USES FUNCTION'
    WHEN policyname = 'Users can view users in their tenant'
      AND cmd = 'SELECT'
    THEN '✓ TENANT POLICY EXISTS'
    ELSE '⚠ Check this policy'
  END as status
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

-- Step 5: Verify user record exists (bypasses RLS)
SELECT 
  'User Record' as check_type,
  id,
  email,
  role,
  tenant_id,
  created_at,
  CASE 
    WHEN id IS NOT NULL THEN '✓ User record exists'
    ELSE '✗ User record missing'
  END as status
FROM users
WHERE email = 'demo@acme.com';

-- Step 6: Count total policies (should be at least 3 SELECT policies)
SELECT 
  'Policy Count' as check_type,
  COUNT(*) as total_select_policies,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✓ Enough policies'
    ELSE '✗ Missing policies'
  END as status
FROM pg_policies
WHERE tablename = 'users'
AND cmd = 'SELECT';

-- If all checks pass, the RLS should be working correctly!
-- Try the demo again and it should work.

