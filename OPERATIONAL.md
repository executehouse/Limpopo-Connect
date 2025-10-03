# Limpopo Connect - Operational Runbook

This document outlines the standard operating procedures for deploying, monitoring, and maintaining the Limpopo Connect backend infrastructure.

## 1. Deployment

The infrastructure is managed via Bicep templates and the application is deployed using an Azure DevOps pipeline.

### 1.1. Initial Deployment to a New Environment

1.  **Azure Subscription & Permissions:** Ensure you have an Azure subscription and the necessary permissions (Owner or Contributor) to create resource groups and deploy resources.
2.  **Azure DevOps Setup:**
    *   Create a new project in Azure DevOps.
    *   Push the repository to Azure Repos.
    *   Create a **Variable Group** named `LimpopoConnect-Prod` and add the following secret variables:
        *   `POSTGRES_ADMIN_USER`: The desired admin username for the PostgreSQL server.
        *   `POSTGRES_ADMIN_PASSWORD`: A strong password for the PostgreSQL admin user.
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

### PostgreSQL Database

The Azure Database for PostgreSQL Flexible Server is configured with Point-in-Time Restore (PITR) enabled by default.

*   **Backup Retention:** Backups are retained for 7 days (configurable in `infra/db.bicep`).
*   **Restore Procedure:**
    1.  Navigate to the Azure Database for PostgreSQL Flexible Server resource in the Azure Portal.
    2.  In the **Overview** blade, click **Restore**.
    3.  Choose **Point-in-time restore**.
    4.  Select a restore point (up to the last 5 minutes).
    5.  Provide a name for the **new** server that will be created from the backup.
    6.  Review and create the new server.
    7.  Once the new server is provisioned, update the `DATABASE_URL` application setting in the Function App (or Key Vault) to point to the new database server.
    8.  Restart the Function App.

### Blob Storage

*   **Soft Delete:** Enable soft delete on the Blob Storage account to protect against accidental deletion of blobs.
*   **Geo-Redundancy:** For production, consider using Geo-Redundant Storage (GRS) for the storage account to protect against regional outages.

## 4. Key Rotation

Secrets such as the database password and JWT secret should be rotated periodically.

1.  **Generate New Secret:** Generate a new strong password or secret key.
2.  **Update Key Vault:**
    *   Navigate to the Azure Key Vault resource in the Azure Portal.
    *   Go to the **Secrets** blade.
    *   Select the secret you want to update (e.g., `JwtSecret` or `PostgresAdminPassword`).
    *   Click **+ New Version** and paste the new secret value.
3.  **Update Dependent Service:**
    *   For the **PostgreSQL password**, you must also update it on the PostgreSQL server itself via the "Reset admin password" feature in the Azure Portal.
4.  **Restart Application:** Restart the Azure Function App to ensure it picks up the new secret versions from Key Vault.

## 5. Incident Response

1.  **Identify Issue:** Use Application Insights (Failures, Live Metrics) to identify the nature of the incident (e.g., high error rate, slow responses).
2.  **Check Azure Status:** Visit the [Azure Status](https://azure.status.microsoft/en-us/status) page to check for any ongoing regional issues.
3.  **Scale Resources:** If the issue is performance-related, consider scaling up the App Service Plan or the PostgreSQL server SKU.
4.  **Rollback Deployment:** If the incident was caused by a recent deployment, you can redeploy a previous, stable build from the Azure DevOps pipeline history.
5.  **Restore Database:** If data corruption is suspected, follow the database restore procedure outlined above.