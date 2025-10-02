# Limpopo Connect API

Azure Functions API for the Limpopo Connect platform with PostgreSQL database integration.

## 📚 Documentation

- **[INDEX.md](./INDEX.md)** - 📖 **START HERE** - Complete overview and guide
- **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 5 minutes
- **[AZURE_SETUP_GUIDE.md](./AZURE_SETUP_GUIDE.md)** - Comprehensive setup guide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and diagrams
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Problem-solving checklist

## Database Setup

This API is configured to work with **Azure PostgreSQL Flexible Server**.

### Azure PostgreSQL Flexible Server Setup

📖 **For detailed step-by-step instructions, see [AZURE_SETUP_GUIDE.md](./AZURE_SETUP_GUIDE.md)**

**Quick Setup:**

1. **Create Azure PostgreSQL Flexible Server**
   - Go to Azure Portal
   - Create a new PostgreSQL Flexible Server
   - Choose your server name, admin username, and password
   - Select appropriate tier based on your needs

2. **Configure Firewall Rules**
   - Add your IP address to the firewall rules
   - For Azure Functions, enable "Allow Azure services and resources to access this server"

3. **Get Connection String**
   - Navigate to your PostgreSQL server in Azure Portal
   - Go to "Connection strings"
   - Copy the ADO.NET or JDBC connection string and convert to PostgreSQL format:
   
   ```
   postgresql://{username}:{password}@{server-name}.postgres.database.azure.com:5432/{database}?sslmode=require
   ```

4. **Set Environment Variable**
   - Copy `.env.example` to `.env` or run `npm run setup:env`
   - Replace the placeholders with your actual values:
   
   ```bash
   DATABASE_URL=postgresql://adminuser:MyP@ssw0rd@myserver.postgres.database.azure.com:5432/limpopoconnect?sslmode=require
   ```

5. **Test Connection**
   ```bash
   npm install
   npm run test:connection
   ```

6. **Initialize Database Schema**
   ```bash
   psql $DATABASE_URL -f setup-database.sql
   ```

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

5. Run Azure Functions locally:
   ```bash
   cd ..
   func start
   ```

The `GetListings` function will be available at: http://localhost:7071/api/GetListings

### SSL Configuration

The database connection is configured to work with Azure PostgreSQL Flexible Server:
- SSL is enabled when `DATABASE_URL` is provided
- `rejectUnauthorized` is set to `false` to support Azure's SSL certificates
- This is the recommended configuration for Azure PostgreSQL Flexible Server

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

- **Azure PostgreSQL Documentation**: https://docs.microsoft.com/azure/postgresql/
- **node-postgres (pg) Documentation**: https://node-postgres.com/
- **Azure Functions Node.js Guide**: https://docs.microsoft.com/azure/azure-functions/functions-reference-node

## Need Help?

1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
2. Review [AZURE_SETUP_GUIDE.md](./AZURE_SETUP_GUIDE.md) for detailed instructions
3. Run `npm run test:connection` to diagnose connection problems
4. Check Azure Service Health for service issues

## Contributing

When adding new database functionality:
1. Update the schema in `setup-database.sql`
2. Create/update Azure Functions in their respective directories
3. Test with `npm run test:connection`
4. Update documentation as needed

