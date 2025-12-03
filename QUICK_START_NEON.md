# Quick Start Guide - Neon + NextAuth

## 🚀 Setup Steps

### 1. Create Neon Database in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Storage** tab
4. Click **Create Database** → **Neon**
5. Follow the setup wizard
6. The `POSTGRES_URL` will be automatically added to your environment variables

### 2. Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```env
# NextAuth (REQUIRED)
NEXTAUTH_URL=https://your-app.vercel.app  # Your production URL
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32

# Anthropic (for AI features)
ANTHROPIC_API_KEY=your_anthropic_api_key
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**For local development**, create `.env.local`:
```env
POSTGRES_URL=your_neon_connection_string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret
ANTHROPIC_API_KEY=your_key
```

### 3. Run Database Schema

1. Go to your Neon dashboard (from Vercel Storage tab, click "Open Dashboard")
2. Open **SQL Editor**
3. Copy and paste the entire contents of `neon/schema.sql`
4. Click **Run**

### 4. Create Demo User

Run this command (make sure `POSTGRES_URL` is set in your environment):

```bash
npx tsx scripts/create-demo-user.ts
```

This creates:
- **Email**: `demo@acme.com`
- **Password**: `demo123456`
- **Role**: `admin`

### 5. Deploy

1. Commit and push your changes
2. Vercel will automatically deploy
3. Make sure all environment variables are set in Vercel

### 6. Test

1. Visit your deployed site
2. Click **"Try Demo - No Account Needed"**
3. You should be logged in and redirected to the dashboard!

## ✅ What's Different from Supabase

- **No RLS policies** - Security is handled at the application level
- **Password-based auth** - Passwords are hashed with bcrypt
- **Direct SQL queries** - Using `@vercel/postgres` instead of Supabase client
- **NextAuth sessions** - JWT-based sessions instead of Supabase sessions

## 🎉 You're Done!

The app is now running on Neon with NextAuth. No more RLS issues!

