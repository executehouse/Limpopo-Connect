# Limpopo Connect API

Azure Functions API for the Limpopo Connect platform with PostgreSQL database integration.

## Database Setup

This API is configured to work with **Azure PostgreSQL Flexible Server**.

### Azure PostgreSQL Flexible Server Setup

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
   - Copy `.env.example` to `.env`
   - Replace the placeholders with your actual values:
   
   ```bash
   DATABASE_URL=postgresql://adminuser:MyP@ssw0rd@myserver.postgres.database.azure.com:5432/limpopoconnect?sslmode=require
   ```

### Local Development

For local development:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your Azure PostgreSQL connection details
   ```

3. Test the connection:
   - The `GetListings` function will test the connection with a simple query

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
