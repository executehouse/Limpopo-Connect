# Limpopo Connect - Azure PostgreSQL Architecture

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Limpopo Connect Application                 │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
            ┌───────▼────────┐       ┌───────▼────────┐
            │   Frontend     │       │   Azure        │
            │   (React)      │       │   Functions    │
            │   Vite App     │       │   (Node.js)    │
            └────────────────┘       └────────┬───────┘
                                              │
                                              │ pg library
                                              │ SSL connection
                                              │
                                    ┌─────────▼─────────┐
                                    │    db.js          │
                                    │  Connection Pool  │
                                    │  (10 connections) │
                                    └─────────┬─────────┘
                                              │
                                              │ DATABASE_URL
                                              │ (from .env)
                                              │
                          ┌───────────────────▼───────────────────┐
                          │   Azure PostgreSQL Flexible Server    │
                          │                                        │
                          │  ┌──────────────────────────────────┐ │
                          │  │  Database: limpopoconnect        │ │
                          │  │                                  │ │
                          │  │  Tables:                         │ │
                          │  │  • listings                      │ │
                          │  │  • events                        │ │
                          │  │  • marketplace_items             │ │
                          │  │  • tourism_attractions           │ │
                          │  │  • users                         │ │
                          │  └──────────────────────────────────┘ │
                          │                                        │
                          │  Features:                             │
                          │  • SSL/TLS Encryption                  │
                          │  • Firewall Rules                      │
                          │  • Automated Backups                   │
                          │  • High Availability (optional)        │
                          └────────────────────────────────────────┘
```

## Connection Flow

1. **Application Start**
   - Azure Function loads environment variables from `.env` or Azure App Settings
   - `db.js` creates connection pool with SSL configuration

2. **Request Processing**
   - HTTP request received by Azure Function
   - Function queries database using `db.query()`
   - Connection pool manages database connections

3. **Database Query**
   - Connection established with SSL/TLS
   - Query executed on PostgreSQL Flexible Server
   - Results returned to Azure Function

4. **Response**
   - Azure Function formats response
   - HTTP response sent to client

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                      Security Stack                          │
├─────────────────────────────────────────────────────────────┤
│  1. Network: Azure Firewall Rules                           │
│     • IP Whitelisting                                        │
│     • Azure Service Access Control                           │
├─────────────────────────────────────────────────────────────┤
│  2. Transport: SSL/TLS Encryption                           │
│     • Required for all connections                           │
│     • Certificate validation                                 │
├─────────────────────────────────────────────────────────────┤
│  3. Authentication: PostgreSQL Auth                          │
│     • Username/Password                                      │
│     • Azure Active Directory (optional)                      │
├─────────────────────────────────────────────────────────────┤
│  4. Authorization: Database Permissions                      │
│     • Role-based access control                              │
│     • Table-level permissions                                │
└─────────────────────────────────────────────────────────────┘
```

## Connection String Components

```
postgresql://username:password@server.postgres.database.azure.com:5432/database?sslmode=require
          └────┬────┘└───┬───┘ └────────────┬───────────────────┘└┬─┘└───┬───┘└──────┬──────┘
              │         │                  │                      │     │          │
           Username  Password         Server Name                Port Database  SSL Required
```

### Component Details

| Component | Description | Example |
|-----------|-------------|---------|
| **Protocol** | PostgreSQL protocol | `postgresql://` |
| **Username** | Admin or user account | `limpopoconnect_admin` |
| **Password** | Account password (URL-encoded) | `MyP@ssw0rd` → `MyP%40ssw0rd` |
| **Server** | Azure server hostname | `limpopoconnect-db.postgres.database.azure.com` |
| **Port** | PostgreSQL port | `5432` (default) |
| **Database** | Database name | `limpopoconnect` |
| **SSL Mode** | SSL requirement | `?sslmode=require` |

## File Structure

