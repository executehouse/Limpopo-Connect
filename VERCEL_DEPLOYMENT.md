# Production Environment Configuration for Vercel Deployment

## Required Environment Variables

Add these environment variables in your Vercel dashboard (Settings > Environment Variables):

### Supabase Configuration
- `VITE_SUPABASE_URL` - Your production Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your production Supabase anonymous key

## Example Production Values
```bash
# Replace with your actual production Supabase values
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Local vs Production
- Local development uses: `http://127.0.0.1:54321` (local Supabase)
- Production will use: `https://your-project.supabase.co` (hosted Supabase)

## Setup Instructions
1. Create a production Supabase project at https://app.supabase.com
2. Apply the same migrations from `supabase/migrations/`
3. Copy the project URL and anon key to Vercel environment variables
4. Deploy and test the production environment

Note: The chat demo will only work fully with a production Supabase instance configured.