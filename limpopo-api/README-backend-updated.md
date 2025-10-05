# Limpopo Connect Backend API

This is the backend API for the Limpopo Connect PWA, built using Azure Functions with Node.js and TypeScript. It provides a complete authentication system, business directory, events management, marketplace, and more.

## Features

- 🔐 **Authentication System**: JWT-based auth with Argon2 password hashing
- 🏢 **Business Directory**: Search, filter, and geospatial queries
- 📅 **Events Management**: Community events with registration
- 🛒 **Marketplace**: Local products and services
- 📰 **News & Updates**: Community announcements
- 🤖 **AI Integration**: Azure AI inference with GitHub Models (Python)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Azure Functions Core Tools v4
- PostgreSQL 14+ with PostGIS extension
- Azure CLI (for deployment)
- Docker and Docker Compose (for local development)

### Local Development Setup

1. **Clone and navigate to the backend directory:**
   ```bash
   git clone <repo-url>
   cd limpopo-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start local database with Docker:**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations:**
   ```bash
   # Enable extensions
   PGPASSWORD=limpopo_password psql -h localhost -U limpopo_user -d limpopo_connect_dev -f migrations/002_extensions.sql

   # Create schema
   PGPASSWORD=limpopo_password psql -h localhost -U limpopo_user -d limpopo_connect_dev -f migrations/001_init_schema.sql

   # Add password reset tokens table
   PGPASSWORD=limpopo_password psql -h localhost -U limpopo_user -d limpopo_connect_dev -f migrations/003_password_reset_tokens.sql

   # Load sample data
   PGPASSWORD=limpopo_password psql -h localhost -U limpopo_user -d limpopo_connect_dev -f seeds/sample_data.sql
   ```

5. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL=postgresql://limpopo_user:limpopo_password@localhost:5432/limpopo_connect_dev

   # JWT Secret (use a strong secret in production)
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

   # Azure Key Vault (optional for local dev)
   # KEY_VAULT_URL=https://your-keyvault.vault.azure.net/

   # Azure Storage (for file uploads)
   # AZURE_STORAGE_ACCOUNT_NAME=your_storage_account
   # AZURE_STORAGE_ACCOUNT_KEY=your_storage_key

   # GitHub Token for AI Inference (optional)
   # GITHUB_TOKEN=your_github_personal_access_token

   # Environment
   NODE_ENV=development
   ```

6. **Start the local development server:**
   ```bash
   npm run start
   ```

The API will be available at `http://localhost:7071/api`.

## Authentication System

### Overview

The authentication system uses JWT tokens with the following features:
- **Argon2** password hashing for maximum security
- **Access tokens** (15-minute expiry) for API access
- **Refresh tokens** (7-day expiry) for token renewal
- **Role-based access control** (visitor, resident, business, admin)
- **Azure Key Vault integration** for production secrets
- **Email verification** support (placeholder implementation)
- **Password reset flow** with secure tokens

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "StrongPass123!",
  "name": "John Doe",
  "role": "resident"  // optional: visitor, resident, business
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "resident",
    "is_verified": false,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Validation Rules:**
- Email must be valid format
- Password must be at least 8 characters with uppercase, lowercase, and number
- Name must be 2-100 characters
- Role defaults to 'resident' if not provided

#### POST /api/auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "StrongPass123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "resident",
    "is_verified": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST /api/auth/refresh
Refresh an expired access token using a refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST /api/auth/forgot-password
Initiate password reset flow.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

#### POST /api/auth/reset-password
Complete password reset with token.

**Request:**
```json
{
  "token": "reset-token-uuid",
  "password": "NewStrongPass123!"
}
```

**Response (200):**
```json
{
  "message": "Password has been reset successfully"
}
```

#### GET /api/users/me
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "resident",
  "is_verified": true,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### Using Authentication

Include the access token in the Authorization header for protected endpoints:

```javascript
fetch('/api/protected-endpoint', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
})
```

### Role-Based Access Control

The API supports four user roles with different permissions:

- **visitor** - Can view public content, limited registration access
- **resident** - Can create events and marketplace items, full community features
- **business** - Can manage business listings, enhanced marketplace access  
- **admin** - Full platform access, user management, system administration

Use the `withAuth` middleware with role restrictions:

```typescript
import { withAuth } from '../lib/auth';

// Require any authenticated user
app.http('protectedEndpoint', {
  handler: withAuth(myHandler)
});

// Require specific roles
app.http('adminEndpoint', {
  handler: withAuth(myHandler, ['admin'])
});

// Allow multiple roles
app.http('businessEndpoint', {
  handler: withAuth(myHandler, ['business', 'admin'])
});
```

## API Endpoints

### Business Directory

- `GET /api/businesses` - List businesses with filtering and search
- `POST /api/businesses` - Create a new business (requires business/admin role)
- `GET /api/businesses/:id` - Get business details
- `PUT /api/businesses/:id` - Update business (owner or admin only)
- `DELETE /api/businesses/:id` - Delete business (owner or admin only)

### Events

- `GET /api/events` - List events with filtering
- `POST /api/events` - Create an event (requires resident+ role)
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event (creator or admin only)
- `DELETE /api/events/:id` - Delete event (creator or admin only)
- `POST /api/events/:id/register` - Register for an event
- `DELETE /api/events/:id/register` - Cancel event registration

### Marketplace

- `GET /api/market-items` - List marketplace items
- `POST /api/market-items` - Create a marketplace item (requires resident+ role)
- `GET /api/market-items/:id` - Get item details
- `PUT /api/market-items/:id` - Update item (seller or admin only)
- `DELETE /api/market-items/:id` - Delete item (seller or admin only)

