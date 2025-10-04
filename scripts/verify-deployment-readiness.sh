#!/bin/bash

# Deployment Readiness Verification Script
# This script verifies that the application is ready for deployment

set -e

echo "=================================="
echo "Limpopo Connect - Deployment Readiness Check"
echo "=================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
OVERALL_STATUS=0

# Function to print success
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error
print_error() {
    echo -e "${RED}✗${NC} $1"
    OVERALL_STATUS=1
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Function to print section header
print_section() {
    echo ""
    echo "=================================="
    echo "$1"
    echo "=================================="
}

# 1. Check Backend Tests
print_section "1. Backend API Tests"
cd limpopo-api
if npm test 2>&1 | grep -q "Tests:.*passed"; then
    TEST_RESULTS=$(npm test 2>&1 | grep "Tests:" | tail -1)
    print_success "Backend tests passed: $TEST_RESULTS"
else
    print_error "Backend tests failed"
fi
cd ..

# 2. Check Backend Build
print_section "2. Backend Build"
cd limpopo-api
if npm run build 2>&1; then
    print_success "Backend build successful"
else
    print_error "Backend build failed"
fi
cd ..

# 3. Check Frontend Build
print_section "3. Frontend Build"
if npm run build 2>&1 | grep -q "built in"; then
    BUILD_INFO=$(npm run build 2>&1 | grep "built in" | tail -1)
    print_success "Frontend build successful: $BUILD_INFO"
else
    print_error "Frontend build failed"
fi

# 4. Verify Critical Files Exist
print_section "4. Critical Files Verification"

CRITICAL_FILES=(
    "limpopo-api/src/functions/authLogin.ts"
    "limpopo-api/src/functions/authRegister.ts"
    "limpopo-api/src/functions/businessesCreate.ts"
    "limpopo-api/src/functions/businessesList.ts"
    "limpopo-api/src/functions/businessesGet.ts"
    "limpopo-api/src/lib/auth.ts"
    "limpopo-api/src/lib/db.ts"
    "limpopo-api/src/lib/validation.ts"
    "limpopo-api/migrations/001_init_schema.sql"
    "limpopo-api/migrations/002_extensions.sql"
    "dist/index.html"
    "package.json"
    "DEPLOYMENT_CHECKLIST.md"
    "SMOKE_TEST_GUIDE.md"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "Found: $file"
    else
        print_error "Missing: $file"
    fi
done

# 5. Check Environment Variables Documentation
print_section "5. Environment Configuration"

if [ -f "limpopo-api/.env.example" ]; then
    print_success "Environment template exists (.env.example)"
    echo ""
    echo "Required environment variables:"
    cat limpopo-api/.env.example | grep -v "^#" | grep "=" | cut -d'=' -f1 | while read var; do
        echo "  - $var"
    done
else
    print_warning "No .env.example found - ensure environment variables are documented"
fi

# 6. Verify API Endpoints
print_section "6. API Endpoints Verification"

API_FUNCTIONS=$(ls limpopo-api/src/functions/*.ts 2>/dev/null | wc -l)
if [ $API_FUNCTIONS -gt 0 ]; then
    print_success "Found $API_FUNCTIONS API function implementations"
    echo ""
    echo "Implemented endpoints:"
    ls limpopo-api/src/functions/*.ts | xargs -n1 basename | sed 's/.ts$//' | while read func; do
        echo "  - $func"
    done
else
    print_error "No API functions found"
fi

# 7. Check Database Migrations
print_section "7. Database Migrations"

MIGRATIONS=$(ls limpopo-api/migrations/*.sql 2>/dev/null | wc -l)
if [ $MIGRATIONS -gt 0 ]; then
    print_success "Found $MIGRATIONS migration files"
    ls limpopo-api/migrations/*.sql | xargs -n1 basename | while read migration; do
        echo "  - $migration"
    done
else
    print_error "No migration files found"
fi

# 8. Check Package Dependencies
print_section "8. Dependencies Status"

cd limpopo-api
if npm list --depth=0 2>&1 | grep -q "extraneous"; then
    print_warning "Backend has extraneous dependencies"
else
    print_success "Backend dependencies are clean"
fi
cd ..

if npm list --depth=0 2>&1 | grep -q "extraneous"; then
    print_warning "Frontend has extraneous dependencies"
else
    print_success "Frontend dependencies are clean"
fi

# 9. Verify Git Status
print_section "9. Git Repository Status"

if git status | grep -q "nothing to commit"; then
    print_success "Working directory is clean"
else
    print_warning "Working directory has uncommitted changes"
    git status --short
fi

# 10. Summary
print_section "Summary"

if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Application is ready for deployment.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review DEPLOYMENT_CHECKLIST.md"
    echo "2. Configure environment variables in Azure"
    echo "3. Deploy backend to Azure Functions"
    echo "4. Deploy frontend to GitHub Pages"
    echo "5. Run smoke tests using SMOKE_TEST_GUIDE.md"
else
    echo -e "${RED}✗ Some checks failed. Please fix the issues before deploying.${NC}"
    exit 1
fi

echo ""
echo "=================================="
echo "Readiness check complete!"
echo "=================================="
