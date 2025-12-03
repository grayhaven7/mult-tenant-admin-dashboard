# Environment Variables Setup

## Local Development

Create a `.env.local` file in the root directory with the following:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://rflcprbltdflxinotvty.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmbGNwcmJsdGRmbHhpbm90dnR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MjM3ODUsImV4cCI6MjA4MDI5OTc4NX0.OJvrpSoiCTiR74Z9jNJjxk7AINvEwYdSLzgcabLa-s0"

# Supabase Service Role Key (for admin operations like creating demo accounts)
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmbGNwcmJsdGRmbHhpbm90dnR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDcyMzc4NSwiZXhwIjoyMDgwMjk5Nzg1fQ.2UIIeXayVllAi2QHVa_vywuN6yTZKqXVW8jQbpjB9-c"

# Anthropic Claude API (for AI summarization feature)
# Get your key from: https://console.anthropic.com/
ANTHROPIC_API_KEY="your_anthropic_api_key_here"

# Optional: Site URL for email redirects
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

## Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings > Environment Variables**
3. Add each variable:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://rflcprbltdflxinotvty.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmbGNwcmJsdGRmbHhpbm90dnR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MjM3ODUsImV4cCI6MjA4MDI5OTc4NX0.OJvrpSoiCTiR74Z9jNJjxk7AINvEwYdSLzgcabLa-s0`
   - `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmbGNwcmJsdGRmbHhpbm90dnR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDcyMzc4NSwiZXhwIjoyMDgwMjk5Nzg1fQ.2UIIeXayVllAi2QHVa_vywuN6yTZKqXVW8jQbpjB9-c`
   - `ANTHROPIC_API_KEY` = (your Anthropic API key)
   - `NEXT_PUBLIC_SITE_URL` = (your Vercel deployment URL, e.g., `https://your-app.vercel.app`)

4. Make sure to select **Production**, **Preview**, and **Development** environments
5. Click **Save**
6. Redeploy your application

## Important Notes

⚠️ **Security Warning**: 
- Never commit `.env.local` to git (it's already in `.gitignore`)
- The `SUPABASE_SERVICE_ROLE_KEY` has admin access - keep it secret!
- Only use service role key on the server side (never expose to client)

## Next Steps

After setting up environment variables:

1. **Run the database schema**: Execute `supabase/schema.sql` in your Supabase SQL Editor
2. **Disable email confirmation**: Go to Supabase Dashboard > Authentication > Settings > Email Auth > Set "Confirm email" to "Off"
3. **Test the demo**: Click "Try Demo Free" on the landing page

