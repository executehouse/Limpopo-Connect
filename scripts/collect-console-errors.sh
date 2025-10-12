#!/bin/bash

# scripts/collect-console-errors.sh
# Purpose: Collect browser console logs and runtime errors from deployment
# Usage: ./scripts/collect-console-errors.sh [preview-url]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PREVIEW_URL="${1:-https://limpopoconnect.site}"
OUTPUT_FILE="deployment-errors-$(date +%Y%m%d-%H%M%S).log"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      Console Error Collection - Deployment Diagnostics       ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Target URL:${NC} $PREVIEW_URL"
echo -e "${BLUE}Output file:${NC} $OUTPUT_FILE"
echo ""

# Function to test with curl
test_with_curl() {
    echo -e "${BLUE}[1/4] Testing HTTP Response...${NC}"
    
    RESPONSE=$(curl -s -o /tmp/response.html -w "%{http_code}|%{content_type}|%{size_download}" "$PREVIEW_URL")
    HTTP_CODE=$(echo "$RESPONSE" | cut -d'|' -f1)
    CONTENT_TYPE=$(echo "$RESPONSE" | cut -d'|' -f2)
    SIZE=$(echo "$RESPONSE" | cut -d'|' -f3)
    
    echo "HTTP Status: $HTTP_CODE" | tee -a "$OUTPUT_FILE"
    echo "Content-Type: $CONTENT_TYPE" | tee -a "$OUTPUT_FILE"
    echo "Response Size: $SIZE bytes" | tee -a "$OUTPUT_FILE"
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓ Server responding with 200 OK${NC}"
    else
        echo -e "${RED}✗ Server returned HTTP $HTTP_CODE${NC}"
    fi
    
    # Check if HTML was returned
    if [[ "$CONTENT_TYPE" == *"text/html"* ]]; then
        echo -e "${GREEN}✓ HTML content received${NC}"
    else
        echo -e "${RED}✗ Unexpected content type: $CONTENT_TYPE${NC}"
    fi
    
    # Check response size
    if [ "$SIZE" -lt 100 ]; then
        echo -e "${YELLOW}⚠ Response size very small ($SIZE bytes) - might be blank page${NC}"
    fi
    
    echo "" | tee -a "$OUTPUT_FILE"
}

# Function to check for common issues in HTML
check_html_issues() {
    echo -e "${BLUE}[2/4] Analyzing HTML Response...${NC}"
    
    if [ ! -f /tmp/response.html ]; then
        echo -e "${RED}✗ No response file to analyze${NC}"
        return
    fi
    
    echo "HTML Analysis:" | tee -a "$OUTPUT_FILE"
    echo "=============" | tee -a "$OUTPUT_FILE"
    
    # Check for error messages in HTML
    if grep -qi "error" /tmp/response.html; then
        echo -e "${YELLOW}⚠ Found 'error' text in HTML${NC}" | tee -a "$OUTPUT_FILE"
        grep -i "error" /tmp/response.html | head -5 | tee -a "$OUTPUT_FILE"
    fi
    
    # Check for script tags
    SCRIPT_COUNT=$(grep -c "<script" /tmp/response.html || echo "0")
    echo "Script tags found: $SCRIPT_COUNT" | tee -a "$OUTPUT_FILE"
    
    if [ "$SCRIPT_COUNT" -eq 0 ]; then
        echo -e "${RED}✗ No script tags found - JavaScript not loading${NC}"
    else
        echo -e "${GREEN}✓ Script tags present${NC}"
        
        # Extract script sources
        echo "Script sources:" | tee -a "$OUTPUT_FILE"
        grep -o 'src="[^"]*"' /tmp/response.html | grep "\.js" | head -5 | tee -a "$OUTPUT_FILE"
    fi
    
    # Check for CSS
    CSS_COUNT=$(grep -c "<link.*stylesheet" /tmp/response.html || echo "0")
    echo "CSS links found: $CSS_COUNT" | tee -a "$OUTPUT_FILE"
    
    # Check for root div
    if grep -q 'id="root"' /tmp/response.html; then
        echo -e "${GREEN}✓ Found React root div${NC}"
    else
        echo -e "${RED}✗ React root div not found${NC}"
    fi
    
    echo "" | tee -a "$OUTPUT_FILE"
}

