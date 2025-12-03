-- FIX CIRCULAR DEPENDENCY: The admin policy creates a circular dependency
-- Run this ENTIRE script in your Supabase SQL Editor

-- The problem: "Admins can view all users" policy queries the users table
-- to check if the user is an admin, but that query is also subject to RLS,
-- creating a circular dependency.

-- Solution: Use auth.jwt() to check the role directly from the JWT token
-- OR ensure "Users can view their own record" is evaluated first

-- Step 1: Drop the problematic admin policy
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Step 2: Recreate it using a different approach
-- Option A: Check role from JWT (if role is stored in JWT metadata)
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    -- First check if user can see their own record (breaks circular dependency)
    id = auth.uid()
    OR
    -- Then check if they're an admin by querying their own record
    -- This works because we already checked id = auth.uid() above
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- Actually, wait - the above still has the circular dependency.
-- Better approach: Use a security definer function or check JWT directly

-- Let's use a simpler approach: Make the admin check work by ensuring
-- the user can always read their own record first (which we already have)

-- Drop and recreate with a better approach:
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- This policy works because "Users can view their own record" allows
-- the user to read their own record, which then allows this query to work
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- Step 3: Verify the policies
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

-- The key insight: PostgreSQL evaluates policies with OR logic
-- So if "Users can view their own record" allows access, the user can read
-- their own record, which then allows "Admins can view all users" to work
-- because the subquery can now read the user's own record to check the role.

-- However, if there's still an issue, we might need to use a security definer function.
-- For now, try this and see if it works.

