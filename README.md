# Multi-Tenant Admin Dashboard

A modern, production-ready admin dashboard built with Next.js, Supabase, Tailwind CSS, and Shadcn UI. Features multi-tenant architecture with role-based access control, beautiful dark theme UI, and AI-powered activity summarization.

## Features

- 🏢 **Multi-Tenant Architecture** - Complete tenant isolation with row-level security
- 👥 **Role-Based Access Control** - Admin, Manager, and User roles
- 📊 **Real-Time Dashboard** - Animated stats cards and activity charts
- 📁 **Project Management** - Full CRUD operations with search and filters
- 📝 **Activity Logging** - Comprehensive activity tracking with timeline view
- 🤖 **AI Summarization** - Claude AI-powered activity log summaries
- 🎨 **Beautiful UI** - Modern dark theme with gradients and micro-interactions
- 🔒 **Secure by Default** - Built on Supabase with enterprise-grade security

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Charts**: Recharts
- **AI**: Anthropic Claude API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Anthropic API key (for AI features)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mult-tenant-admin-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials and Anthropic API key:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

4. Set up the database:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL from `supabase/schema.sql` to create tables and RLS policies

5. Seed the database (optional):
   - Create users via Supabase Auth dashboard
   - Update the seed script with actual user IDs
   - Run the seed script or manually insert data

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main tables:

- **tenants** - Organizations/companies
- **users** - User accounts (extends Supabase auth.users)
- **projects** - Projects belonging to tenants
- **activity_logs** - Activity tracking

Row-level security (RLS) policies ensure that:
- Users can only see data from their own tenant
- Admins can see all tenants and data
- Managers can manage users in their tenant

## User Roles

- **Admin**: Can see and manage all tenants, users, and data
- **Manager**: Can manage users and projects in their tenant
- **User**: Can view and manage projects in their tenant

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

The app will automatically build and deploy.

## Demo Account

To set up a demo account:

1. Create a user in Supabase Auth with email `demo@acme.com` and password `demo123456`
2. Create a corresponding entry in the `users` table with:
   - `id`: matching the auth user ID
   - `email`: `demo@acme.com`
   - `role`: `admin` or `manager`
   - `tenant_id`: one of your tenant IDs

## License

MIT
