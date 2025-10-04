# Deployment Checklist

This document provides a step-by-step checklist for deploying Limpopo Connect to production.

## Pre-Deployment Verification ✅

### Code Quality
- [x] All tests passing (45/45 tests)
- [x] Build successful for both frontend and backend
- [x] No TypeScript compilation errors
- [x] Code reviewed and approved

### Test Results
```bash
# Backend API Tests
cd limpopo-api
npm test
# Result: ✅ Test Suites: 6 passed, Tests: 45 passed

# Backend Build
npm run build
# Result: ✅ Build successful

# Frontend Build
cd ..
npm run build
# Result: ✅ Build successful, assets in dist/
```

## Deployment Steps

### 1. Backend API Deployment (Azure Functions)

#### Prerequisites
- [ ] Azure subscription active
- [ ] Azure CLI installed and authenticated
- [ ] Service principal configured with appropriate permissions
- [ ] Environment variables configured in Azure Key Vault

#### Deployment Options

**Option A: Using Azure Pipelines**
1. Push changes to `main` branch
2. Azure Pipelines will automatically trigger
3. Monitor pipeline at: https://dev.azure.com/[your-org]/Limpopo-Connect/_build
4. Verify deployment completes successfully

**Option B: Manual Deployment via Azure CLI**
```bash
# Navigate to API directory
cd limpopo-api

# Install dependencies and build
npm install
npm run build

# Package the application
zip -r ../api-deployment.zip . -x "node_modules/*" "tests/*" ".git/*"

# Deploy to Azure Functions
az functionapp deployment source config-zip \
  -g limpopo-connect-rg \
  -n limpopo-connect-api \
  --src ../api-deployment.zip

# Verify deployment
az functionapp show -g limpopo-connect-rg -n limpopo-connect-api --query state
```

**Option C: Using GitHub Actions**
1. Ensure GitHub secrets are configured:
   - `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`
   - `AZURE_SUBSCRIPTION_ID`
2. Push to `main` branch
3. Monitor workflow at: https://github.com/Tshikwetamakole/Limpopo-Connect/actions
4. Verify deployment status

#### Post-Deployment API Verification
- [ ] Check function app is running: `az functionapp show -g limpopo-connect-rg -n limpopo-connect-api --query state`
- [ ] Verify API endpoints are accessible
- [ ] Check application logs for errors
- [ ] Test auth endpoints: `/api/auth/login`, `/api/auth/register`
- [ ] Test business endpoints: `/api/businesses`

### 2. Frontend Deployment (GitHub Pages)

The frontend is already configured for automatic deployment via GitHub Pages.

#### Verification
- [ ] Visit https://limpopoconnect.site
- [ ] Verify custom domain is working
- [ ] Check that all pages load correctly
- [ ] Verify PWA manifest and service worker

#### Manual Deployment (if needed)
```bash
# Build the frontend
npm install
npm run build

# The GitHub Pages workflow will automatically deploy from dist/ folder
# Or manually deploy using gh-pages
npm install -g gh-pages
gh-pages -d dist
```

### 3. Database Migration

#### Prerequisites
- [ ] PostgreSQL database provisioned
- [ ] Connection string available
- [ ] Backup of existing data (if updating production)

#### Migration Steps
```bash
cd limpopo-api

# Set database connection string
export DATABASE_URL="postgresql://user:password@host:5432/database"

# Run migrations in order
psql $DATABASE_URL -f migrations/002_extensions.sql
psql $DATABASE_URL -f migrations/001_init_schema.sql
psql $DATABASE_URL -f migrations/003_password_reset_tokens.sql

# Optional: Load sample data (development only)
psql $DATABASE_URL -f seeds/sample_data.sql

# Verify tables created
psql $DATABASE_URL -c "\dt"
```

### 4. Environment Configuration

#### Azure Function App Settings
Configure the following application settings:

```bash
# Database
DATABASE_URL=<connection-string>

# JWT
JWT_SECRET=<secret-key>
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Azure Storage
AZURE_STORAGE_ACCOUNT_NAME=<storage-account-name>
AZURE_STORAGE_ACCOUNT_KEY=<storage-account-key>
AzureWebJobsStorage=<connection-string>

# Key Vault (optional)
KEY_VAULT_URL=<key-vault-url>

# CORS (if needed)
ALLOWED_ORIGINS=https://limpopoconnect.site,http://localhost:5173
```

#### Set via Azure CLI
```bash
az functionapp config appsettings set \
  -g limpopo-connect-rg \
  -n limpopo-connect-api \
  --settings \
    "DATABASE_URL=<value>" \
    "JWT_SECRET=<value>" \
    "AZURE_STORAGE_ACCOUNT_NAME=<value>"
```

## Post-Deployment Verification

### Automated Tests
- [ ] Run API integration tests against production
- [ ] Verify all endpoints return expected responses
- [ ] Check authentication flow

### Manual Smoke Tests
Follow the [Smoke Test Guide](./SMOKE_TEST_GUIDE.md):

1. [ ] Login functionality
2. [ ] Registration functionality
3. [ ] Business listing
4. [ ] Business detail view
5. [ ] Business creation
6. [ ] Events functionality

### Performance Checks
- [ ] API response times < 1 second
- [ ] Frontend load time < 3 seconds
- [ ] Image loading optimized
- [ ] No console errors in browser

### Security Checks
- [ ] HTTPS enabled for all endpoints
- [ ] Authentication required for protected routes
- [ ] CORS configured correctly
- [ ] Secrets not exposed in client-side code
- [ ] SQL injection protection verified
- [ ] XSS protection verified (HTML sanitization)

## Monitoring and Logging

### Application Insights (if configured)
- [ ] Verify Application Insights is collecting data
- [ ] Set up alerts for errors and performance issues
- [ ] Create dashboard for key metrics

### Azure Monitor
- [ ] Check function app metrics
- [ ] Review execution logs
- [ ] Monitor resource utilization

### Log Analysis
```bash
# View recent logs
az functionapp log tail -g limpopo-connect-rg -n limpopo-connect-api

# Download logs for analysis
az webapp log download -g limpopo-connect-rg -n limpopo-connect-api
```

## Rollback Plan

If deployment fails or critical issues are discovered:

### Backend Rollback
```bash
# Restore previous deployment
az functionapp deployment source config-zip \
  -g limpopo-connect-rg \
  -n limpopo-connect-api \
  --src api-deployment-backup.zip

# Or rollback to previous slot (if staging slots configured)
az functionapp deployment slot swap \
  -g limpopo-connect-rg \
  -n limpopo-connect-api \
  --slot staging \
  --target-slot production
```

### Frontend Rollback
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# GitHub Pages will automatically redeploy
```

### Database Rollback
```bash
# Restore from backup
pg_restore -d $DATABASE_URL backup.sql

# Or run reverse migrations if available
```

## Deployment Completion

- [ ] All smoke tests passed
- [ ] Monitoring is active
- [ ] Team notified of deployment
- [ ] Documentation updated
- [ ] Release notes published

## Next Steps

1. Monitor application for 24-48 hours
2. Gather user feedback
3. Address any issues promptly
4. Plan next release

## Support Contacts

- **Technical Lead**: [Contact info]
- **DevOps Team**: [Contact info]
- **On-Call Engineer**: [Contact info]

## References

- [Azure Functions Documentation](https://docs.microsoft.com/en-us/azure/azure-functions/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Operational Runbook](./OPERATIONAL.md)
- [Smoke Test Guide](./SMOKE_TEST_GUIDE.md)
