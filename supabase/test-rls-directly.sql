-- Test RLS policy directly in Supabase SQL Editor
-- This helps verify if the policy is working correctly

-- IMPORTANT: You must be authenticated as the user you're testing
-- The auth.uid() function only works when you're logged in

-- Step 1: Check what auth.uid() returns (should return your user ID)
SELECT auth.uid() as current_user_id;

-- Step 2: Check if you can see your own record
SELECT 
  id,
  email,
  role,
  tenant_id,
  created_at
FROM users
WHERE id = auth.uid();

-- Step 3: If the above returns a row, RLS is working!
-- If it returns no rows, the policy is not working correctly

-- Step 4: Check all policies on the users table
SELECT 
  policyname,
  cmd,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- Step 5: Verify the critical policy exists and is correct
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'users' 
      AND policyname = 'Users can view their own record'
      AND cmd = 'SELECT'
      AND qual = '(id = auth.uid())'
    ) 
    THEN '✓ Policy exists and looks correct' 
    ELSE '✗ Policy missing or incorrect' 
  END as policy_status;

-- Step 6: If policy is missing, run this:
/*
DROP POLICY IF EXISTS "Users can view their own record" ON users;

CREATE POLICY "Users can view their own record"
  ON users FOR SELECT
  USING (id = auth.uid());
*/

