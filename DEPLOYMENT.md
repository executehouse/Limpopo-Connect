# Deployment Status

The Limpopo Connect application has been successfully deployed to GitHub Pages with the custom domain `limpopoconnect.site`.

## Current Status ✅
- ✅ **GitHub Pages Deployment**: Automated deployment on every push to main branch
- ✅ **Custom Domain**: `limpopoconnect.site` configured via CNAME
- ✅ **PWA Support**: Progressive Web App with service worker and manifest
- ✅ **Build Optimization**: Vite configuration optimized for production
- ✅ **CI/CD Pipeline**: Comprehensive testing and deployment automation
- ✅ **Accessibility Testing**: Automated axe-core accessibility checks

## Deployment Workflow
1. Code pushed to main branch triggers GitHub Actions
2. Dependencies installed and project built with Vite
3. Build artifacts deployed to GitHub Pages
4. Custom domain serves the application at https://limpopoconnect.site

## Performance Optimizations
- Source maps disabled for production
- Code splitting with manual chunks for major dependencies
- Minified build with esbuild
- Service worker for offline functionality
- PWA manifest for native app-like experience

## Monitoring
- Deployment status: [![Deploy to GitHub Pages](https://github.com/Tshikwetamakole/Limpopo-Connect/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/Tshikwetamakole/Limpopo-Connect/actions/workflows/deploy-pages.yml)
- CI/CD status: [![CI/CD Pipeline](https://github.com/Tshikwetamakole/Limpopo-Connect/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Tshikwetamakole/Limpopo-Connect/actions/workflows/ci-cd.yml)

## Azure Infrastructure Deployment

The Azure infrastructure is managed via Bicep files in the `infra/` directory and deployed using a dedicated GitHub Actions workflow.

### Workflow
- **Name**: `Deploy Infrastructure`
- **Trigger**: Manual (`workflow_dispatch`)
- **File**: `.github/workflows/deploy-infra.yml`

To deploy or update the infrastructure, navigate to the "Actions" tab of the GitHub repository, select the "Deploy Infrastructure" workflow, and run it.

### Required Secrets
The workflow requires the following secrets to be configured in the GitHub repository settings (`Settings > Secrets and variables > Actions`):

-   `AZURE_CREDENTIALS`: A JSON object containing the credentials for an Azure service principal with permissions to deploy resources. It should look like this:
    ```json
    {
      "clientId": "...",
      "clientSecret": "...",
      "subscriptionId": "...",
      "tenantId": "..."
    }
    ```
-   `AZURE_SUBSCRIPTION_ID`: The ID of the Azure subscription where resources will be deployed.
-   `AZURE_RG_NAME`: The name of the Azure resource group for the deployment.
-   `POSTGRES_ADMIN`: The desired administrator username for the PostgreSQL server.
-   `POSTGRES_ADMIN_PASSWORD`: The secure password for the PostgreSQL administrator.

## Azure Key Vault Secrets Sync

A dedicated workflow syncs secrets from Azure Key Vault to GitHub repository secrets, enabling automated secret management.

### Workflow
- **Name**: `Sync Azure Key Vault Secrets`
- **Trigger**: Manual (`workflow_dispatch`) or weekly schedule (Sundays at 00:00 UTC)
- **File**: `.github/workflows/sync-keyvault-secrets.yml`

This workflow pulls secrets from Azure Key Vault and stores them as GitHub repository secrets, making them available for use in other workflows.

### Required Secrets
-   `AZURE_CREDENTIALS`: Same as above for Azure authentication
-   `AZURE_KEYVAULT_NAME`: The name of the Azure Key Vault (e.g., `limpopo-kv` or the full Key Vault name from your infrastructure)
-   `GH_PAT`: A GitHub Personal Access Token with `repo` scope for writing repository secrets