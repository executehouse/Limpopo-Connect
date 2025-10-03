# Limpopo Connect - Security Policy

This document outlines the security policies and procedures for the Limpopo Connect application and infrastructure.

## Threat Model

The threat model considers potential vulnerabilities and attack vectors against the application, infrastructure, and data.

| Threat / Attack Vector        | Mitigation Strategy                                                                                                                                                                                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SQL Injection**             | - All database queries are executed using parameterized statements via the `pg` library.<br>- No dynamic SQL string concatenation is used for constructing queries with user input.<br>- The data access layer abstracts query construction.                                         |
| **Cross-Site Scripting (XSS)**| - The API is stateless and primarily returns JSON data. The frontend PWA is responsible for properly sanitizing and rendering any user-generated content.<br>- Content-Security-Policy (CSP) headers should be implemented on the frontend.                                        |
| **Authentication Bypass**     | - Strong password hashing (`argon2`) is enforced.<br>- JWTs are used for session management with short-lived access tokens (15m) and longer-lived refresh tokens (7d).<br>- All sensitive endpoints are protected by `withAuth` middleware that validates JWTs and user roles.      |
| **Insecure Direct Object Ref.** | - Authorization checks are performed in all relevant API endpoints to ensure a user can only access or modify resources they own (e.g., updating a business, deleting a market item).<br>- Admin roles provide elevated privileges and are strictly controlled.                  |
| **Denial of Service (DoS)**   | - The Azure Function App runs on a Consumption/Premium plan which scales automatically.<br>- Rate limiting middleware should be implemented to prevent abuse (e.g., per-IP request limits).<br>- Azure provides DDoS Protection Basic for all public IPs.                          |
| **Sensitive Data Exposure**   | - All communication is enforced over TLS (HTTPS).<br>- Database connections require SSL.<br>- All secrets (passwords, API keys, JWT secret) are stored in Azure Key Vault, not in source code.<br>- The Function App uses a managed identity to access secrets from Key Vault. |
| **Insecure File Uploads**     | - Users do not upload files directly to the API server.<br>- A signed URL (SAS) flow is used for direct uploads to Azure Blob Storage.<br>- Uploaded content is processed in a separate, isolated Blob Trigger function.<br>- Content-Type is validated on signed URL generation. |

## Password Policy

-   **Hashing:** Passwords must be hashed using `argon2id` (preferred) or `bcrypt`. `argon2` is the current implementation choice.
-   **Complexity:** Enforced on the client-side. Recommended: at least 8 characters, with a mix of uppercase, lowercase, numbers, and symbols.
-   **Reset:** A secure password reset flow is implemented using a time-limited, single-use token sent to the user's verified email address.

## Key & Secret Management

-   **Storage:** All application secrets, including database connection strings, third-party API keys, and the JWT signing secret, **must** be stored in Azure Key Vault.
-   **Access:** The Azure Function App is configured with a system-assigned Managed Identity. This identity is granted `get` and `list` permissions on secrets in the Key Vault via an access policy. The application code references secrets using the `@Microsoft.KeyVault(...)` syntax in application settings, allowing the Functions runtime to securely inject them.
-   **Rotation:**
    -   **JWT Secret:** Should be rotated every 90 days.
    -   **Database Password:** Should be rotated every 90-180 days.
    -   **Procedure:**
        1.  Generate a new key/password.
        2.  Add it as a new version of the secret in Azure Key Vault.
        3.  Update the password on the resource itself (e.g., PostgreSQL server).
        4.  Restart the Function App to ensure it picks up the new secret version.

## Acceptable Use

-   The API is intended for use by the Limpopo Connect PWA and authorized partners only.
-   Automated scraping or high-frequency requests outside of normal application usage are prohibited and may result in IP-based blocking.
-   Users are prohibited from uploading illegal, malicious, or copyrighted content.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it to us immediately by emailing `security@limpopo-connect.example.com`. We will work with you to assess the issue and take corrective action. Please do not disclose the vulnerability publicly until a patch has been released.