# Limpopo Connect API

Supabase-integrated API for the Limpopo Connect platform (migrated from Azure Functions; database migrated to Supabase Postgres).

## 📚 Documentation

- **[INDEX.md](./INDEX.md)** - 📖 **START HERE** - Complete overview and guide
- **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 5 minutes
- **[SUPABASE_SETUP.md](../SUPABASE_SETUP.md)** - Supabase setup guide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and diagrams
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Problem-solving checklist

## Database Setup

This API is now configured to work with a **Supabase Postgres** database.

### Supabase Setup (Summary)

For detailed instructions see `SUPABASE_SETUP.md`.

1. Create a Supabase project and obtain `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
2. Copy `limpopo-api/.env.example` to `.env` and set values.
3. Apply migrations in `migrations/` using the Supabase SQL editor.
4. (Optional) Load sample data from `seeds/sample_data.sql`.
5. Start services: `npm run dev --prefix limpopo-api`.

### Local Development

For local development:

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:

   ```bash
   npm run setup:env
   # Edit .env with your database connection details (e.g., Supabase connection or local Postgres)
   ```

3. Initialize database:

   - Apply migrations using the Supabase SQL editor or using psql against your database URL (SQL files are in `migrations/`).

4. Test the connection:
   ```bash
   npm run test:connection
   ```

5. Run backend services locally:

   ```bash
   npm run dev --prefix limpopo-api
   ```

   Auth service: [http://localhost:3001](http://localhost:3001)  Businesses service: [http://localhost:3002](http://localhost:3002)

### Database Notes

Supabase provides a managed Postgres instance with optional Row Level Security (RLS). This codebase currently:
- Uses `@supabase/supabase-js` for CRUD operations
- Leverages a service-role key for privileged inserts (user + listing creation)
- Retains custom JWT auth (can be migrated to Supabase Auth later)

### Troubleshooting

**Connection timeout errors:**
- Ensure your database host and network allow connections from the deployment environment (check firewall rules or allowed IPs)

**SSL/TLS errors:**
- Ensure connection string includes the required SSL parameters for your database provider (e.g., `?sslmode=require`)

**Authentication errors:**
- Verify username and password format for your database provider and check that the password is URL-encoded if it contains special characters.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run test:connection` | Test database connectivity and display server info |
| `npm run setup:env` | Create .env file from .env.example |

## Database Schema

The database schema is defined in `setup-database.sql`. It includes tables for:
- **listings**: Business directory entries
- **events**: Community events and activities  
- **marketplace_items**: Items for sale in the marketplace
- **tourism_attractions**: Tourism locations and attractions
- **users**: User accounts

## Functions

### GetListings
Simple health check function that tests database connectivity.

**Endpoint:** `/api/GetListings`

**Response:**
```json
{
  "success": true,
  "rows": [{"ok": 1}]
}
```

## Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **supabase-js Reference**: https://supabase.com/docs/reference/javascript

## Need Help?

1. Check the backend README and `SUPABASE_SETUP.md` (if using Supabase) for common issues
2. Review `SUPABASE_SETUP.md` for environment setup
3. Ensure Supabase env vars are loaded
4. Verify RLS policies if encountering permission errors

## Contributing

When adding new database functionality:
## Supabase Auth Endpoints (Preview)

These endpoints are available in addition to legacy custom JWT auth:

```
POST /api/auth/supabase/register  # email/password signup
POST /api/auth/supabase/login     # returns Supabase session (access & refresh tokens)
GET  /api/auth/supabase/me        # requires Bearer access token
```

If `SUPABASE_URL` / `SUPABASE_ANON_KEY` are not configured the endpoints return 501.

Planned deprecation: once the frontend migrates fully, the legacy `/api/auth/register` and `/api/auth/login` routes can be removed.
1. Update/create migrations in `migrations/`
2. Add or update Supabase queries in models/services
3. Add/update tests (re-enable previously skipped Azure tests with new Supabase logic)
4. Update documentation as needed

