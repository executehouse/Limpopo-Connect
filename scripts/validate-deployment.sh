#!/bin/bash

# ============================================
# DNS & DEPLOYMENT VALIDATION SCRIPT
# Limpopo Connect - limpopoconnect.site
# ============================================

echo "🔍 Limpopo Connect - DNS & Deployment Validation"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNING_TESTS=0

# Helper functions
pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((TOTAL_TESTS++))
    ((PASSED_TESTS++))
}

fail() {
    echo -e "${RED}✗${NC} $1"
    ((TOTAL_TESTS++))
    ((FAILED_TESTS++))
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((TOTAL_TESTS++))
    ((WARNING_TESTS++))
}

info() {
    echo -e "ℹ $1"
}

section() {
    echo ""
    echo "─────────────────────────────────────────────────"
    echo "$1"
    echo "─────────────────────────────────────────────────"
}

# ============================================
# TEST 1: Check DNS Resolution
# ============================================
section "TEST 1: DNS Resolution"

# Test root domain
ROOT_DNS=$(nslookup limpopoconnect.site 2>/dev/null | grep -A 1 "Name:" | grep "Address:" | awk '{print $2}' | tail -1)
if [ -n "$ROOT_DNS" ]; then
    info "Root domain resolves to: $ROOT_DNS"
    
    if [ "$ROOT_DNS" = "76.76.21.21" ]; then
        pass "Root domain points to correct Vercel IP (76.76.21.21)"
    else
        warn "Root domain points to $ROOT_DNS (expected: 76.76.21.21)"
        info "   → Update A record at your domain registrar to 76.76.21.21"
    fi
else
    fail "Root domain (limpopoconnect.site) does not resolve"
    info "   → Configure DNS A record at your domain registrar"
fi

# Test www subdomain
WWW_DNS=$(nslookup www.limpopoconnect.site 2>/dev/null | grep -A 1 "Name:" | grep "Address:" | awk '{print $2}' | tail -1)
if [ -n "$WWW_DNS" ]; then
    pass "WWW subdomain resolves to: $WWW_DNS"
else
    fail "WWW subdomain (www.limpopoconnect.site) does not resolve"
fi

# Check CNAME for www
WWW_CNAME=$(nslookup -query=CNAME www.limpopoconnect.site 2>/dev/null | grep "canonical name" | awk '{print $NF}')
if [[ "$WWW_CNAME" == *"vercel"* ]]; then
    pass "WWW subdomain CNAME points to Vercel: $WWW_CNAME"
else
    warn "WWW subdomain CNAME: $WWW_CNAME"
fi

# ============================================
# TEST 2: HTTP/HTTPS Connectivity
# ============================================
section "TEST 2: HTTP/HTTPS Connectivity"

# Test root domain
ROOT_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://limpopoconnect.site --max-time 10 2>/dev/null)
if [ "$ROOT_HTTP" = "200" ] || [ "$ROOT_HTTP" = "307" ] || [ "$ROOT_HTTP" = "301" ]; then
    pass "Root domain HTTPS responds: $ROOT_HTTP"
else
    fail "Root domain HTTPS failed: $ROOT_HTTP"
fi

# Test www subdomain
WWW_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://www.limpopoconnect.site --max-time 10 2>/dev/null)
if [ "$WWW_HTTP" = "200" ]; then
    pass "WWW subdomain HTTPS responds: 200 OK"
else
    fail "WWW subdomain HTTPS failed: $WWW_HTTP"
fi

# Check if root redirects to www
if [ "$ROOT_HTTP" = "307" ] || [ "$ROOT_HTTP" = "301" ]; then
    info "Root domain redirects to WWW (this is normal if www is primary)"
fi

# ============================================
# TEST 3: SSL Certificate
# ============================================
section "TEST 3: SSL/TLS Certificate"

# Check SSL certificate for root domain
ROOT_SSL=$(echo | timeout 5 openssl s_client -servername limpopoconnect.site -connect limpopoconnect.site:443 2>/dev/null | grep "Verify return code" | awk -F: '{print $2}' | xargs)
if [[ "$ROOT_SSL" == *"0 (ok)"* ]] || [[ "$ROOT_SSL" == "0 (ok)" ]]; then
    pass "Root domain SSL certificate is valid"
else
    warn "Root domain SSL: $ROOT_SSL"
fi

# Check SSL certificate for www
WWW_SSL=$(echo | timeout 5 openssl s_client -servername www.limpopoconnect.site -connect www.limpopoconnect.site:443 2>/dev/null | grep "Verify return code" | awk -F: '{print $2}' | xargs)
if [[ "$WWW_SSL" == *"0 (ok)"* ]] || [[ "$WWW_SSL" == "0 (ok)" ]]; then
    pass "WWW subdomain SSL certificate is valid"
else
    warn "WWW subdomain SSL: $WWW_SSL"
fi

# ============================================
# TEST 4: Vercel Headers
# ============================================
section "TEST 4: Vercel Deployment Detection"

