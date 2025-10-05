# GitHub Actions Workflows

This directory contains GitHub Actions workflows for the Limpopo Connect project.

## Workflows

### Deploy Infrastructure (`deploy-infra.yml`)
- **Trigger**: Manual (`workflow_dispatch`)
- **Purpose**: Deploy Azure infrastructure using Bicep templates
- **Azure CLI Action**: Uses `Azure/cli@v2.2.0` for verification steps

### Deploy to GitHub Pages (`deploy-pages.yml`)
- **Trigger**: Push to `main` branch
- **Purpose**: Build and deploy the frontend application to GitHub Pages

### Deploy Limpopo Connect with Key Vault (`deploy.yml`)
- **Trigger**: Push to `main` branch
- **Purpose**: Deploy the application to Azure Web App with Key Vault integration
- **Azure CLI Action**: Uses `Azure/cli@v2.2.0` for verifying deployment status and other Key Vault interactions (DB secret retrieval removed)

### Build and Deploy Node.js App (`main_limpoconnect-webapp.yml`)
- **Trigger**: Push to `main` branch or manual
- **Purpose**: Build and deploy Node.js application to Azure Web App

## Azure CLI Action

The workflows use the `Azure/cli@v2.2.0` action to execute Azure CLI commands. This provides:

- **Better integration**: Seamless integration with Azure authentication
- **Improved error handling**: Better error reporting and logging
- **Cleaner syntax**: Dedicated action instead of shell scripts
- **Consistent approach**: Standardized way to interact with Azure resources

### Example Usage

```yaml
- name: Run Azure CLI Commands
  uses: Azure/cli@v2.2.0
  with:
    inlineScript: |
      az group show -n my-resource-group
      az resource list -g my-resource-group
```

## Required Secrets

The workflows require the following GitHub secrets to be configured:

- `AZURE_CREDENTIALS`: Azure service principal credentials (JSON format)
- `AZURE_SUBSCRIPTION_ID`: Azure subscription ID
- `AZURE_RG_NAME`: Azure resource group name
<!-- PostgreSQL admin secrets removed from workflow requirements -->

For more details on deployment, see the [DEPLOYMENT.md](../../DEPLOYMENT.md) file.
