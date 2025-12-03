# Environment Variables Setup - Neon + NextAuth

## ⚠️ Required Environment Variables

The "Configuration" error means NextAuth.js is missing required environment variables.

### 1. Set in Vercel Dashboard

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables** and add:

#### Required:
```env
NEXTAUTH_SECRET=<generate-with-openssl>
NEXTAUTH_URL=https://mult-tenant-admin-dashboard.vercel.app
POSTGRES_URL=<auto-added-by-neon>
```

#### Optional (for AI features):
```env
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 2. Generate NEXTAUTH_SECRET

Run this command in your terminal:
```bash
openssl rand -base64 32
```

Copy the output and paste it as the value for `NEXTAUTH_SECRET` in Vercel.

### 3. Set NEXTAUTH_URL

Set `NEXTAUTH_URL` to your production URL:
```
https://mult-tenant-admin-dashboard.vercel.app
```

**Important:** Use your actual Vercel deployment URL, not a placeholder.

### 4. Verify POSTGRES_URL

When you create a Neon database in Vercel (Storage → Create Database → Neon), the `POSTGRES_URL` is automatically added. Verify it exists in your environment variables.

### 5. Redeploy

After adding environment variables:
1. Go to **Deployments** tab
2. Click the **three dots (⋯)** on the latest deployment
3. Select **Redeploy**
4. Wait for deployment to complete

### 6. Test

After redeploying, try the demo again. The Configuration error should be resolved.

## Local Development

Create `.env.local` in the project root:

```env
POSTGRES_URL=your_neon_connection_string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret_here
ANTHROPIC_API_KEY=your_key_here
```

## Troubleshooting

### Still seeing "Configuration" error?

1. **Check variable names** - Must be exactly:
   - `NEXTAUTH_SECRET` (not `NEXT_AUTH_SECRET`)
   - `NEXTAUTH_URL` (not `NEXT_AUTH_URL`)
   - `POSTGRES_URL` (not `DATABASE_URL`)

2. **Check variable values** - No extra spaces or quotes

3. **Redeploy** - Environment variables only apply to new deployments

4. **Check logs** - Vercel Dashboard → Deployments → Your deployment → Functions tab

### Missing POSTGRES_URL?

1. Go to **Storage** tab in Vercel
2. Click **Create Database** → **Neon**
3. Follow the setup wizard
4. `POSTGRES_URL` will be automatically added

### Database connection issues?

1. Make sure you've run `neon/schema.sql` in your Neon SQL Editor
2. Verify the connection string is correct
3. Check Neon dashboard for any connection errors

