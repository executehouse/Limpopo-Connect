# Backend Credentials and Environment Variables

This document lists the necessary credentials and environment variables required to run the Limpopo Connect backend services. These should be stored securely and set in your deployment environment (e.g., in a `.env` file for local development or as application settings in Azure).

A template for local development can be found in `local.settings.json.template`.

---

### Core API Services (`auth.js`, `businesses.js`)

These variables are essential for the primary user authentication and business listing functionalities.

1.  **`DATABASE_URL`**
    *   **Description**: The full connection string for your PostgreSQL database.
    *   **Source**: Obtain this from your cloud database provider (e.g., Azure Database for PostgreSQL, Amazon RDS).
    *   **Format**: `postgresql://<user>:<password>@<host>:<port>/<database>?sslmode=require`

2.  **`JWT_SECRET`**
    *   **Description**: A long, strong, and secret key used to sign and verify JSON Web Tokens (JWTs) for securing user sessions.
    *   **Source**: Generate a random string of at least 32 characters. You can use a password generator or a command-line tool like `openssl rand -hex 32`.

3.  **`AzureWebJobsStorage`**
    *   **Description**: The connection string for an Azure Storage account. This is a requirement for the Azure Functions runtime to manage triggers, logging, and other internal operations.
    *   **Source**: Find this in your Azure Storage Account settings under "Access keys" in the Azure portal.

4.  **`AZURE_STORAGE_ACCOUNT_NAME`**
    *   **Description**: The name of the Azure Storage account. While not used in the current version for file storage, it is good practice to have it for future features like image uploads.
    *   **Source**: Your Azure Storage Account settings in the Azure portal.

5.  **`AZURE_STORAGE_ACCOUNT_KEY`**
    *   **Description**: The access key for the specified Azure Storage account.
    *   **Source**: Find this in your Azure Storage Account settings under "Access keys" in the Azure portal.

---

### AI Inference Service (`ai_inference.py`)

This variable is required for the AI-powered features.

6.  **`GITHUB_TOKEN`**
    *   **Description**: A GitHub Personal Access Token (PAT) used to authenticate with the GitHub Models AI inference endpoint.
    *   **Source**: Generate a token from your GitHub account: **Settings** > **Developer settings** > **Personal access tokens**.