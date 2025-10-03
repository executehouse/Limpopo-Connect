# Limpopo Connect API - Backend Readme

This document provides instructions for setting up, running, and testing the Limpopo Connect API locally. The backend is built as a TypeScript Azure Functions application.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker](https://www.docker.com/) and Docker Compose
- [Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local)
- `psql` command-line tool (part of a standard PostgreSQL installation)

## 1. Environment Setup

### 1.1. Environment Variables

The application uses a `.env` file for managing environment variables locally. The Azure Functions runtime automatically loads variables from `local.settings.json`.

Copy the `local.settings.json.template` to `local.settings.json` and fill in the required values.

**`local.settings.json`:**
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "DATABASE_URL": "postgresql://limpopo_user:limpopo_password@localhost:5432/limpopo_connect_dev",
    "JWT_SECRET": "a-very-strong-and-long-secret-key-that-is-at-least-32-characters",
    "NODE_ENV": "development",
    "AZURE_STORAGE_ACCOUNT_NAME": "your-local-dev-storage-account-name",
    "AZURE_STORAGE_ACCOUNT_KEY": "your-local-dev-storage-account-key"
  }
}
```
*Note: For local development, `AZURE_STORAGE_ACCOUNT_NAME` and `AZURE_STORAGE_ACCOUNT_KEY` can be placeholders if you are not testing the signed upload flow. To test uploads, you can use the Azurite storage emulator or a real Azure Storage account.*

### 1.2. Install Dependencies

Navigate to the `limpopo-api` directory and install the required Node.js packages:
```bash
cd limpopo-api
npm install
```

## 2. Local Database Setup

The local development environment uses Docker to run a PostgreSQL database with the PostGIS extension.

### 2.1. Start the Database Container

From the `limpopo-api` directory, run:
```bash
docker-compose up -d
```
This will start a PostgreSQL server accessible at `localhost:5432`.

### 2.2. Run Migrations and Seeding

Once the container is running, you need to apply the database schema and seed it with sample data.

The connection string for the local database is:
`postgresql://limpopo_user:limpopo_password@localhost:5432/limpopo_connect_dev`

**Run the scripts from the `limpopo-api` directory:**

1.  **Enable Extensions:**
    ```bash
    psql "postgresql://limpopo_user:limpopo_password@localhost:5432/limpopo_connect_dev" -f migrations/002_extensions.sql
    ```

2.  **Apply Initial Schema:**
    ```bash
    psql "postgresql://limpopo_user:limpopo_password@localhost:5432/limpopo_connect_dev" -f migrations/001_init_schema.sql
    ```

3.  **Seed Data:**
    ```bash
    psql "postgresql://limpopo_user:limpopo_password@localhost:5432/limpopo_connect_dev" -f seeds/sample_data.sql
    ```

## 3. Running the Application Locally

To start the Azure Functions development server, run the following command from the `limpopo-api` directory:

```bash
npm start
```
This will start the Functions host, and the API will be available at `http://localhost:7071/api`.

## 4. Running Tests

The project uses Jest for unit and integration testing.

To run all tests, execute the following command from the `limpopo-api` directory:
```bash
npm test
```

Make sure your local database is running before executing the tests, as some integration tests may depend on it.