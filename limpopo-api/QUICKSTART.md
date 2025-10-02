# Quick Start: Azure PostgreSQL Connection

## 🚀 5-Minute Setup

### 1. Create Database Server (Azure Portal)
```
portal.azure.com → Create Resource → PostgreSQL Flexible Server
```

### 2. Get Connection String
```
Server Overview → Connection strings → Copy and format as:
postgresql://username:password@server.postgres.database.azure.com:5432/limpopoconnect?sslmode=require
```

### 3. Setup Locally
```bash
cd limpopo-api
npm install
npm run setup:env
# Edit .env with your connection string
npm run test:connection
```

### 4. Initialize Database
```bash
psql $DATABASE_URL -f setup-database.sql
```

### 5. Test
```bash
npm run test:connection
```

## 📝 Connection String Format

```
DATABASE_URL=postgresql://USERNAME:PASSWORD@SERVER.postgres.database.azure.com:5432/DATABASE?sslmode=require
```

**Replace:**
- `USERNAME`: Your admin username (without @servername for Flexible Server)
- `PASSWORD`: Your password (URL-encode special characters)
- `SERVER`: Your server name from Azure
- `DATABASE`: Database name (default: limpopoconnect)

**Example:**
```
DATABASE_URL=postgresql://admin:MyPass123@myserver.postgres.database.azure.com:5432/limpopoconnect?sslmode=require
```

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| Connection timeout | Check firewall rules, whitelist your IP |
| SSL error | Add `?sslmode=require` to connection string |
| Auth failed | Check username (no @server suffix), URL-encode password |
| Database not found | Create database in Azure Portal first |

## 🔗 Password URL Encoding

If your password contains special characters:
- `@` → `%40`
- `#` → `%23`  
- `$` → `%24`
- `&` → `%26`
- `+` → `%2B`

## 📚 More Help

- Full guide: [AZURE_SETUP_GUIDE.md](./AZURE_SETUP_GUIDE.md)
- Test script: `npm run test:connection`
- Database schema: [setup-database.sql](./setup-database.sql)
