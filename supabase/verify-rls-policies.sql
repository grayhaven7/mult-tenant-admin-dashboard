-- Verify RLS policies are set up correctly
-- Run this to check if all required policies exist

-- Check users table policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- Expected policies for users table:
-- 1. "Admins can view all users"
-- 2. "Users can view their own record" (CRITICAL - must exist!)
-- 3. "Users can view users in their tenant"
-- 4. "Users can update their own profile"
-- 5. "Managers and admins can insert users"
-- 6. "Users can insert their own record"

-- If "Users can view their own record" is missing, run:
-- CREATE POLICY "Users can view their own record"
--   ON users FOR SELECT
--   USING (id = auth.uid());

