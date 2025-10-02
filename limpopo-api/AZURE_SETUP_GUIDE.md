# Azure PostgreSQL Flexible Server Setup Guide

This guide will help you connect your Limpopo Connect application to Azure PostgreSQL Flexible Server.

## Prerequisites

- Azure account with active subscription
- Node.js 18.x or later installed
- Basic familiarity with Azure Portal

## Step 1: Create Azure PostgreSQL Flexible Server

### Using Azure Portal

1. **Login to Azure Portal**
   - Go to https://portal.azure.com
   - Sign in with your Azure credentials

2. **Create PostgreSQL Flexible Server**
   - Click "Create a resource"
   - Search for "Azure Database for PostgreSQL"
   - Select "Azure Database for PostgreSQL Flexible Server"
   - Click "Create"

3. **Configure Server Basics**
   - **Subscription**: Select your subscription
   - **Resource Group**: Create new or use existing
   - **Server name**: Choose a unique name (e.g., `limpopoconnect-db`)
   - **Region**: Select closest to your users (e.g., South Africa North)
   - **PostgreSQL version**: 14 or later recommended
   - **Workload type**: Development (for testing) or Production
   - **Compute + Storage**: Select tier based on needs (B1ms for development)
   - **Admin username**: Create username (e.g., `limpopoconnect_admin`)
   - **Password**: Create strong password (save it securely!)

4. **Configure Network**
   - **Connectivity method**: Public access
   - **Firewall rules**: Click "Add current client IP address"
   - **Allow public access from Azure services**: Enable

5. **Review and Create**
   - Review settings
   - Click "Create"
   - Wait for deployment (usually 5-10 minutes)

### Using Azure CLI (Alternative)

```bash
# Login to Azure
az login

# Create resource group
az group create --name limpopoconnect-rg --location southafricanorth

# Create PostgreSQL Flexible Server
az postgres flexible-server create \
  --name limpopoconnect-db \
  --resource-group limpopoconnect-rg \
  --location southafricanorth \
  --admin-user limpopoconnect_admin \
  --admin-password 'YourStrongPassword123!' \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --public-access 0.0.0.0 \
  --storage-size 32 \
  --version 14

# Create database
az postgres flexible-server db create \
  --resource-group limpopoconnect-rg \
  --server-name limpopoconnect-db \
  --database-name limpopoconnect
```

## Step 2: Configure Firewall Rules

### Azure Portal Method

1. Navigate to your PostgreSQL server in Azure Portal
2. Go to "Networking" under Settings
3. Under "Firewall rules":
   - Add your current IP address
   - Add "Allow Azure services" rule (0.0.0.0-0.0.0.0)
   - For development, you can add 0.0.0.0-255.255.255.255 (not recommended for production)
4. Click "Save"

### Azure CLI Method

```bash
# Add your current IP
az postgres flexible-server firewall-rule create \
  --resource-group limpopoconnect-rg \
  --name limpopoconnect-db \
  --rule-name AllowMyIP \
  --start-ip-address YOUR_IP_ADDRESS \
  --end-ip-address YOUR_IP_ADDRESS

# Allow Azure services
az postgres flexible-server firewall-rule create \
  --resource-group limpopoconnect-rg \
  --name limpopoconnect-db \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

## Step 3: Get Connection String

### From Azure Portal

1. Navigate to your PostgreSQL server
2. Go to "Connect" or "Connection strings"
3. Copy the connection string
4. Convert to PostgreSQL format:

```
Format:
postgresql://{username}:{password}@{server-name}.postgres.database.azure.com:5432/{database}?sslmode=require

Example:
postgresql://limpopoconnect_admin:MyP@ssw0rd123@limpopoconnect-db.postgres.database.azure.com:5432/limpopoconnect?sslmode=require
```

**Important Notes:**
- For Flexible Server, use username WITHOUT `@servername` suffix
- Special characters in password must be URL-encoded:
  - `@` becomes `%40`
  - `#` becomes `%23`
  - `$` becomes `%24`
  - `&` becomes `%26`
  - `+` becomes `%2B`

### Using Azure CLI

```bash
# Get connection string
az postgres flexible-server show-connection-string \
  --server-name limpopoconnect-db \
  --database-name limpopoconnect \
  --admin-user limpopoconnect_admin \
  --admin-password 'YourStrongPassword123!'
```

## Step 4: Configure Local Environment

1. **Navigate to API directory**
   ```bash
   cd limpopo-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   npm run setup:env
   ```
   
   Or manually:
   ```bash
   cp .env.example .env
   ```

4. **Edit .env file**
   ```bash
   nano .env  # or use your preferred editor
   ```
   
   Replace with your actual connection string:
   ```
   DATABASE_URL=postgresql://username:password@servername.postgres.database.azure.com:5432/limpopoconnect?sslmode=require
   ```

## Step 5: Test Connection

Run the connection test script:

```bash
npm run test:connection
```