# Check for Vercel headers
VERCEL_HEADER=$(curl -s -I https://www.limpopoconnect.site 2>/dev/null | grep -i "server:" | grep -i "vercel")
if [ -n "$VERCEL_HEADER" ]; then
    pass "Vercel server headers detected"
else
    warn "Vercel headers not found (deployment may not be active)"
fi

# Check for x-vercel-id header
VERCEL_ID=$(curl -s -I https://www.limpopoconnect.site 2>/dev/null | grep -i "x-vercel-id")
if [ -n "$VERCEL_ID" ]; then
    info "Vercel deployment ID detected: $(echo $VERCEL_ID | awk '{print $2}')"
    pass "Site is deployed on Vercel"
else
    warn "No Vercel deployment ID found"
fi

# ============================================
# TEST 5: Build Configuration
# ============================================
section "TEST 5: Local Build Configuration"

# Check if package.json exists
if [ -f "package.json" ]; then
    pass "package.json found"
else
    fail "package.json not found"
fi

# Check if vite.config.ts exists
if [ -f "vite.config.ts" ]; then
    pass "vite.config.ts found"
else
    fail "vite.config.ts not found"
fi

# Check if vercel.json exists
if [ -f "vercel.json" ]; then
    pass "vercel.json found"
else
    warn "vercel.json not found (using Vercel defaults)"
fi

# Check if dist directory exists
if [ -d "dist" ]; then
    pass "dist directory exists (previous build found)"
    FILE_COUNT=$(find dist -type f | wc -l)
    info "Build output contains $FILE_COUNT files"
else
    warn "dist directory not found (run 'npm run build')"
fi

# ============================================
# TEST 6: TypeScript Configuration
# ============================================
section "TEST 6: TypeScript Configuration"

# Check tsconfig files
if [ -f "tsconfig.json" ]; then
    pass "tsconfig.json found"
else
    fail "tsconfig.json not found"
fi

if [ -f "tsconfig.app.json" ]; then
    pass "tsconfig.app.json found"
else
    warn "tsconfig.app.json not found"
fi

if [ -f "tsconfig.node.json" ]; then
    pass "tsconfig.node.json found"
    
    # Check if types are configured
    if grep -q '"types".*\[.*"node"' tsconfig.node.json 2>/dev/null; then
        pass "tsconfig.node.json includes Node.js types"
    else
        warn "tsconfig.node.json may be missing Node.js types"
        info "   → Update types array to include 'node', 'vite/client', 'vitest'"
    fi
else
    warn "tsconfig.node.json not found"
fi

# ============================================
# TEST 7: Node Modules
# ============================================
section "TEST 7: Dependencies"

if [ -d "node_modules" ]; then
    pass "node_modules directory exists"
    
    # Check for critical dependencies
    if [ -d "node_modules/vite" ]; then
        pass "Vite installed"
    else
        fail "Vite not installed"
    fi
    
    if [ -d "node_modules/react" ]; then
        pass "React installed"
    else
        fail "React not installed"
    fi
    
    if [ -d "node_modules/@types/node" ]; then
        pass "@types/node installed"
    else
        warn "@types/node not installed"
    fi
else
    warn "node_modules not found (run 'npm install')"
fi

# ============================================
# TEST 8: DNS Propagation Check
# ============================================
section "TEST 8: Global DNS Propagation"

info "Checking DNS propagation across multiple servers..."

# Check against Google DNS
GOOGLE_DNS=$(dig @8.8.8.8 limpopoconnect.site +short 2>/dev/null | tail -1)
if [ -n "$GOOGLE_DNS" ]; then
    info "Google DNS (8.8.8.8): $GOOGLE_DNS"
else
    warn "Cannot query Google DNS"
fi

# Check against Cloudflare DNS
CLOUDFLARE_DNS=$(dig @1.1.1.1 limpopoconnect.site +short 2>/dev/null | tail -1)
if [ -n "$CLOUDFLARE_DNS" ]; then
    info "Cloudflare DNS (1.1.1.1): $CLOUDFLARE_DNS"
else
    warn "Cannot query Cloudflare DNS"
fi

# Check consistency
if [ "$GOOGLE_DNS" = "$CLOUDFLARE_DNS" ] && [ -n "$GOOGLE_DNS" ]; then
    pass "DNS is consistent across multiple servers"
else
    warn "DNS may still be propagating (inconsistent responses)"
fi

# ============================================
# SUMMARY
# ============================================
section "VALIDATION SUMMARY"

echo ""
echo "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${YELLOW}Warnings: $WARNING_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"
echo ""

# Overall status
if [ $FAILED_TESTS -eq 0 ] && [ $WARNING_TESTS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Deployment is healthy.${NC}"
    exit 0
elif [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Deployment is working with warnings.${NC}"
    echo "Review warnings above for optimization opportunities."
    exit 0
else
    echo -e "${RED}✗ Deployment has issues that need attention.${NC}"
    echo "Review failed tests above and consult DEPLOYMENT_TROUBLESHOOTING.md"
    exit 1
fi

# ============================================
# RECOMMENDATIONS
# ============================================
echo ""
echo "📋 Recommendations:"
echo ""

if [ "$ROOT_DNS" != "76.76.21.21" ] && [ -n "$ROOT_DNS" ]; then
    echo "1. Update DNS A record for limpopoconnect.site to 76.76.21.21"
fi

if [ ! -d "dist" ]; then
    echo "2. Run 'npm run build' to create production build"
fi

if [ ! -d "node_modules" ]; then
    echo "3. Run 'npm install' to install dependencies"
fi

echo ""
echo "For detailed troubleshooting, see: DEPLOYMENT_TROUBLESHOOTING.md"
echo ""