# Function to check asset loading
check_assets() {
    echo -e "${BLUE}[3/4] Testing Asset Loading...${NC}"
    
    if [ ! -f /tmp/response.html ]; then
        return
    fi
    
    # Extract first JS file
    MAIN_JS=$(grep -o 'src="/[^"]*\.js"' /tmp/response.html | head -1 | sed 's/src="//;s/"$//')
    
    if [ -n "$MAIN_JS" ]; then
        ASSET_URL="${PREVIEW_URL}${MAIN_JS}"
        echo "Testing main JS: $ASSET_URL" | tee -a "$OUTPUT_FILE"
        
        JS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$ASSET_URL")
        if [ "$JS_RESPONSE" = "200" ]; then
            echo -e "${GREEN}✓ Main JS loads (HTTP $JS_RESPONSE)${NC}"
        else
            echo -e "${RED}✗ Main JS failed (HTTP $JS_RESPONSE)${NC}" | tee -a "$OUTPUT_FILE"
            echo "This is likely the cause of blank preview!" | tee -a "$OUTPUT_FILE"
        fi
    else
        echo -e "${YELLOW}⚠ Could not find JS asset path in HTML${NC}"
    fi
    
    # Extract first CSS file
    MAIN_CSS=$(grep -o 'href="/[^"]*\.css"' /tmp/response.html | head -1 | sed 's/href="//;s/"$//')
    
    if [ -n "$MAIN_CSS" ]; then
        CSS_URL="${PREVIEW_URL}${MAIN_CSS}"
        echo "Testing main CSS: $CSS_URL" | tee -a "$OUTPUT_FILE"
        
        CSS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$CSS_URL")
        if [ "$CSS_RESPONSE" = "200" ]; then
            echo -e "${GREEN}✓ Main CSS loads (HTTP $CSS_RESPONSE)${NC}"
        else
            echo -e "${RED}✗ Main CSS failed (HTTP $CSS_RESPONSE)${NC}" | tee -a "$OUTPUT_FILE"
        fi
    fi
    
    echo "" | tee -a "$OUTPUT_FILE"
}

# Function to provide instructions for browser testing
browser_testing_instructions() {
    echo -e "${BLUE}[4/4] Manual Browser Testing Instructions...${NC}"
    
    cat << 'EOF' | tee -a "$OUTPUT_FILE"

To capture browser console errors:
===================================

1. Open browser DevTools (F12 or Right-click → Inspect)
2. Go to Console tab
3. Visit the preview URL
4. Look for red error messages
5. Copy any errors related to:
   - Failed to load module
   - Cannot find module
   - Uncaught ReferenceError
   - Network errors (404, 403)

Common Issues and Solutions:
============================

Issue: 404 on assets (/assets/index-*.js)
Fix: Check VITE_BASE environment variable (should be '/')
     Verify vercel.json has correct rewrites

Issue: "Uncaught ReferenceError: process is not defined"
Fix: Environment variable not properly prefixed with VITE_
     Check .env and Vercel settings

Issue: "Failed to load module"
Fix: Check if build output directory is 'dist'
     Verify Vercel output directory setting

Issue: Blank white page, no errors
Fix: Check if index.html has <div id="root"></div>
     Verify React is properly mounting

Issue: CORS errors
Fix: Check Supabase project CORS settings
     Verify VITE_SUPABASE_URL is correct

Playwright/Puppeteer Capture (Advanced):
=========================================

# Install playwright (commented - uncomment to use)
# npm install -D playwright

# Create capture script (example - requires adaptation):
# const { chromium } = require('playwright');
# 
# (async () => {
#   const browser = await chromium.launch();
#   const page = await browser.newPage();
#   
#   page.on('console', msg => console.log('CONSOLE:', msg.text()));
#   page.on('pageerror', err => console.error('ERROR:', err.message));
#   
#   await page.goto('PREVIEW_URL');
#   await page.waitForTimeout(5000);
#   await page.screenshot({ path: 'preview.png' });
#   
#   await browser.close();
# })();

Health Check Endpoint:
======================

Visit: PREVIEW_URL/health

This will show:
- Environment variable status
- Supabase connection status  
- React build status
- Routing configuration

If /health shows content, the app is loading!
If /health is also blank, it's a fundamental build/routing issue.

EOF
    
    echo ""
}

# Main execution
echo "Starting diagnostic collection..." | tee "$OUTPUT_FILE"
echo "Timestamp: $(date)" | tee -a "$OUTPUT_FILE"
echo "" | tee -a "$OUTPUT_FILE"

test_with_curl
check_html_issues
check_assets
browser_testing_instructions

# Summary
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                  Diagnostics Complete                        ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓ Logs saved to: $OUTPUT_FILE${NC}"
echo ""
echo "Recommended next steps:"
echo "1. Review $OUTPUT_FILE for specific errors"
echo "2. Visit $PREVIEW_URL/health for live diagnostics"
echo "3. Check browser console at $PREVIEW_URL"
echo "4. Verify Vercel environment variables"
echo "5. Check Vercel deployment logs for build errors"
echo ""

# Cleanup
rm -f /tmp/response.html
