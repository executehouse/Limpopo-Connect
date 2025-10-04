# Fixes Summary

This document summarizes the changes made to fix the Azure database name and workflow issues.

## Issues Fixed

### 1. Azure Database Name Configuration
**Problem:** The Azure PostgreSQL database was configured to use the default database name "postgres" instead of "limpopoconnect-db" as specified by the user.

**Solution:**
- Updated `infra/db.bicep` to create a dedicated "limpopoconnect" database with proper charset and collation settings
- Changed the connection string output to reference the "limpopoconnect" database instead of "postgres"
- Updated `infra/main.bicep` to use a fixed PostgreSQL server name "limpopoconnect-db" instead of generating a dynamic name

### 2. Workflow Authentication Failure
**Problem:** The `deploy.yml` workflow was failing with error: "Content is not a valid JSON object" because it was trying to use `AZURE_WEBAPP_PUBLISH_PROFILE` secret which was not properly configured.

**Solution:**
- Changed the Azure login step in `.github/workflows/deploy.yml` to use `AZURE_CREDENTIALS` secret instead
- This expects a service principal credential in proper JSON format

### 3. Database Connection Configuration
**Problem:** The workflow was using incorrect database connection parameters:
- Database name was "postgres" instead of "limpopoconnect"  
- Username format included `@limpopoconnect-db` suffix which is not needed for Flexible Server

**Solution:**
- Updated `DB_NAME` from "postgres" to "limpopoconnect" in the deploy workflow
- Changed `DB_USER` from "limpopoconnect_admin@limpopoconnect-db" to "limpopoconnect_admin" (Flexible Server doesn't need the @server suffix)

### 4. Invalid Workflow File
**Problem:** The file `.github/workflows/main.yml` contained shell commands instead of a proper GitHub Actions workflow YAML, causing workflow failures.

**Solution:**
- Removed the invalid `main.yml` file as it was not a valid GitHub Actions workflow

## Files Changed

1. `.github/workflows/deploy.yml` - Fixed authentication and database configuration
2. `infra/db.bicep` - Added limpopoconnect database creation and updated connection string
3. `infra/main.bicep` - Set PostgreSQL server name to "limpopoconnect-db"
4. `.github/workflows/main.yml` - Removed (was invalid)

## Required Secret Configuration

For the workflows to succeed, the following GitHub secret needs to be configured:

**AZURE_CREDENTIALS** - A service principal credential in JSON format:
```json
{
  "clientId": "<your-client-id>",
  "clientSecret": "<your-client-secret>",
  "subscriptionId": "<your-subscription-id>",
  "tenantId": "<your-tenant-id>"
}
```

You can create this with:
```bash
az ad sp create-for-rbac --name "github-actions-limpopo-connect" \
  --role contributor \
  --scopes /subscriptions/<subscription-id>/resourceGroups/limpopoconnect-rg \
  --sdk-auth
```

## Database Configuration

The infrastructure now creates:
- **Server Name:** limpopoconnect-db
- **Database Name:** limpopoconnect
- **Connection String Format:** `postgresql://username:password@limpopoconnect-db.postgres.database.azure.com:5432/limpopoconnect?sslmode=require`

## Next Steps

1. Ensure the `AZURE_CREDENTIALS` secret is properly configured in GitHub repository settings
2. If deploying infrastructure with Bicep, deploy or update the resources:
   ```bash
   az deployment group create \
     --resource-group limpopoconnect-rg \
     --template-file infra/main.bicep \
     --parameters postgresAdmin=limpopoconnect_admin \
     --parameters postgresAdminPassword='<secure-password>' \
     --parameters postgresServerName=limpopoconnect-db
   ```
3. Update the Key Vault secret `azure-postgres-admin-password` with the correct admin password
4. Test the workflow by pushing to main branch
