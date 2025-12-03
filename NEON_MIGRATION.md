# Migration from Supabase to Neon (Vercel Native Integration)

This guide will help you migrate from Supabase to Neon PostgreSQL with Vercel's native integration.

## Step 1: Set up Neon Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project
3. Go to **Storage** → **Create Database** → **Neon**
4. Follow the setup wizard
5. Copy the connection string (it will be automatically added as `POSTGRES_URL`)

## Step 2: Set up Environment Variables

Add these to your Vercel project and `.env.local`:

```env
# Neon Database (automatically set by Vercel)
POSTGRES_URL=your_neon_connection_string
POSTGRES_PRISMA_URL=your_neon_connection_string
POSTGRES_URL_NON_POOLING=your_neon_connection_string

# NextAuth
NEXTAUTH_URL=http://localhost:3000  # Change to your production URL
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32

# Anthropic (for AI features)
ANTHROPIC_API_KEY=your_anthropic_api_key
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

## Step 3: Run Database Schema

1. Go to your Neon dashboard
2. Open the SQL Editor
3. Run the entire `neon/schema.sql` file

## Step 4: Create Demo User

Run the script to create the demo user with proper password hash:

```bash
npx tsx scripts/create-demo-user.ts
```

Or manually create it:
```sql
-- Password hash for 'demo123456'
INSERT INTO users (id, email, password_hash, full_name, role, tenant_id)
VALUES (
  'f94c574c-a81b-47bd-99bb-3303ede20539',
  'demo@acme.com',
  '$2a$10$...', -- Generate with bcrypt
  'Demo User',
  'admin',
  'f0ebecb1-7dce-4c05-afeb-f7d71c816f9e'
);
```

## Step 5: Remove Supabase Dependencies

```bash
npm uninstall @supabase/ssr @supabase/supabase-js
```

## Step 6: Update Code

The following files have been updated:
- ✅ `lib/db.ts` - Neon database connection
- ✅ `lib/auth.ts` - NextAuth.js configuration
- ✅ `app/api/auth/[...nextauth]/route.ts` - NextAuth API route
- ✅ `neon/schema.sql` - Database schema
- ✅ `types/next-auth.d.ts` - NextAuth TypeScript types

## Step 7: Update All Pages

All pages need to be updated to use NextAuth instead of Supabase:
- `app/login/page.tsx`
- `app/signup/page.tsx`
- `app/dashboard/page.tsx`
- `app/projects/page.tsx`
- `app/activity/page.tsx`
- `app/settings/page.tsx`
- `app/api/demo/route.ts`

## Differences from Supabase

1. **Authentication**: Uses NextAuth.js instead of Supabase Auth
2. **Database**: Direct PostgreSQL queries instead of Supabase client
3. **RLS**: Application-level security instead of database RLS
4. **Password Storage**: Bcrypt hashed passwords in users table
5. **Session**: JWT-based sessions instead of Supabase sessions

## Benefits

- ✅ Native Vercel integration
- ✅ No external dependencies
- ✅ Simpler architecture
- ✅ Better performance (direct database connection)
- ✅ Full control over authentication flow

