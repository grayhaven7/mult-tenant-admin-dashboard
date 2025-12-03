-- Quick fix: Add RLS policy to allow users to view their own record
-- Run this in Supabase SQL Editor if you're getting "User record not found" errors

-- Drop the policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own record" ON users;

-- This policy allows users to always see their own record, even if tenant_id is not set yet
-- This MUST be created for the demo/login flow to work
CREATE POLICY "Users can view their own record"
  ON users FOR SELECT
  USING (id = auth.uid());

-- Verify it was created (run this separately to check):
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view their own record';

-- If you still get errors, check for conflicting policies:
-- SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'users' ORDER BY policyname;

