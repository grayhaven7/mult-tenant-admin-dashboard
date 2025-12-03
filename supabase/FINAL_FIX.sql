-- FINAL FIX: Use Security Definer Function to Break Circular Dependency
-- Run this ENTIRE script in your Supabase SQL Editor

-- The Problem:
-- The "Admins can view all users" policy has a subquery that checks the users table
-- to see if the user is an admin. But that subquery is ALSO subject to RLS,
-- creating a circular dependency.

-- The Solution:
-- Use a SECURITY DEFINER function that bypasses RLS to check if a user is an admin.

-- Step 1: Create a security definer function to check if user is admin
-- This function runs with the privileges of the function creator (postgres),
-- bypassing RLS, so it can always check the user's role
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id
    AND role = 'admin'
  );
$$;

-- Step 2: Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon;

-- Step 3: Drop the existing admin policy
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Step 4: Recreate it using the security definer function
-- This avoids the circular dependency because the function bypasses RLS
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Step 4b: Also fix the tenant policy to avoid circular dependency
-- Create a function to get user's tenant_id
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(user_id UUID)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT tenant_id FROM public.users
  WHERE id = user_id;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_tenant_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_tenant_id(UUID) TO anon;

-- Drop and recreate the tenant policy
DROP POLICY IF EXISTS "Users can view users in their tenant" ON users;

CREATE POLICY "Users can view users in their tenant"
  ON users FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Step 5: Verify all policies are correct
SELECT 
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
    THEN '✓ ADMIN POLICY USES FUNCTION (NO CIRCULAR DEPENDENCY)'
    WHEN policyname = 'Users can view users in their tenant'
      AND cmd = 'SELECT'
      AND qual LIKE '%get_user_tenant_id%'
    THEN '✓ TENANT POLICY USES FUNCTION (NO CIRCULAR DEPENDENCY)'
    WHEN policyname LIKE '%view%' AND cmd = 'SELECT'
    THEN '✓ Policy exists'
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

-- Step 6: Test the function (replace with your actual user ID)
-- This should return true for admin users, false for others
-- SELECT public.is_admin('f94c574c-a81b-47bd-99bb-3303ede20539'::UUID);

-- Why this works:
-- 1. SECURITY DEFINER functions run with the privileges of the function creator
-- 2. They bypass RLS, so they can always read the users table
-- 3. No circular dependency - the function can check the role without RLS blocking it
-- 4. The policy evaluation is now: "Can the user see this row? Check if they're an admin using a function that bypasses RLS"

-- After running this, try the demo again. The RLS should now work correctly!

