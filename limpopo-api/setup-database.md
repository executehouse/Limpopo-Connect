# Setting up the PostgreSQL Database

This document provides instructions for setting up the Azure Database for PostgreSQL Flexible Server and connecting to it for development and production.

## Azure PostgreSQL Flexible Server Setup

We use Azure Database for PostgreSQL Flexible Server for its scalability, reliability, and integration with other Azure services.

### 1. Provision the Server

You can provision the server using the provided Bicep/Terraform templates in the `infra/` directory, or manually via the Azure Portal.

**Key Configuration:**
- **SKU:** Start with `Standard_B1ms` (Burstable) for development/testing and scale as needed.
- **PostgreSQL Version:** 14 or higher.
- **High Availability:** Enable Zone-redundant HA for production workloads.
- **Authentication:** Use "PostgreSQL and Microsoft Entra ID authentication".
- **Networking:** Private access (VNet integration) is recommended for production. For development, you can use Public access and configure firewall rules.

### 2. Configure Firewall Rules

If using Public Access, you must configure the firewall to allow connections from your development machine or deployment service.

1. Navigate to your PostgreSQL Flexible Server resource in the Azure Portal.
2. Go to the **Networking** blade.
3. Under **Firewall rules**, click **"Add my current client IP address"** to allow connections from your machine.
4. If deploying via GitHub Actions or Azure Pipelines, you may need to add the IP address ranges for the runners. A more secure approach is to use a self-hosted runner within a VNet.
5. **Important:** Check the box for **"Allow public access from any Azure service within Azure to this server"**. This is required for the Azure Functions App to connect to the database if they are not in the same VNet.

### 3. Enable Extensions

The application requires the `postgis`, `pg_trgm`, and `pgcrypto` extensions.

1. Navigate to your PostgreSQL Flexible Server resource in the Azure Portal.
2. Go to the **Server parameters** blade.
3. Search for the `azure.extensions` parameter.
4. Click the parameter to edit its value.
5. Select `POSTGIS`, `PG_TRGM`, and `PGCRYPTO` from the list.
6. Click **Save**. The server will restart to apply the changes.

## Connecting with `psql`

You will need the `psql` command-line tool, which is part of a standard PostgreSQL installation.

### 1. Get Connection String

1. In the Azure Portal, navigate to your PostgreSQL server's **Overview** page.
2. The connection details (Host name, Username) are listed there.
3. The password is the one you set during server creation. It's recommended to store this in Azure Key Vault.

### 2. `psql` Command Examples

Replace the placeholders with your actual credentials.

**Connect to the server:**
```bash
psql "host=<YOUR_SERVER_NAME>.postgres.database.azure.com port=5432 dbname=postgres user=<YOUR_ADMIN_USER> password=<YOUR_PASSWORD> sslmode=require"
```

**Create the application database:**
Once connected, create the database for Limpopo Connect.
```sql
CREATE DATABASE limpopoconnect;
```

**Connect directly to the application database:**
```bash
psql "host=<YOUR_SERVER_NAME>.postgres.database.azure.com port=5432 dbname=limpopoconnect user=<YOUR_ADMIN_USER> password=<YOUR_PASSWORD> sslmode=require"
```

## Running Migrations

After connecting to the `limpopoconnect` database, you can run the SQL migration scripts.

**Run the extensions setup:**
```bash
# From the root of the limpopo-api directory
psql -d "YOUR_FULL_CONNECTION_STRING" -f migrations/002_extensions.sql
```

**Run the initial schema migration:**
```bash
# From the root of the limpopo-api directory
psql -d "YOUR_FULL_CONNECTION_STRING" -f migrations/001_init_schema.sql
```

**Seed the database with sample data:**
```bash
# From the root of the limpopo-api directory
psql -d "YOUR_FULL_CONNECTION_STRING" -f seeds/sample_data.sql
```