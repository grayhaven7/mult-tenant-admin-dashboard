# Vercel Environment Variables Setup

## ✅ If You See "Variable Already Exists"

If Vercel shows the message:
> "A variable with the name `SUPABASE_SERVICE_ROLE_KEY` already exists..."

**This is good!** The variable is already set up. You don't need to add it again.

## Required Environment Variables

Make sure these are set in your Vercel project:

### Required Variables:
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for demo account creation)

### Optional Variables:
- `ANTHROPIC_API_KEY` - For AI summarization feature (optional)
- `NEXT_PUBLIC_SITE_URL` - Your Vercel deployment URL (optional, defaults to localhost)

## How to Check/Update Existing Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings > Environment Variables**
3. Find the variable you want to check/update
4. Click the **three dots (⋯)** next to it
5. Select **Edit** to update the value
6. Or **Delete** if you need to remove and re-add it

## Verify Your Setup

After setting up environment variables:

1. **Redeploy** your application (Vercel will use the new variables)
2. Go to your deployment
3. Click **"Try Demo - No Account Needed"**
4. You should be able to access the dashboard

## Troubleshooting

If the demo still doesn't work after setting up variables:

1. **Check variable names** - They must match exactly (case-sensitive)
2. **Check variable values** - Make sure there are no extra spaces or quotes
3. **Redeploy** - Environment variables only apply to new deployments
4. **Check logs** - Go to Vercel dashboard > Deployments > Your deployment > Functions tab to see server logs

## Important Notes

- Environment variables are **case-sensitive**
- Changes to environment variables require a **new deployment** to take effect
- `NEXT_PUBLIC_*` variables are exposed to the browser (safe for public keys)
- `SUPABASE_SERVICE_ROLE_KEY` is **server-only** and should never be exposed to the client

