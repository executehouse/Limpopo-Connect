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

A simple way to test the database connection is to start one of the backend services. These services rely on the database connection to operate.

### 1. Start a Backend Service
From the project root directory, run one of the following commands:

To test the authentication service:
```bash
npm run dev:api:auth
```

Or, to test the business listings service:
```bash
npm run dev:api:businesses
```

### 2. Check for Errors
If the service starts successfully (e.g., you see `Auth service running on port 3001`), it means the application was able to load its modules, including the database module (`db.js`).

However, a true connection test happens when an API endpoint is called. If there is a problem with your `DATABASE_URL` (wrong password, host, or firewall issue), the application will log an error when you try to perform a database operation.

For example, after starting the `businesses` service, you can try to fetch listings:
```bash
# In a new terminal
curl http://localhost:3002/api/businesses
```

**Expected Output (if successful):**
An empty JSON array `[]` or an array of business listings.

**If it fails:**
You will likely see an error in the terminal where the service is running. Common errors include:
- `error: password authentication failed for user...`
- `error: getaddrinfo ENOTFOUND ...` (incorrect hostname)
- `Error: connect ETIMEDOUT ...` (firewall issue or server not running)

### 3. Connection Test Checklist
- [ ] Backend service starts without crashing.
- [ ] API calls to endpoints that use the database do not return connection errors.
- [ ] Check the service logs for any database-related error messages.

## ✅ Database Schema Setup

### 1. Initialize Database Schema
```bash
cd limpopo-api
psql $DATABASE_URL -f setup-database.sql
```

**Note:** If `psql` is not installed, you can use Azure Data Studio or pgAdmin to run the SQL file.

### 2. Verify Schema Creation
To verify that the tables were created, you can connect to the database with `psql` and list the tables.

```bash
psql $DATABASE_URL -c "\dt"
```

**Expected Output:**
You should see a list of the tables that were created by the script, for example:
```
                 List of relations
 Schema |         Name          | Type  |  Owner
--------+-----------------------+-------+----------
 public | events                | table | myuser
 public | listings              | table | myuser
 public | marketplace_items     | table | myuser
 public | tourism_attractions   | table | myuser
 public | users                 | table | myuser
(5 rows)
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
