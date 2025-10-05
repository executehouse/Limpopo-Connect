# Fixes Summary

This document summarizes the changes made to remove Azure PostgreSQL-specific configuration and to generalize database and workflow handling.

## Issues Fixed

### 1. Azure Database Name Configuration

### 2. Workflow Authentication Failure
**Problem:** The `deploy.yml` workflow was failing with error: "Content is not a valid JSON object" because it was trying to use `AZURE_WEBAPP_PUBLISH_PROFILE` secret which was not properly configured.

**Solution:**
- Changed the Azure login step in `.github/workflows/deploy.yml` to use `AZURE_CREDENTIALS` secret instead
- This expects a service principal credential in proper JSON format

### 3. Database Connection Configuration
**Problem:** The workflow was using incorrect database connection parameters:

### 4. Invalid Workflow File
**Problem:** The file `.github/workflows/main.yml` contained shell commands instead of a proper GitHub Actions workflow YAML, causing workflow failures.

**Solution:**
- Removed the invalid `main.yml` file as it was not a valid GitHub Actions workflow

## Files Changed

1. `.github/workflows/deploy.yml` - Fixed authentication and database configuration
2. `infra/db.bicep` - Removed Azure PostgreSQL resource definitions from active configuration (deleted)
3. `infra/main.bicep` - Removed inline PostgreSQL deployment and parameters
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

The repository no longer creates or manages an Azure PostgreSQL server. Provision your database using your chosen provider (for example, Supabase) and store connection credentials securely with your secrets manager. A generic connection string format for Postgres is:

- **Connection String Format:** `postgresql://username:password@host:5432/database`

## Next Steps

1. Ensure the `AZURE_CREDENTIALS` secret is properly configured in GitHub repository settings
2. If deploying infrastructure with Bicep, deploy or update the resources:
   ```bash
   az deployment group create \
     --resource-group limpopoconnect-rg \
     --template-file infra/main.bicep \
     --parameters baseName=limpopo
   ```
3. Ensure any key/secret management is configured for your chosen database provider (e.g., Supabase service keys or external secrets manager)
4. Test the workflow by pushing to main branch
