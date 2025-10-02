# Azure PostgreSQL Connection Troubleshooting Checklist

Use this checklist to diagnose and fix connection issues.

## ✓ Pre-Connection Checklist

Before attempting to connect, verify:

- [ ] Azure PostgreSQL Flexible Server is created and running
- [ ] Server name is correct and accessible
- [ ] Admin username and password are known
- [ ] Database exists (default: `limpopoconnect`)
- [ ] Node.js and npm are installed
- [ ] Dependencies are installed (`npm install`)

## ✓ Environment Setup Checklist

- [ ] `.env` file exists in `limpopo-api/` directory
- [ ] `DATABASE_URL` is set in `.env` file
- [ ] Connection string format is correct
- [ ] No extra spaces or line breaks in connection string
- [ ] Special characters in password are URL-encoded
- [ ] Connection string includes `?sslmode=require`

### Check Environment

Run this to verify:
```bash
cd limpopo-api
cat .env | grep DATABASE_URL
```

Should show something like:
```
DATABASE_URL=postgresql://username:password@server.postgres.database.azure.com:5432/limpopoconnect?sslmode=require
```

## ✓ Network Connectivity Checklist

### Firewall Rules

- [ ] Your IP address is whitelisted in Azure firewall rules
- [ ] "Allow Azure services" is enabled (for Azure Functions)
- [ ] No corporate firewall blocking port 5432
- [ ] No VPN or proxy interfering with connection

### Test Basic Connectivity

```bash
# Check if server is reachable
nslookup yourserver.postgres.database.azure.com

# Test if port 5432 is accessible (Linux/Mac)
nc -zv yourserver.postgres.database.azure.com 5432

# Test if port 5432 is accessible (Windows)
Test-NetConnection -ComputerName yourserver.postgres.database.azure.com -Port 5432
```

## ✓ Authentication Checklist

- [ ] Using correct username (WITHOUT `@servername` for Flexible Server)
- [ ] Password is correct (case-sensitive)
- [ ] Password special characters are URL-encoded
- [ ] Not using expired or revoked credentials

### Password URL Encoding Table

| Character | Encoded |
|-----------|---------|
| `@` | `%40` |
| `#` | `%23` |
| `$` | `%24` |
| `&` | `%26` |
| `+` | `%2B` |
| `/` | `%2F` |
| `:` | `%3A` |
| `=` | `%3D` |
| `?` | `%3F` |

### Test Authentication

```bash
# Try connection test
npm run test:connection
```

## ✓ SSL/TLS Checklist

- [ ] Connection string includes `?sslmode=require`
- [ ] Not trying to disable SSL (required for Azure)
- [ ] `db.js` has `rejectUnauthorized: false` (already configured)
- [ ] Not using very old SSL/TLS client

## ✓ Database Existence Checklist

- [ ] Database `limpopoconnect` exists
- [ ] Database name in connection string matches actual database name
- [ ] User has access to the database

### Create Database if Missing

Using Azure Portal:
1. Go to your PostgreSQL server
2. Select "Databases" under Settings
3. Click "+ Add"
4. Enter database name: `limpopoconnect`

Using psql:
```bash
psql "postgresql://username:password@server.postgres.database.azure.com:5432/postgres?sslmode=require" -c "CREATE DATABASE limpopoconnect;"
```

## ✓ Common Error Messages

### Error: "Connection timeout"

**Possible causes:**
- Firewall blocking connection
- Server is down
- Incorrect hostname
- Network issues

**Solutions:**
1. Check Azure firewall rules
2. Verify server status in Azure Portal
3. Test network connectivity
4. Check if your ISP blocks port 5432

### Error: "password authentication failed"

**Possible causes:**
- Wrong password
- Wrong username format
- Password not URL-encoded

**Solutions:**
1. Verify credentials in Azure Portal
2. Use username WITHOUT `@servername` for Flexible Server
3. URL-encode special characters in password
4. Reset password if needed

### Error: "database does not exist"

**Possible causes:**
- Database not created yet
- Wrong database name in connection string
- Typo in database name

**Solutions:**
1. Create database in Azure Portal
2. Verify database name matches connection string
3. Check spelling (case-sensitive)

### Error: "SSL connection required"

**Possible causes:**
- Missing `?sslmode=require` in connection string
- Trying to disable SSL

**Solutions:**
1. Add `?sslmode=require` to connection string
2. Ensure SSL is enabled in db.js (already configured)

### Error: "no pg_hba.conf entry"

