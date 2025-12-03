# Quick Start Checklist

Since your Vercel environment variables are already set up, here's what to verify:

## ✅ Environment Variables (Already Done)
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Set in Vercel
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Set in Vercel  
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Set in Vercel

## 🔧 Required Setup Steps

### 1. Database Schema
**Must be done in Supabase:**
1. Go to https://supabase.com/dashboard/project/rflcprbltdflxinotvty
2. Click **SQL Editor** in the left sidebar
3. Open the file `supabase/schema.sql` from this project
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. You should see "Success. No rows returned"

### 2. Disable Email Confirmation
**Required for demo to work:**
1. In Supabase Dashboard, go to **Authentication > Settings**
2. Scroll to **Email Auth** section
3. Find **"Confirm email"** setting
4. Set it to **"Off"** or enable **"Auto Confirm"**
5. Click **Save**

### 3. Test the Demo
1. Visit your Vercel deployment URL
2. Click **"Try Demo - No Account Needed"** button
3. You should be automatically logged in and see the dashboard

## 🐛 If Demo Still Doesn't Work

Check the browser console (F12) for errors:
- Network errors → Check if API routes are accessible
- Authentication errors → Verify Supabase credentials
- Database errors → Make sure schema.sql was run

Check Vercel function logs:
1. Go to Vercel Dashboard > Your Project > Deployments
2. Click on the latest deployment
3. Go to **Functions** tab
4. Look for `/api/demo` logs
5. Check for any error messages

## 🎉 Expected Behavior

When you click "Try Demo":
1. Form fields auto-fill with `demo@acme.com` / `demo123456`
2. Automatic sign-in happens
3. Demo account is created (if it doesn't exist)
4. User record is created in `users` table
5. Tenant "Acme Corporation" is created (if needed)
6. You're redirected to dashboard
7. Dashboard shows stats and charts

If all of this works, you're all set! 🚀