```
limpopo-api/
├── .env                      # Environment variables (not in git)
├── .env.example              # Template for .env
├── .gitignore                # Excludes node_modules, .env
├── package.json              # Dependencies and scripts
├── db.js                     # Database connection pool
├── test-connection.js        # Connection testing script
├── setup-database.sql        # Database schema
├── QUICKSTART.md             # Quick reference
├── AZURE_SETUP_GUIDE.md      # Comprehensive guide
├── README.md                 # API documentation
└── GetListings/
    ├── function.json         # Azure Function config
    └── index.js              # Function handler
```

## Development vs Production

### Development (Local)
```
Developer Machine
     │
     │ (1) Set DATABASE_URL in .env
     │
     ├──► Azure Functions Core Tools (func start)
     │         │
     │         │ (2) Reads .env file
     │         │
     │         └──► Connects to Azure PostgreSQL
     │                    │
     │                    │ (3) Firewall allows developer IP
     │                    │
     └────────────────────┴──► Database queries
```

### Production (Azure)
```
Internet
     │
     │ (1) HTTPS request
     │
     ├──► Azure Function App
     │         │
     │         │ (2) Reads Application Settings
     │         │     (DATABASE_URL stored securely)
     │         │
     │         └──► Azure PostgreSQL Flexible Server
     │                    │
     │                    │ (3) Firewall allows Azure services
     │                    │
     └────────────────────┴──► Database queries
```

## Connection Pooling

```
┌─────────────────────────────────┐
│      Connection Pool (db.js)    │
│                                  │
│  Max Connections: 10             │
│  Idle Timeout: 30s               │
│  Connection Timeout: 2s          │
│                                  │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐       │
│  │ 1 │ │ 2 │ │ 3 │ │...│  ◄──── Reusable connections
│  └───┘ └───┘ └───┘ └───┘       │
│   │     │     │     │           │
└───┼─────┼─────┼─────┼───────────┘
    │     │     │     │
    └─────┴─────┴─────┴──────► Azure PostgreSQL
                                 Flexible Server
```

Benefits:
- Reduced connection overhead
- Better performance under load
- Automatic connection management
- Error handling and retry logic

## Monitoring Points

```
┌──────────────────────────────────────────────────────────┐
│                   Monitoring Stack                        │
├──────────────────────────────────────────────────────────┤
│  1. Application Logs                                     │
│     • Azure Function logs                                 │
│     • Connection errors                                   │
│     • Query performance                                   │
├──────────────────────────────────────────────────────────┤
│  2. Database Metrics (Azure Portal)                      │
│     • CPU usage                                           │
│     • Memory usage                                        │
│     • Active connections                                  │
│     • Storage usage                                       │
│     • Query performance                                   │
├──────────────────────────────────────────────────────────┤
│  3. Network Monitoring                                    │
│     • Firewall events                                     │
│     • Connection attempts                                 │
│     • SSL/TLS handshakes                                  │
└──────────────────────────────────────────────────────────┘
```

## Troubleshooting Flow

```
Connection Issue
      │
      ├─► Can't connect?
      │         │
      │         ├─► Check firewall rules
      │         ├─► Verify IP whitelist
      │         └─► Test network connectivity
      │
      ├─► SSL Error?
      │         │
      │         ├─► Add ?sslmode=require
      │         └─► Check SSL configuration
      │
      ├─► Auth Failed?
      │         │
      │         ├─► Verify username (no @server)
      │         ├─► Check password encoding
      │         └─► Test credentials
      │
      └─► Timeout?
                │
                ├─► Check server status
                ├─► Review connection pool settings
                └─► Monitor active connections
```

## Next Steps

1. ✅ Set up Azure PostgreSQL Flexible Server
2. ✅ Configure firewall rules
3. ✅ Create .env file with connection string
4. ✅ Run `npm run test:connection`
5. ✅ Initialize database with `setup-database.sql`
6. 🚀 Start building your application!

---

For more information:
- [QUICKSTART.md](./QUICKSTART.md) - Quick setup guide
- [AZURE_SETUP_GUIDE.md](./AZURE_SETUP_GUIDE.md) - Comprehensive setup
- [README.md](./README.md) - API documentation