**Possible causes:**
- IP not whitelisted
- Firewall rules not configured
- Authentication method mismatch

**Solutions:**
1. Add your IP to firewall rules
2. Enable "Allow Azure services"
3. Wait 2-3 minutes for firewall rules to propagate

### Error: "too many connections"

**Possible causes:**
- Connection pool exhausted
- Many concurrent requests
- Connections not being released

**Solutions:**
1. Check active connections in Azure Portal
2. Review connection pool settings in db.js
3. Ensure queries are properly closed
4. Consider increasing max connections

## ✓ Testing Steps

### Step 1: Test Connection Script

```bash
cd limpopo-api
npm run test:connection
```

Expected output:
```
✅ Connection successful!
✅ Write permissions OK
```

### Step 2: Test with psql (if available)

```bash
psql $DATABASE_URL -c "SELECT version();"
```

Should show PostgreSQL version.

### Step 3: Test Azure Function

```bash
cd ..
func start
```

Navigate to: http://localhost:7071/api/GetListings

Should return:
```json
{
  "success": true,
  "rows": [{"ok": 1}]
}
```

## ✓ Azure Portal Checks

### Server Status
1. Go to Azure Portal
2. Navigate to your PostgreSQL server
3. Check "Overview" for server status
4. Should show "Available"

### Connection Activity
1. Go to "Metrics" under Monitoring
2. Select "Active Connections"
3. Check for connection activity

### Server Logs
1. Go to "Logs" under Monitoring
2. Enable diagnostic logs if needed
3. Check for connection errors

## ✓ Connection String Validation

Valid format:
```
postgresql://username:password@servername.postgres.database.azure.com:5432/database?sslmode=require
```

Checklist:
- [ ] Starts with `postgresql://`
- [ ] Contains username
- [ ] Contains `:` after username
- [ ] Contains password (URL-encoded)
- [ ] Contains `@` before hostname
- [ ] Hostname ends with `.postgres.database.azure.com`
- [ ] Contains `:5432` for port
- [ ] Contains `/` before database name
- [ ] Contains database name
- [ ] Ends with `?sslmode=require`

## ✓ Performance Checklist

If connected but slow:

- [ ] Check server tier (upgrade if needed)
- [ ] Review query performance in Azure Portal
- [ ] Check network latency
- [ ] Optimize slow queries
- [ ] Review connection pool settings
- [ ] Monitor server resources (CPU, memory)

## ✓ Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] Not committing credentials to git
- [ ] Using strong passwords
- [ ] Firewall rules are restrictive (not 0.0.0.0-255.255.255.255 in production)
- [ ] SSL/TLS is enforced
- [ ] Regular password rotation planned
- [ ] Monitoring enabled
- [ ] Backups configured

## Still Having Issues?

### Collect Information

1. **Server Information**
   ```bash
   echo "Server: $(grep DATABASE_URL limpopo-api/.env | cut -d'@' -f2 | cut -d':' -f1)"
   ```

2. **Error Messages**
   - Copy full error message from `npm run test:connection`
   - Check Azure Function logs

3. **Network Test**
   ```bash
   nslookup yourserver.postgres.database.azure.com
   ```

4. **Azure Portal**
   - Screenshot of firewall rules
   - Screenshot of server status

### Get Help

1. Review [AZURE_SETUP_GUIDE.md](./AZURE_SETUP_GUIDE.md)
2. Check [Azure PostgreSQL documentation](https://docs.microsoft.com/azure/postgresql/)
3. Contact Azure support with collected information
4. Check Azure Service Health for outages

## Success Criteria

✅ Connection test passes
✅ Can query database
✅ Azure Function returns data
✅ No errors in logs
✅ Performance is acceptable

## Quick Fix Commands

```bash
# Reinstall dependencies
cd limpopo-api && npm install

# Recreate .env file
npm run setup:env

# Test connection
npm run test:connection

# View current .env (without password)
cat .env | sed 's/:[^@]*@/:***@/'

# Test with psql
psql $DATABASE_URL -c "SELECT 1;"

# Check Azure Functions version
func --version

# Start Azure Functions
func start
```

## Maintenance Schedule

Regular checks (weekly):
- [ ] Review connection logs
- [ ] Check server metrics
- [ ] Verify backups
- [ ] Monitor storage usage

Monthly checks:
- [ ] Review firewall rules
- [ ] Update dependencies
- [ ] Test disaster recovery
- [ ] Review security settings
