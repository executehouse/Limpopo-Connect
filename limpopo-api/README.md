# Limpopo Connect API

Supabase-integrated API for the Limpopo Connect platform (migrated from Azure Functions + Azure PostgreSQL).

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
   # Edit .env with your Azure PostgreSQL connection details
   ```

3. Initialize database:
   ```bash
   psql $DATABASE_URL -f setup-database.sql
   ```

4. Test the connection:
   ```bash
   npm run test:connection
   ```

5. Run backend services locally:
   ```bash
   npm run dev --prefix limpopo-api
   ```
   Auth service: http://localhost:3001  Businesses service: http://localhost:3002

### Database Notes

Supabase provides a managed Postgres instance with optional Row Level Security (RLS). This codebase currently:
- Uses `@supabase/supabase-js` for CRUD operations
- Leverages a service-role key for privileged inserts (user + listing creation)
- Retains custom JWT auth (can be migrated to Supabase Auth later)

### Troubleshooting

**Connection timeout errors:**
- Check that your IP is whitelisted in Azure firewall rules
- Verify that "Allow Azure services" is enabled if deploying to Azure Functions

**SSL/TLS errors:**
- Ensure connection string includes `?sslmode=require`
- The API is configured to accept Azure's SSL certificates

**Authentication errors:**
- Verify username format: `username@servername` (not required for Flexible Server)
- For Flexible Server, use just the username without `@servername`
- Check that password is correctly URL-encoded in connection string

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

1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
2. Review `SUPABASE_SETUP.md` for environment setup
3. Ensure Supabase env vars are loaded
4. Verify RLS policies if encountering permission errors

## Contributing

When adding new database functionality:
1. Update/create migrations in `migrations/`
2. Add or update Supabase queries in models/services
3. Add/update tests (re-enable previously skipped Azure tests with new Supabase logic)
4. Update documentation as needed

