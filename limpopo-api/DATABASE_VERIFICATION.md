# Database Verification Checklist

This document provides a step-by-step checklist to verify your Azure PostgreSQL database setup for Limpopo Connect.

## ✅ Pre-Setup Verification

### 1. Azure PostgreSQL Server Created
- [ ] Azure PostgreSQL Flexible Server is created in Azure Portal
- [ ] Server is running and accessible
- [ ] Firewall rules are configured to allow your IP address
- [ ] Database `limpopoconnect` is created

### 2. Connection Details Available
- [ ] Server hostname (e.g., `myserver.postgres.database.azure.com`)
- [ ] Admin username (for Flexible Server, use username without `@servername`)
- [ ] Admin password
- [ ] Database name (default: `limpopoconnect`)
- [ ] SSL mode is set to `require`

## ✅ Local Setup Verification

### 1. Environment Configuration
```bash
cd limpopo-api

# Check if dependencies are installed
[ -d "node_modules" ] && echo "✅ Dependencies installed" || echo "❌ Run: npm install"

# Check if .env exists
[ -f ".env" ] && echo "✅ .env file exists" || echo "❌ Run: npm run setup:env"

# Verify DATABASE_URL is set (without exposing password)
grep -q "DATABASE_URL=" .env && echo "✅ DATABASE_URL configured" || echo "❌ Edit .env file"
```

### 2. Connection String Format
Your `.env` file should contain:
```
DATABASE_URL=postgresql://USERNAME:PASSWORD@SERVER.postgres.database.azure.com:5432/limpopoconnect?sslmode=require
```

**Important:**
- Replace `USERNAME`, `PASSWORD`, and `SERVER` with your actual values
- URL-encode special characters in password (e.g., `@` → `%40`, `#` → `%23`)
- Include `?sslmode=require` at the end

## ✅ Database Connection Test

### 1. Run Connection Test
```bash
cd limpopo-api
npm run test:connection
```

**Expected Output:**
```
=== Azure PostgreSQL Flexible Server Connection Test ===

Connection Details:
  Host: your-server.postgres.database.azure.com
  Port: 5432
  Database: limpopoconnect
  Username: your-username
  SSL Mode: require

⏳ Testing connection...
✅ Connection successful! (XXms)

Server Information:
  Time: YYYY-MM-DD HH:MM:SS
  Version: PostgreSQL X.X

⏳ Checking database schema...
⚠️  No tables found in database.
   Run setup-database.sql to create the schema:

   psql $DATABASE_URL -f setup-database.sql

=== All tests passed! Database is ready to use. ===
```

### 2. Connection Test Checklist
- [ ] Connection successful (no timeout or auth errors)
- [ ] Server information displayed correctly
- [ ] Write permissions confirmed

## ✅ Database Schema Setup

### 1. Initialize Database Schema
```bash
cd limpopo-api
psql $DATABASE_URL -f setup-database.sql
```

**Note:** If `psql` is not installed, you can use Azure Data Studio or pgAdmin to run the SQL file.

### 2. Verify Schema Creation
Run the connection test again:
```bash
npm run test:connection
```

**Expected Output:**
```
✅ Found 5 table(s):
   - events
   - listings
   - marketplace_items
   - tourism_attractions
   - users
```

### 3. Schema Verification Checklist
- [ ] `users` table exists
- [ ] `listings` table exists (with foreign key to users)
- [ ] `events` table exists
- [ ] `marketplace_items` table exists
- [ ] `tourism_attractions` table exists
- [ ] All indexes are created
- [ ] No errors during schema creation

## ✅ API Endpoints Verification

### 1. Test Azure Functions Locally
```bash
cd ..  # Back to project root
func start
```

### 2. Test GetListings Endpoint
Open browser or use curl:
```bash
curl http://localhost:7071/api/GetListings
```

**Expected Response:**
```json
{
  "success": true,
  "rows": [{"ok": 1}]
}
```

### 3. API Verification Checklist
- [ ] Azure Functions Core Tools installed
- [ ] `func start` runs without errors
- [ ] GetListings endpoint returns success response
- [ ] No database connection errors in logs

## ✅ Database Operations Test

### 1. Test Business Listings API
Start the businesses service (if not using Azure Functions):
```bash
cd limpopo-api
node businesses.js
```

Test endpoint:
```bash
curl http://localhost:3002/api/businesses
```

**Expected:** Empty array `[]` or existing businesses

### 2. Test Auth API
Start the auth service:
```bash
cd limpopo-api
node auth.js
```

### 3. Operations Verification Checklist
- [ ] Can fetch businesses (empty list is OK)
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Proper error handling for invalid data

## 🔧 Troubleshooting

### Connection Issues

**Timeout Errors:**
- Verify firewall rules in Azure Portal
- Check if your IP address is whitelisted
- Ensure "Allow Azure services" is enabled

**SSL Errors:**
- Confirm `?sslmode=require` is in connection string
- Check that SSL is enabled on Azure PostgreSQL server

**Authentication Failed:**
- For Flexible Server, use username WITHOUT `@servername`
- Verify password is URL-encoded
- Try resetting password in Azure Portal

### Schema Issues

**Foreign Key Constraint Errors:**
- Ensure you're using the latest `setup-database.sql` with correct table order
- The `users` table must be created before `listings` table

**Permission Errors:**
- Verify admin user has necessary permissions
- Check that grants are applied correctly

## 📊 Database Health Check

Run this query to verify all tables and row counts:
```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

## ✅ Final Verification

- [ ] Connection test passes
- [ ] All 5 tables exist
- [ ] Azure Functions start successfully
- [ ] API endpoints respond correctly
- [ ] No errors in logs
- [ ] .env file is in .gitignore (security check)

## 🎉 Success!

If all checks pass, your database setup is complete and verified!

## 📚 Additional Resources

- [QUICKSTART.md](./QUICKSTART.md) - Quick setup guide
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Detailed troubleshooting
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [README.md](./README.md) - API documentation
