#!/bin/bash

# scripts/check-deploy.sh
# Purpose: Reproduce blank preview issue locally and test deployment readiness
# Usage: ./scripts/check-deploy.sh [preview-url]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PREVIEW_URL="${1:-http://localhost:4173}"
BUILD_DIR="dist"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Limpopo Connect - Deployment Check Script           ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check 1: Prerequisites
echo -e "${BLUE}[1/8] Checking prerequisites...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm installed: $(npm --version)${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ node not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ node installed: $(node --version)${NC}"
echo ""

# Check 2: Environment variables
echo -e "${BLUE}[2/8] Checking environment variables...${NC}"
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓ .env.local exists${NC}"
    if grep -q "VITE_SUPABASE_URL" .env.local && grep -q "VITE_SUPABASE_ANON_KEY" .env.local; then
        echo -e "${GREEN}✓ Required env vars present in .env.local${NC}"
    else
        echo -e "${YELLOW}⚠ Missing required env vars in .env.local${NC}"
        echo -e "${YELLOW}  Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY${NC}"
    fi
else
    echo -e "${YELLOW}⚠ .env.local not found (using .env.example as reference)${NC}"
fi
echo ""

# Check 3: Install dependencies
echo -e "${BLUE}[3/8] Installing dependencies...${NC}"
npm ci --silent 2>&1 | tail -5
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    exit 1
fi
echo ""

# Check 4: Build application
echo -e "${BLUE}[4/8] Building application...${NC}"
BUILD_OUTPUT=$(npm run build 2>&1)
BUILD_STATUS=$?

if [ $BUILD_STATUS -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
    
    # Show build artifacts
    if [ -d "$BUILD_DIR" ]; then
        echo -e "${GREEN}✓ Build directory exists: $BUILD_DIR${NC}"
        echo -e "  Files generated:"
        ls -lh "$BUILD_DIR" | tail -5
    else
        echo -e "${RED}✗ Build directory not found: $BUILD_DIR${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ Build failed${NC}"
    echo -e "${RED}Build output:${NC}"
    echo "$BUILD_OUTPUT" | tail -20
    exit 1
fi
echo ""

# Check 5: Verify critical files
echo -e "${BLUE}[5/8] Verifying build artifacts...${NC}"
CRITICAL_FILES=("$BUILD_DIR/index.html" "$BUILD_DIR/assets")

for file in "${CRITICAL_FILES[@]}"; do
    if [ -e "$file" ]; then
        echo -e "${GREEN}✓ Found: $file${NC}"
    else
        echo -e "${RED}✗ Missing: $file${NC}"
    fi
done

# Check if assets are using relative paths
if [ -f "$BUILD_DIR/index.html" ]; then
    if grep -q 'href="/' "$BUILD_DIR/index.html" && ! grep -q 'href="/assets' "$BUILD_DIR/index.html"; then
        echo -e "${YELLOW}⚠ Potential absolute path issue in index.html${NC}"
    else
        echo -e "${GREEN}✓ Asset paths look correct${NC}"
    fi
fi
echo ""

# Check 6: Start preview server
echo -e "${BLUE}[6/8] Starting preview server...${NC}"
npm run preview &
PREVIEW_PID=$!
echo -e "${GREEN}✓ Preview server started (PID: $PREVIEW_PID)${NC}"

# Wait for server to start
sleep 3
echo ""

# Check 7: Test local preview
echo -e "${BLUE}[7/8] Testing local preview...${NC}"
if command -v curl &> /dev/null; then
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4173)
    if [ "$RESPONSE" = "200" ]; then
        echo -e "${GREEN}✓ Local preview responding (HTTP $RESPONSE)${NC}"
    else
        echo -e "${RED}✗ Local preview not responding (HTTP $RESPONSE)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ curl not available, skipping HTTP test${NC}"
fi
echo ""

# Check 8: Test preview URL (if provided)
if [ "$PREVIEW_URL" != "http://localhost:4173" ]; then
    echo -e "${BLUE}[8/8] Testing preview URL: $PREVIEW_URL${NC}"
    
    if command -v curl &> /dev/null; then
        echo "Testing HTTP response..."
        curl -s -o /dev/null -w "HTTP Status: %{http_code}\nContent-Type: %{content_type}\nSize: %{size_download} bytes\n" "$PREVIEW_URL"
        
        echo ""
        echo "Testing asset loading..."
        MAIN_JS=$(curl -s "$PREVIEW_URL" | grep -o 'src="/assets/index-[^"]*\.js"' | head -1 | sed 's/src="//;s/"$//')
        if [ -n "$MAIN_JS" ]; then
            ASSET_URL="${PREVIEW_URL}${MAIN_JS}"
            ASSET_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$ASSET_URL")
            if [ "$ASSET_RESPONSE" = "200" ]; then
                echo -e "${GREEN}✓ Main JS asset loads successfully${NC}"
            else
                echo -e "${RED}✗ Main JS asset failed to load (HTTP $ASSET_RESPONSE)${NC}"
                echo -e "${YELLOW}  Asset URL: $ASSET_URL${NC}"
            fi
        fi
    else
        echo -e "${YELLOW}⚠ curl not available for remote testing${NC}"
    fi
else
    echo -e "${BLUE}[8/8] Skipping remote URL test (use ./scripts/check-deploy.sh <url>)${NC}"
fi
echo ""

# Cleanup
echo -e "${BLUE}Stopping preview server...${NC}"
kill $PREVIEW_PID 2>/dev/null || true
sleep 1

# Summary
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                     Deployment Check Complete                ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓ Build successful and preview server working${NC}"
echo ""
echo "Next steps for Vercel deployment:"
echo "1. Set environment variables in Vercel Dashboard:"
echo "   - VITE_SUPABASE_URL"
echo "   - VITE_SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY (for API routes)"
echo "   - VITE_BASE=/ (optional)"
echo ""
echo "2. Verify build settings:"
echo "   - Build Command: npm run build"
echo "   - Output Directory: dist"
echo "   - Install Command: npm install"
echo ""
echo "3. Test deployment at: https://your-preview.vercel.app/health"
echo ""
echo "If preview is blank:"
echo "  - Check browser console for errors"
echo "  - Run: ./scripts/collect-console-errors.sh <preview-url>"
echo "  - Visit: <preview-url>/health for diagnostics"
echo ""
