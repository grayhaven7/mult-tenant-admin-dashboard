-- Quick fix: Add RLS policy to allow users to view their own record
-- Run this in Supabase SQL Editor if you're getting "User record not found" errors

-- Drop the policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own record" ON users;

-- This policy allows users to always see their own record, even if tenant_id is not set yet
CREATE POLICY "Users can view their own record"
  ON users FOR SELECT
  USING (id = auth.uid());

-- Verify it was created:
-- SELECT * FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view their own record';