You should see:
```
✅ Connection successful!
✅ Write permissions OK
```

If you see errors, refer to the Troubleshooting section below.

## Step 6: Initialize Database Schema

### Using psql (Recommended)

If you have PostgreSQL client tools installed:

```bash
psql $DATABASE_URL -f setup-database.sql
```

### Using Azure Portal Query Editor

1. Navigate to your PostgreSQL server in Azure Portal
2. Go to "Query editor" (if available)
3. Login with your admin credentials
4. Copy and paste contents of `setup-database.sql`
5. Execute the script

### Manual Table Creation

If you prefer, you can connect using any PostgreSQL client:
- pgAdmin
- DBeaver
- DataGrip
- VS Code with PostgreSQL extension

## Step 7: Verify Setup

1. **Run connection test again**
   ```bash
   npm run test:connection
   ```
   
   Should now show tables:
   ```
   ✅ Found 5 table(s):
      - events
      - listings
      - marketplace_items
      - tourism_attractions
      - users
   ```

2. **Test Azure Function locally**
   ```bash
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

## Troubleshooting

### Connection Timeout Errors

**Symptoms:**
- `ETIMEDOUT` error
- `Connection timeout`

**Solutions:**
1. Check firewall rules in Azure Portal
2. Verify your IP address is whitelisted
3. Ensure "Allow Azure services" is enabled
4. Check if your network/ISP blocks port 5432

### SSL/TLS Errors

**Symptoms:**
- SSL connection errors
- Certificate verification errors

**Solutions:**
1. Ensure connection string includes `?sslmode=require`
2. Verify `rejectUnauthorized: false` in db.js (already configured)
3. Azure Flexible Server requires SSL - cannot disable

### Authentication Errors

**Symptoms:**
- `password authentication failed`
- `role does not exist`

**Solutions:**
1. For Flexible Server, use username WITHOUT `@servername`
2. Verify password is correct (case-sensitive)
3. Check if password needs URL encoding
4. Ensure admin user was created correctly

### Database Does Not Exist

**Symptoms:**
- `database "limpopoconnect" does not exist`

**Solutions:**
1. Create database using Azure Portal or CLI
2. Ensure database name in connection string matches created database
3. Check spelling and case sensitivity

### Permission Errors

**Symptoms:**
- `permission denied for table`
- Cannot create tables

**Solutions:**
1. Ensure you're using admin account for initial setup
2. Grant proper permissions if using non-admin account
3. Check Azure RBAC roles

## Production Deployment

### Environment Variables

For Azure Functions deployment:

1. Navigate to your Function App in Azure Portal
2. Go to "Configuration" under Settings
3. Add Application Setting:
   - **Name**: `DATABASE_URL`
   - **Value**: Your connection string
4. Click "Save"

### Using Azure CLI

```bash
az functionapp config appsettings set \
  --name your-function-app-name \
  --resource-group your-resource-group \
  --settings DATABASE_URL="your-connection-string"
```

### Security Best Practices

1. **Never commit .env file to git** (already in .gitignore)
2. **Use Azure Key Vault** for production secrets
3. **Enable SSL enforcement** (default in Flexible Server)
4. **Use managed identities** when possible
5. **Regularly rotate passwords**
6. **Restrict firewall rules** to specific IPs
7. **Enable audit logging** for production
8. **Regular backups** (automated in Azure)

## Monitoring and Maintenance

### Azure Portal Monitoring

1. Navigate to your PostgreSQL server
2. Check "Metrics" for:
   - CPU usage
   - Memory usage
   - Active connections
   - Storage usage

### Enable Query Performance Insights

1. Go to "Intelligent Performance"
2. Enable "Query Performance Insight"
3. Review slow queries and optimize

### Automated Backups

- Azure automatically backs up your database
- Configure retention period (7-35 days)
- Test restore procedure periodically

## Cost Optimization

### Development/Testing
- Use Burstable tier (B1ms)
- Stop server when not in use
- Use smaller storage size (32GB minimum)

### Production
- Use General Purpose tier for stable workloads
- Enable auto-scaling if needed
- Monitor and optimize expensive queries
- Use connection pooling (already configured)

## Additional Resources

- [Azure PostgreSQL Documentation](https://docs.microsoft.com/azure/postgresql/)
- [PostgreSQL Official Docs](https://www.postgresql.org/docs/)
- [Azure Functions Node.js Guide](https://docs.microsoft.com/azure/azure-functions/functions-reference-node)
- [pg (node-postgres) Documentation](https://node-postgres.com/)

## Support

If you encounter issues not covered in this guide:

1. Check Azure Service Health
2. Review PostgreSQL logs in Azure Portal
3. Enable detailed error logging in your application
4. Consult Azure support if needed

## Next Steps

Once connected:
1. Customize database schema for your needs
2. Implement authentication and authorization
3. Add data validation
4. Create additional Azure Functions for CRUD operations
5. Set up monitoring and alerts
6. Plan backup and disaster recovery strategy
