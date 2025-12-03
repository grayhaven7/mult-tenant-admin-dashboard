# Demo Feature Troubleshooting

If you're getting "Failed to start demo" errors, here are the most common issues and solutions:

## 1. Supabase Environment Variables Not Set

**Error**: "Supabase not configured" or "Missing Supabase environment variables"

**Solution**: 
- Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in your Vercel environment variables
- For local development, add them to `.env.local`

## 2. Email Confirmation Required

**Error**: "Failed to sign in after signup"

**Solution**: 
In your Supabase dashboard:
1. Go to Authentication > Settings
2. Under "Email Auth", disable "Confirm email" or set it to "Off"
3. Alternatively, enable "Auto Confirm" for new users

This allows the demo account to be used immediately without email confirmation.

## 3. Database Schema Not Set Up

**Error**: "Failed to create demo account" or database errors

**Solution**:
1. Run the SQL from `supabase/schema.sql` in your Supabase SQL Editor
2. Make sure all tables (tenants, users, projects, activity_logs) are created
3. Verify RLS policies are in place

## 4. Service Role Key (Optional but Recommended)

**Note**: The demo works without a service role key, but it's recommended for better reliability.

**To add it**:
1. Go to Supabase Dashboard > Settings > API
2. Copy the "service_role" key (keep this secret!)
3. Add `SUPABASE_SERVICE_ROLE_KEY` to your Vercel environment variables

This allows the demo to:
- Create tenants without RLS restrictions
- Update user records with admin role
- Work more reliably

## 5. Check Browser Console

Open your browser's developer console (F12) and check for:
- Network errors when calling `/api/demo`
- Detailed error messages in the console
- Any CORS or authentication errors

## 6. Verify Supabase Connection

Test your Supabase connection:
1. Go to your Supabase dashboard
2. Check that your project is active
3. Verify the URL and anon key match your environment variables

## Quick Test

To test if Supabase is working:
1. Try signing up manually at `/signup`
2. If that works, the demo should work too
3. If manual signup fails, check your Supabase configuration

## Common Error Messages

- **"Invalid API key"**: Check your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **"Email already registered"**: The demo account already exists - try signing in manually first
- **"Row-level security policy violation"**: Make sure RLS policies are set up correctly
- **"Failed to create demo session"**: Check Supabase logs in the dashboard for more details

