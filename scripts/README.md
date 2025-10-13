# Scripts Directory - Limpopo Connect

This directory contains utility scripts for development, testing, and deployment validation.

---

## 🔧 Available Scripts

### Deployment & Validation

#### `validate-deployment.sh` ⭐
**Automated deployment validation and health check**

```bash
./scripts/validate-deployment.sh
```

**What it checks:**
- ✅ DNS resolution (root and www domains)
- ✅ HTTP/HTTPS connectivity
- ✅ SSL/TLS certificates
- ✅ Vercel deployment detection
- ✅ Build configuration files
- ✅ TypeScript configuration
- ✅ Dependencies installation
- ✅ Global DNS propagation

**Output:**
- Color-coded test results
- Pass/Warning/Fail summary
- Actionable recommendations
- DNS configuration guidance

**Example Output:**
```
Total Tests: 22
Passed: 21 ✅
Warnings: 1 ⚠️
Failed: 0 ❌

Status: Deployment is working with warnings
```

---

### Testing

#### `comprehensive-smoke-test.sh`
**Comprehensive automated smoke test for all 6 security fixes**

```bash
./scripts/comprehensive-smoke-test.sh
```

**Tests:**
- Prerequisites validation
- Fix #1: RLS Profile Exposure
- Fix #2: Room Access Control
- Fix #3: Password Validation
- Fix #4: Header Navigation
- Fix #5: Profile Page
- Fix #6: Vite Host Binding
- Documentation completeness
- Build & lint checks

---

### Supabase Setup

#### `setup-supabase.sh`
**Interactive Supabase configuration helper**

```bash
./scripts/setup-supabase.sh
```

**Features:**
- Validates `.env.local` configuration
- Tests Supabase connection
- Provides setup guidance
- Verifies API credentials

---

#### `validate-supabase.mjs`
**Node.js script to validate Supabase connectivity**

```bash
npm run validate:supabase
# Or directly:
node scripts/validate-supabase.mjs
```

**Checks:**
- Environment variables present
- Supabase client initialization
- Database connectivity
- API endpoint accessibility

---

## 📋 Usage Guide

### Quick Health Check

Run this before deploying or after making changes:

```bash
# Check deployment health
./scripts/validate-deployment.sh

# Run full smoke test
./scripts/comprehensive-smoke-test.sh
```

### Before Deployment

```bash
# 1. Validate local environment
npm run validate:supabase

# 2. Run smoke test
./scripts/comprehensive-smoke-test.sh

# 3. Validate deployment configuration
./scripts/validate-deployment.sh

# 4. Build for production
npm run build
```

### After Deployment

```bash
# Validate deployment is live
./scripts/validate-deployment.sh

# Should show:
# - All tests passing
# - DNS resolving correctly
# - HTTPS working
# - Vercel headers present
```

### Troubleshooting

```bash
# If deployment validation fails
./scripts/validate-deployment.sh > deployment-report.txt

# Review the report
cat deployment-report.txt

# Follow recommendations in output
# See DEPLOYMENT_TROUBLESHOOTING.md for detailed guidance
```

---

## 🛠️ Making Scripts Executable

If you get "Permission denied" errors:

```bash
# Make all scripts executable
chmod +x scripts/*.sh

# Or individually
chmod +x scripts/validate-deployment.sh
chmod +x scripts/comprehensive-smoke-test.sh
chmod +x scripts/setup-supabase.sh
```

---

## 📖 Related Documentation

- **[DEPLOYMENT_TROUBLESHOOTING.md](../DEPLOYMENT_TROUBLESHOOTING.md)** - Comprehensive deployment troubleshooting guide
- **[DEPLOYMENT_ISSUES_ANALYSIS.md](../DEPLOYMENT_ISSUES_ANALYSIS.md)** - Investigation findings and solutions
- **[VERCEL_DEPLOYMENT.md](../VERCEL_DEPLOYMENT.md)** - Vercel deployment guide
- **[VERCEL_CUSTOM_DOMAIN_SETUP.md](../VERCEL_CUSTOM_DOMAIN_SETUP.md)** - Custom domain configuration
- **[SUPABASE_SETUP_GUIDE.md](../SUPABASE_SETUP_GUIDE.md)** - Supabase setup instructions

---

## 🔍 Script Details

### validate-deployment.sh

**Purpose:** Automated deployment health checks

**Test Categories:**
1. DNS Resolution (root + www domains)
2. HTTP/HTTPS Connectivity
3. SSL/TLS Certificate Validation
4. Vercel Deployment Detection
5. Build Configuration Check
6. TypeScript Configuration
7. Dependencies Check
8. Global DNS Propagation

**Exit Codes:**
- `0` - All tests passed or warnings only
- `1` - One or more tests failed

**Requirements:**
- `nslookup` or `dig` (DNS queries)
- `curl` (HTTP requests)
- `openssl` (SSL checks)
- `grep`, `awk` (text processing)

### comprehensive-smoke-test.sh

**Purpose:** Validate all 6 security fixes and build configuration

**Test Categories:**
- File existence checks
- Migration file validation
- Component integration
- Configuration files
- Build process
- Lint checks

**Exit Codes:**
- `0` - All checks passed
- `1` - One or more checks failed

### setup-supabase.sh

**Purpose:** Interactive Supabase environment setup

**Features:**
- Validates `.env.local` file exists
- Checks environment variables are set
- Tests Supabase connection
- Provides next steps guidance

**Requirements:**
- `.env.local` file with Supabase credentials
- Node.js and npm installed
- `validate-supabase.mjs` script present

---

## 💡 Tips

### Automated CI/CD Integration

Add to GitHub Actions workflow:

```yaml
# .github/workflows/deploy.yml
- name: Validate Deployment
  run: |
    chmod +x scripts/validate-deployment.sh
    ./scripts/validate-deployment.sh
```

### Local Development

Add to `package.json` scripts:

```json
{
  "scripts": {
    "validate:deployment": "./scripts/validate-deployment.sh",
    "validate:supabase": "node scripts/validate-supabase.mjs",
    "test:smoke": "./scripts/comprehensive-smoke-test.sh"
  }
}
```

Then run:
```bash
npm run validate:deployment
npm run validate:supabase
npm run test:smoke
```

---

## 🐛 Common Issues

### "Permission denied" error

**Problem:** Script is not executable

**Solution:**
```bash
chmod +x scripts/validate-deployment.sh
```

### "Command not found: nslookup"

**Problem:** DNS tools not installed

**Solution:**
```bash
# Ubuntu/Debian
sudo apt-get install dnsutils

# macOS (should be pre-installed)
# Use 'dig' as alternative

# Windows (Git Bash)
# nslookup is usually available
```

### Script shows warnings but site works

**Problem:** Minor DNS optimization needed

**Solution:** This is normal. Site is functional. Review warnings and optionally optimize DNS configuration per recommendations.

---

## 📞 Support

For script issues or questions:

1. Review script output for recommendations
2. Check related documentation (links above)
3. Run with verbose output if available
4. Review DEPLOYMENT_TROUBLESHOOTING.md

---

**Last Updated:** October 13, 2025  
**Status:** ✅ All scripts operational
