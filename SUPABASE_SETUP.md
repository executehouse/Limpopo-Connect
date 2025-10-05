# Supabase Setup for Limpopo Connect

This project has been migrated from Azure (Functions, Key Vault, Blob Storage, Azure PostgreSQL) to Supabase.

## 1. Create Supabase Project
1. Go to https://supabase.com and create a new project.
2. Copy your Project URL and the anon/public API key from Project Settings > API.
3. Generate a Service Role key (shown in same API settings page) – keep this secret.

## 2. Environment Variables
Add the following to `limpopo-api/.env` (see `.env.example`):
```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=change-this-in-production-32-chars-min
NODE_ENV=development
```

The service role key is only used server-side for privileged inserts/updates bypassing RLS. Never expose it to the frontend.

## 3. Database Migration
If you previously ran the Azure PostgreSQL migrations, you can apply the same SQL to the Supabase database.

1. In the Supabase dashboard go to SQL Editor.
2. Run the SQL files in `limpopo-api/migrations` in order:
   - `002_extensions.sql`
   - `001_init_schema.sql`
   - `003_password_reset_tokens.sql`
3. (Optional) Load sample data:
   - Contents of `seeds/sample_data.sql`

## 4. Row Level Security (RLS)
If you enable RLS on tables (`users`, `listings`, etc.), ensure you either:
1. Define policies that allow the required operations for anon/public or authenticated roles; or
2. Use the service role client (already implemented) for server-side privileged operations.

The current code uses the service role for user creation and listings insertion.

## 5. Supabase Auth (New Optional Layer)

You can now use built-in Supabase Auth endpoints alongside the legacy custom JWT auth.

Endpoints:
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/supabase/register | Create a new Supabase user (email/password). Confirmation email if enabled. |
| POST | /api/auth/supabase/login | Authenticate and receive a Supabase session (access + refresh tokens). |
| GET  | /api/auth/supabase/me | Return current authenticated Supabase user (Bearer token required). |

Example login request:
```bash
curl -X POST http://localhost:3001/api/auth/supabase/login \
   -H 'Content-Type: application/json' \
   -d '{"email":"user@example.com","password":"StrongPass123!"}'
```

Protected example:
```bash
curl -H "Authorization: Bearer <access_token>" http://localhost:3001/api/auth/supabase/me
```

Migration strategy:
1. Gradually shift frontend to call Supabase Auth endpoints.
2. Map `supabaseUser.id` to existing domain records if needed.
3. Remove legacy custom auth once all consumers have migrated.

## 6. Storage (Future Work)
Azure Blob based upload logic has been disabled. To migrate:
1. Enable Supabase Storage and create a bucket (e.g., `public-uploads`).
2. Replace the disabled upload tests and implement new endpoints using `supabase.storage.from('public-uploads')` APIs.

## 7. Local Development
From repo root:
```
cp limpopo-api/.env.example limpopo-api/.env
# edit values
npm install --prefix limpopo-api
npm run dev --prefix limpopo-api
```
Starts Auth (3001) and Businesses (3002) services.

Frontend dev (from root):
```
npm install
npm run dev
```

## 8. Removed Azure Components
The following were removed:
- Azure Pipelines YAML files
- `infra/` Bicep templates
- Azure Functions TypeScript handlers (`src/functions/*`)
- Azure Key Vault & Blob Storage dependencies
- Azure specific tests (skipped for now)

## 9. Next Steps / Hardening
- Replace custom auth with Supabase Auth (optional) to leverage email/password, OTP, social providers.
- Implement RLS policies for finer security.
- Reintroduce upload + image processing with Supabase Storage + Edge Functions.
- Rebuild tests around the new architecture rather than skipping them.

## 10. Troubleshooting
| Issue | Cause | Fix |
|-------|-------|-----|
| Error: Supabase client not initialized | Missing env vars | Set SUPABASE_URL & SUPABASE_ANON_KEY |
| 401 / auth failing | Service role key missing for server inserts | Add SUPABASE_SERVICE_ROLE_KEY |
| RLS errors | Policies blocking inserts | Create policies or use service role |

---
Maintainers: Update documentation and tests as Supabase features (Auth, Storage) are adopted fully.
