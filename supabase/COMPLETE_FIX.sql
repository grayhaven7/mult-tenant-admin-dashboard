-- COMPLETE FIX: Run this ENTIRE script to fix all RLS issues
-- This ensures everything is set up correctly

-- Step 1: Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 2: Create or replace the is_admin function with proper permissions
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

-- Step 3: Grant execute permissions (CRITICAL - this might be missing!)
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO public;

-- Step 4: Ensure the function owner has proper permissions
ALTER FUNCTION public.is_admin(UUID) OWNER TO postgres;

-- Step 5: Drop and recreate all SELECT policies in the correct order

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own record" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can view users in their tenant" ON users;

-- Policy 1: Users can ALWAYS see their own record (MUST BE FIRST)
CREATE POLICY "Users can view their own record"
  ON users FOR SELECT
  USING (id = auth.uid());

-- Policy 2: Admins can see all users (uses security definer function)
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Policy 3: Users can see users in their tenant
CREATE POLICY "Users can view users in their tenant"
  ON users FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Step 6: Verify everything is set up correctly
SELECT 
  'Verification' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'is_admin' 
      AND prosecdef = true
    ) THEN '✓ is_admin() function exists and is SECURITY DEFINER'
    ELSE '✗ is_admin() function missing or incorrect'
  END as function_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'users' 
      AND policyname = 'Users can view their own record'
      AND cmd = 'SELECT'
      AND qual = '(id = auth.uid())'
    ) THEN '✓ Critical policy exists'
    ELSE '✗ Critical policy missing'
  END as policy_status;

-- Step 7: List all policies to verify
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

-- Step 8: Test function permissions
SELECT 
  'Function Permissions' as check_type,
  has_function_privilege('authenticated', 'public.is_admin(uuid)'::regprocedure, 'EXECUTE') as authenticated_can_execute,
  has_function_privilege('anon', 'public.is_admin(uuid)'::regprocedure, 'EXECUTE') as anon_can_execute;

-- After running this, the RLS should work correctly!
-- Try the demo again and it should work.

