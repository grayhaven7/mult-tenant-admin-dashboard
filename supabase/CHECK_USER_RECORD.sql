-- Check if the demo user record exists and is accessible
-- Run this to verify the user record is in the database

-- Step 1: Check if user exists in auth.users
SELECT 
  'Auth User' as check_type,
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN id IS NOT NULL THEN '✓ User exists in auth.users'
    ELSE '✗ User missing from auth.users'
  END as status
FROM auth.users
WHERE email = 'demo@acme.com';

-- Step 2: Check if user record exists in public.users (bypasses RLS)
SELECT 
  'Public User Record' as check_type,
  id,
  email,
  role,
  tenant_id,
  created_at,
  CASE 
    WHEN id IS NOT NULL THEN '✓ User record exists in public.users'
    ELSE '✗ User record missing from public.users'
  END as status
FROM users
WHERE email = 'demo@acme.com';

-- Step 3: Check if tenant exists
SELECT 
  'Tenant Check' as check_type,
  t.id as tenant_id,
  t.name as tenant_name,
  u.id as user_id,
  u.email as user_email,
  CASE 
    WHEN t.id IS NOT NULL AND u.tenant_id = t.id THEN '✓ User has valid tenant'
    WHEN t.id IS NULL THEN '✗ Tenant missing'
    WHEN u.tenant_id IS NULL THEN '✗ User has no tenant_id'
    ELSE '⚠ Tenant mismatch'
  END as status
FROM users u
LEFT JOIN tenants t ON u.tenant_id = t.id
WHERE u.email = 'demo@acme.com';

-- Step 4: Verify the user record has all required fields
SELECT 
  'User Record Completeness' as check_type,
  id,
  email,
  role,
  tenant_id,
  CASE 
    WHEN id IS NOT NULL 
      AND email IS NOT NULL 
      AND role IS NOT NULL 
      AND tenant_id IS NOT NULL
    THEN '✓ All required fields present'
    ELSE '✗ Missing required fields'
  END as status,
  CASE 
    WHEN role = 'admin' THEN '✓ User is admin'
    ELSE '⚠ User is not admin'
  END as role_status
FROM users
WHERE email = 'demo@acme.com';

-- If the user record doesn't exist, the demo route should create it
-- If it exists but RLS still blocks it, there's a policy issue

