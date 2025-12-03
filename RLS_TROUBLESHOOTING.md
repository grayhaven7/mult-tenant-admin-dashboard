# RLS Policy Troubleshooting Guide

If you're getting "User record not found" or "User record created but cannot be read" errors, follow these steps:

## Step 1: Verify the Policy Exists

Run this SQL in your Supabase SQL Editor:

```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users' 
AND policyname = 'Users can view their own record';
```

**Expected Result:** You should see one row with:
- `policyname`: "Users can view their own record"
- `cmd`: "SELECT"
- `qual`: "(id = auth.uid())"

**If you see no rows:** The policy doesn't exist. Go to Step 2.

## Step 2: Create the Policy

Run this SQL in your Supabase SQL Editor:

```sql
-- Drop if exists to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own record" ON users;

-- Create the policy
CREATE POLICY "Users can view their own record"
  ON users FOR SELECT
  USING (id = auth.uid());
```

## Step 3: Verify All Policies

Run the comprehensive diagnostic script:

```sql
-- See supabase/diagnose-rls.sql for full diagnostics
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY policyname;
```

You should see at least these policies:
1. "Admins can view all users" (SELECT)
2. **"Users can view their own record" (SELECT)** ← This is critical!
3. "Users can view users in their tenant" (SELECT)
4. "Users can update their own profile" (UPDATE)
5. "Managers and admins can insert users" (INSERT)
6. "Users can insert their own record" (INSERT)

## Step 4: Check RLS is Enabled

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';
```

`rowsecurity` should be `true`. If it's `false`, enable it:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

## Step 5: Test the Policy

After creating the policy, try the demo again. The error should be resolved.

## Common Issues

### Issue: Policy exists but still getting errors

**Possible causes:**
1. **Policy order matters** - Supabase evaluates policies in order. Make sure "Users can view their own record" is created.
2. **Session not authenticated** - The `auth.uid()` function returns `NULL` if the user isn't authenticated. Check that the sign-in succeeded.
3. **Policy syntax error** - Verify the policy was created without errors.

**Solution:** Run the diagnostic script (`supabase/diagnose-rls.sql`) to see all policies and their configurations.

### Issue: "Policy already exists" error

If you get this error when running the fix script:

```sql
-- This will drop and recreate it safely
DROP POLICY IF EXISTS "Users can view their own record" ON users;
CREATE POLICY "Users can view their own record"
  ON users FOR SELECT
  USING (id = auth.uid());
```

### Issue: Multiple policies with same name

If you accidentally created the policy multiple times:

```sql
-- List all policies with this name
SELECT * FROM pg_policies 
WHERE tablename = 'users' 
AND policyname = 'Users can view their own record';

-- Drop all instances
DROP POLICY IF EXISTS "Users can view their own record" ON users;

-- Create it once
CREATE POLICY "Users can view their own record"
  ON users FOR SELECT
  USING (id = auth.uid());
```

## Still Having Issues?

1. Check the Supabase logs in your dashboard for detailed error messages
2. Verify your environment variables are set correctly (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
3. Make sure email confirmation is disabled in Supabase Auth settings (for demo accounts)
4. Check the browser console and server logs for additional error details

## Quick Fix Script

The fastest way to fix this is to run `supabase/fix-rls-policy.sql` in your Supabase SQL Editor. This script:
- Drops the policy if it exists (to avoid conflicts)
- Creates the policy with the correct syntax
- Includes verification queries

