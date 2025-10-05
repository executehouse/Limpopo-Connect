# Limpopo Connect - Operational Runbook

This document outlines the standard operating procedures for deploying, monitoring, and maintaining the Limpopo Connect backend infrastructure.

## 1. Deployment

The infrastructure is managed via Bicep templates and the application is deployed using an Azure DevOps pipeline.

### 1.1. Initial Deployment to a New Environment

1.  **Azure Subscription & Permissions:** Ensure you have an Azure subscription and the necessary permissions (Owner or Contributor) to create resource groups and deploy resources.
2.  **Azure DevOps Setup:**
    *   Create a new project in Azure DevOps.
    *   Push the repository to Azure Repos.
    *   Create a **Variable Group** named `LimpopoConnect-Prod` and add the following secret variables (do not store managed-database admin passwords in pipeline variables; use your provider's secret management instead):
        *   `JWT_SECRET`: A long, strong, randomly generated string for signing JWTs.
        *   `STORAGE_ACCOUNT_NAME`: The name of the storage account you will create.
        *   `STORAGE_ACCOUNT_KEY`: The access key for the storage account.
    *   Create a **Service Connection** to your Azure subscription and name it `your-azure-subscription` (or update the `azure-pipelines.yml` to match your service connection name).
3.  **Run the Pipeline:**
    *   Navigate to **Pipelines** in Azure DevOps and create a new pipeline, pointing it to the `azure-pipelines.yml` file in the repository.
    *   Run the pipeline. It will execute the `Build` and `Deploy` stages.
    *   The `Deploy` stage will:
        1.  Create the resource group.
        2.  Deploy all Bicep templates (`main.bicep`).
        3.  Run the database migrations and seeding scripts.
        4.  Deploy the latest build of the Azure Function App.

### 1.2. Subsequent Deployments

Any commit to the `main` or `backend/infra` branch will automatically trigger the pipeline, which will build and deploy the latest changes. The infrastructure deployment is idempotent.

## 2. Monitoring

Application health and performance are monitored using **Azure Application Insights**.

*   **Live Metrics:** View real-time telemetry in the Application Insights "Live Metrics" stream to observe requests, performance, and failures as they happen.
*   **Failures:** The "Failures" blade provides aggregated views of exceptions and failed requests. Use this to identify and diagnose common errors.
*   **Performance:** The "Performance" blade shows response times for API operations and their dependencies. Use this to identify performance bottlenecks.
*   **Alerts:** Configure alerts for key metrics:
    *   **High CPU usage:** On the App Service Plan.
    *   **High memory usage:** On the App Service Plan.
    *   **High server response time:** For the Function App.
    *   **High number of server exceptions:** For the Function App.

## 3. Backup and Restore

### Database Backup & Restore (managed externally)

Database provisioning, backups, and restore procedures are managed by your chosen database provider (for example, Supabase or another managed Postgres provider). Follow the provider's documentation to configure backups, snapshot retention, and restore procedures. After restoring or changing database endpoints, update the `DATABASE_URL` or corresponding secret in your application's secrets store (Key Vault, environment variables, or provider secrets) and restart services if required.

### Blob Storage

*   **Soft Delete:** Enable soft delete on the Blob Storage account to protect against accidental deletion of blobs.
*   **Geo-Redundancy:** For production, consider using Geo-Redundant Storage (GRS) for the storage account to protect against regional outages.

## 4. Key Rotation

Secrets such as the database password and JWT secret should be rotated periodically.

1.  **Generate New Secret:** Generate a new strong password or secret key.
3.  **Update Key Vault or Secrets Manager:**
    *   Navigate to your secrets manager (Azure Key Vault, Supabase secrets, etc.).
    *   Update the secret value and create a new version where applicable.
4.  **Update Dependent Service:**
    *   Update the database credentials in the provider or application configuration as needed.
5.  **Restart Application:** Restart the application or function app so it picks up new secret versions from the secrets store.

## 5. Incident Response

1.  **Identify Issue:** Use Application Insights (Failures, Live Metrics) to identify the nature of the incident (e.g., high error rate, slow responses).
2.  **Check Azure Status:** Visit the [Azure Status](https://azure.status.microsoft/en-us/status) page to check for any ongoing regional issues.
3.  **Scale Resources:** If the issue is performance-related, consider scaling up the App Service Plan or the PostgreSQL server SKU.
4.  **Rollback Deployment:** If the incident was caused by a recent deployment, you can redeploy a previous, stable build from the Azure DevOps pipeline history.
5.  **Restore Database:** If data corruption is suspected, follow the database restore procedure outlined above.