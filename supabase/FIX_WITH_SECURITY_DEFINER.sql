-- FIX WITH SECURITY DEFINER FUNCTION
-- This is the most reliable way to fix the circular dependency
-- Run this ENTIRE script in your Supabase SQL Editor

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

-- Step 2: Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon;

-- Step 3: Drop the existing admin policy
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Step 4: Recreate it using the security definer function
-- This avoids the circular dependency because the function bypasses RLS
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Step 5: Verify all policies
SELECT 
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

-- Step 6: Test the function (should return true for admin users)
-- SELECT public.is_admin('f94c574c-a81b-47bd-99bb-3303ede20539'::UUID);

-- This approach is better because:
-- 1. The security definer function bypasses RLS
-- 2. It can always check if a user is an admin
-- 3. No circular dependency issues
-- 4. More performant (function is cached)

