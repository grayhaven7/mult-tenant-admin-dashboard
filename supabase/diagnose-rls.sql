-- Comprehensive RLS diagnostics for users table
-- Run this in Supabase SQL Editor to diagnose RLS issues

-- 1. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users';

-- 2. List all policies on users table
SELECT 
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- 3. Check specifically for the critical policy
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'users' 
      AND policyname = 'Users can view their own record'
    ) 
    THEN '✓ Policy EXISTS' 
    ELSE '✗ Policy MISSING - Run fix-rls-policy.sql!' 
  END as policy_status;

-- 4. Test the policy logic (replace 'YOUR_USER_ID' with actual UUID)
-- This simulates what the policy should allow
-- SELECT 
--   id,
--   email,
--   role,
--   tenant_id,
--   CASE 
--     WHEN id = auth.uid() THEN '✓ Can view (matches own ID)'
--     ELSE '✗ Cannot view'
--   END as access_check
-- FROM users
-- WHERE id = auth.uid();

-- 5. Check for potential conflicts
-- Policies are OR'd together, so multiple SELECT policies should work
-- But if one has restrictive WITH CHECK, it might cause issues
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN qual IS NULL THEN 'No USING clause'
    ELSE 'Has USING clause'
  END as has_using,
  CASE 
    WHEN with_check IS NULL THEN 'No WITH CHECK clause'
    ELSE 'Has WITH CHECK clause'
  END as has_with_check
FROM pg_policies 
WHERE tablename = 'users' 
AND cmd = 'SELECT';