### Orders

- `GET /api/orders` - List user's orders (requires authentication)
- `POST /api/orders` - Create a new order
- `GET /api/orders/:id` - Get order details (buyer, seller, or admin only)
- `POST /api/orders/:id/pay` - Process payment for an order

### File Uploads

- `POST /api/uploads/signed-url` - Get a signed URL for file upload
- `POST /api/uploads/process` - Process uploaded file (triggered automatically)

### Search

- `GET /api/search` - Search across businesses, events, and marketplace items

### News

- `GET /api/news` - List news articles
- `POST /api/news` - Create news article (admin only)
- `GET /api/news/:id` - Get news article details
- `PUT /api/news/:id` - Update news article (admin only)
- `DELETE /api/news/:id` - Delete news article (admin only)

### Health & Monitoring

- `GET /api/health` - Health check endpoint
- `GET /api/metrics` - Application metrics (admin only)

## Error Handling

All endpoints return consistent error responses with appropriate HTTP status codes:

```json
{
  "error": "Error message",
  "details": ["Additional error details"]  // Optional array for validation errors
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

**Authentication Error Examples:**
```json
// Missing token
{ "error": "Unauthorized: No token provided" }

// Invalid token
{ "error": "Unauthorized: Invalid token" }

// Expired token
{ "error": "Unauthorized: Token expired" }

// Insufficient permissions
{ "error": "Forbidden: Insufficient permissions" }

// Email not verified
{ "error": "Unauthorized: Email not verified" }
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts

# Run tests in watch mode
npm test -- --watch
```

### Test Structure

- **Unit Tests:** `tests/unit/` - Test individual functions and utilities
- **Integration Tests:** `tests/integration/` - Test API endpoints and flows
- **Test Database:** Tests use mocked database connections for isolation

### Example Test Usage

```bash
# Test auth registration flow
npm test -- tests/integration/auth.flow.test.ts

# Test validation utilities
npm test -- tests/unit/auth.test.ts
```

## Database Management

### Migrations

Database migrations are located in `migrations/` and should be run in order:

1. `002_extensions.sql` - Enable required PostgreSQL extensions
2. `001_init_schema.sql` - Create all tables, indexes, and constraints
3. `003_password_reset_tokens.sql` - Add password reset functionality

### Sample Data

Load sample data for development:
```bash
PGPASSWORD=limpopo_password psql -h localhost -U limpopo_user -d limpopo_connect_dev -f seeds/sample_data.sql
```

### Schema Overview

Key tables:
- `users` - User accounts and authentication
- `businesses` - Business directory with geospatial data
- `events` - Community events with registration
- `market_items` - Marketplace listings
- `orders` - E-commerce transactions
- `news_articles` - Community news and announcements
- `uploads` - File upload tracking
- `audit_logs` - System audit trail

## Deployment

### Environment Variables

**Production Required:**
```env
DATABASE_URL=postgresql://user:pass@server:5432/db
JWT_SECRET=minimum-32-character-secret-key
KEY_VAULT_URL=https://your-keyvault.vault.azure.net/
AZURE_STORAGE_ACCOUNT_NAME=yourstorageaccount
NODE_ENV=production
```

**Optional:**
```env
AZURE_STORAGE_ACCOUNT_KEY=key  # Use managed identity if possible
APPINSIGHTS_INSTRUMENTATIONKEY=key  # Application Insights
```

### Deploy to Azure

```bash
# Build the project
npm run build

# Deploy to Azure Functions
func azure functionapp publish <app-name>

# Set environment variables
az functionapp config appsettings set --name <app-name> --resource-group <rg> --settings DATABASE_URL="<connection-string>"
```

### Security Considerations

1. **Secrets Management:** Use Azure Key Vault for production secrets
2. **Database Security:** Enable SSL and use managed identity where possible
3. **CORS:** Configure appropriate CORS policies for your frontend domains
4. **Rate Limiting:** Implement rate limiting for public endpoints
5. **Input Validation:** All inputs are sanitized and validated
6. **SQL Injection:** Uses parameterized queries throughout

## AI Integration

The backend includes Python-based AI integration using Azure AI Inference with GitHub Models. This enables intelligent features like:

- Natural language business search
- Content generation for descriptions
- FAQ chatbot capabilities
- Content summarization
- Translation services

### Setup AI Integration

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up GitHub Token:**
   Create a token at https://github.com/settings/tokens and add to your `.env`:
   ```env
   GITHUB_TOKEN=your_github_personal_access_token
   ```

3. **Test the integration:**
   ```bash
   python ai_inference.py
   ```

For detailed documentation, see [AI_INTEGRATION.md](./AI_INTEGRATION.md).

## Architecture

```
src/
├── functions/          # Azure Functions handlers
│   ├── auth*.ts       # Authentication endpoints
│   ├── users*.ts      # User management
│   ├── businesses*.ts # Business directory
│   ├── events*.ts     # Events management
│   └── ...
├── models/            # Data models and database access
│   ├── user.ts        # User data access layer
│   ├── business.ts    # Business data access layer
│   └── ...
├── lib/               # Shared utilities
│   ├── auth.ts        # JWT and role-based auth
│   ├── db.ts          # Database connection pool
│   ├── validation.ts  # Input validation utilities
│   └── ...
└── services/          # Business logic services
    ├── payment.ts     # Payment processing
    ├── upload.ts      # File upload handling
    └── ...
```

Each function is self-contained and handles a specific API endpoint, with shared utilities in the `lib/` directory and data access patterns in `models/`.