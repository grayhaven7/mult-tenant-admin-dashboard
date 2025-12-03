# Troubleshooting Guide

## Server-Side Error on Dashboard

If you're getting "Application error: a server-side exception has occurred":

### Common Causes:

1. **Missing Environment Variables**
   - Check Vercel dashboard > Settings > Environment Variables
   - Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
   - `SUPABASE_SERVICE_ROLE_KEY` should also be set for demo to work

2. **Database Schema Not Run**
   - Go to Supabase SQL Editor
   - Run `supabase/schema.sql` completely
   - Make sure all tables and RLS policies are created

3. **Missing RLS Policy**
   - Run this SQL in Supabase:
   ```sql
   CREATE POLICY "Users can view their own record"
     ON users FOR SELECT
     USING (id = auth.uid());
   ```

4. **User Record Not Created**
   - The demo route should create it automatically
   - Check Vercel function logs for `/api/demo` to see if there are errors
   - Make sure `SUPABASE_SERVICE_ROLE_KEY` is set correctly

## How to Check Vercel Logs

1. Go to Vercel Dashboard > Your Project
2. Click on **Deployments**
3. Click on the latest deployment
4. Go to **Functions** tab
5. Look for errors in `/api/demo` or server-side errors

## How to Check Supabase Logs

1. Go to Supabase Dashboard
2. Navigate to **Logs** > **Postgres Logs** or **API Logs**
3. Look for any errors related to user creation or RLS policies

## Quick Fix Checklist

- [ ] Environment variables set in Vercel
- [ ] Database schema (`supabase/schema.sql`) run in Supabase
- [ ] RLS policy "Users can view their own record" added
- [ ] Email confirmation disabled in Supabase Auth settings
- [ ] Service role key is correct and has proper permissions

## Test the Demo Route Directly

You can test if the demo route works by making a POST request:

```bash
curl -X POST https://your-app.vercel.app/api/demo
```

Check the response - it should return `{"success": true, "user": {...}}`

If it returns an error, check the error message for details.

