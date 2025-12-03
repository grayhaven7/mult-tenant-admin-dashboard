# Migration Status: Supabase → Neon + NextAuth

## ✅ Completed

1. **Dependencies Installed**
   - ✅ `@vercel/postgres` - Neon database connection
   - ✅ `next-auth@beta` - Authentication
   - ✅ `bcryptjs` - Password hashing
   - ✅ `tsx` - TypeScript execution

2. **Core Infrastructure**
   - ✅ `lib/db.ts` - Neon database utilities
   - ✅ `lib/auth.ts` - NextAuth.js configuration
   - ✅ `app/api/auth/[...nextauth]/route.ts` - NextAuth API route
   - ✅ `types/next-auth.d.ts` - NextAuth TypeScript types
   - ✅ `neon/schema.sql` - Database schema (no RLS, password-based auth)
   - ✅ `scripts/create-demo-user.ts` - Script to create demo user

3. **Documentation**
   - ✅ `NEON_MIGRATION.md` - Migration guide

## ⚠️ Still Needs Migration

All pages and API routes need to be updated:

1. **Authentication Pages**
   - [ ] `app/login/page.tsx` - Replace Supabase auth with NextAuth
   - [ ] `app/signup/page.tsx` - Replace Supabase auth with NextAuth

2. **Protected Pages**
   - [ ] `app/dashboard/page.tsx` - Use `auth()` from NextAuth, replace Supabase queries
   - [ ] `app/projects/page.tsx` - Replace Supabase queries with Neon
   - [ ] `app/activity/page.tsx` - Replace Supabase queries with Neon
   - [ ] `app/settings/page.tsx` - Replace Supabase queries with Neon

3. **API Routes**
   - [ ] `app/api/demo/route.ts` - Replace with NextAuth demo login
   - [ ] `app/api/activity/route.ts` - Replace Supabase with Neon
   - [ ] `app/api/summarize-activity/route.ts` - Update if needed

4. **Components**
   - [ ] `components/projects-table.tsx` - Update queries
   - [ ] `components/activity-log-table.tsx` - Update queries
   - [ ] `lib/activity-logger.ts` - Replace Supabase with Neon

5. **Middleware**
   - [ ] `middleware.ts` - Replace Supabase middleware with NextAuth middleware
   - [ ] `lib/supabase/middleware.ts` - Can be deleted

6. **Cleanup**
   - [ ] Remove `lib/supabase/` directory
   - [ ] Remove Supabase dependencies from `package.json`
   - [ ] Update `README.md` and other docs

## Next Steps

1. **Set up Neon Database in Vercel**
   - Go to Vercel Dashboard → Storage → Create Neon Database
   - Connection string will be auto-added as `POSTGRES_URL`

2. **Set Environment Variables**
   ```env
   POSTGRES_URL=your_neon_connection_string
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
   ANTHROPIC_API_KEY=your_key
   ```

3. **Run Database Schema**
   - Copy `neon/schema.sql` to Neon SQL Editor
   - Execute it

4. **Create Demo User**
   ```bash
   npx tsx scripts/create-demo-user.ts
   ```

5. **Update Pages** (I can help with this)
   - Replace all Supabase imports with NextAuth/Neon
   - Update all database queries
   - Update authentication checks

## Key Changes

- **Auth**: `supabase.auth.getUser()` → `auth()` from NextAuth
- **Database**: `supabase.from('table')` → `sql\`SELECT ...\``
- **Session**: Supabase session → NextAuth JWT session
- **Password**: Supabase Auth → Bcrypt hashed passwords in users table
- **RLS**: Database-level RLS → Application-level security checks

