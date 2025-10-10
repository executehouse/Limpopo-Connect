# Local Supabase Notes

- Start: `supabase start`
- Reset DB to migrations & seeds: `supabase db reset`
- Status: `supabase status -o json`
- Studio: http://127.0.0.1:54323
- API: http://127.0.0.1:54321

Edge Functions:
- Run locally: `supabase functions serve --env-file .env.local --no-verify-jwt`
- Deploy: `supabase functions deploy post-message` and `summary-worker` (requires link)

Migrations:
- Create new: add file in `supabase/migrations/` and run `supabase db reset` locally
- Push to remote: `supabase link` then `supabase db push`
