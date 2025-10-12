#!/bin/bash
#
# Supabase Smoke Tests Script
# Purpose: Basic curl tests for Supabase authentication and API endpoints
# 
# Prerequisites:
# - Set environment variables (see below)
# - Have curl and jq installed (jq is optional for pretty JSON output)
#
# TODO: Before running, set these environment variables:
#   export SUPABASE_URL="https://sscsjwaogomktxqhvgxw.supabase.co"
#   export SUPABASE_ANON_KEY="your-anon-key-here"
#   export TEST_EMAIL="test-$(date +%s)@example.com"
#   export TEST_PASSWORD="TestPassword123!"
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if jq is available for pretty JSON
if command -v jq &> /dev/null; then
  PRETTY_JSON="jq"
else
  PRETTY_JSON="cat"
  echo -e "${YELLOW}⚠️  jq not installed. Install for pretty JSON output: brew install jq or apt-get install jq${NC}"
fi

# Function to print section headers
print_header() {
  echo ""
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}"
}

# Function to print test results
print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

print_info() {
  echo -e "${YELLOW}ℹ${NC} $1"
}

# ============================================
# CONFIGURATION VALIDATION
# ============================================

print_header "Configuration Validation"

# TODO: Set these variables before running!
if [ -z "$SUPABASE_URL" ]; then
  print_error "SUPABASE_URL not set"
  echo "TODO: Run: export SUPABASE_URL=\"https://sscsjwaogomktxqhvgxw.supabase.co\""
  exit 1
fi
print_success "SUPABASE_URL: $SUPABASE_URL"

if [ -z "$SUPABASE_ANON_KEY" ]; then
  print_error "SUPABASE_ANON_KEY not set"
  echo "TODO: Run: export SUPABASE_ANON_KEY=\"your-anon-key-from-supabase-dashboard\""
  exit 1
fi
print_success "SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY:0:20}..."

if [ -z "$TEST_EMAIL" ]; then
  TEST_EMAIL="test-$(date +%s)@example.com"
  print_info "TEST_EMAIL not set, using: $TEST_EMAIL"
else
  print_success "TEST_EMAIL: $TEST_EMAIL"
fi

if [ -z "$TEST_PASSWORD" ]; then
  TEST_PASSWORD="TestPassword123!"
  print_info "TEST_PASSWORD not set, using default"
else
  print_success "TEST_PASSWORD: ********"
fi

# ============================================
# TEST 1: Supabase Health Check
# ============================================

print_header "Test 1: Supabase API Health Check"

HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" \
  "${SUPABASE_URL}/rest/v1/" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json")

HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 404 ]; then
  print_success "Supabase API reachable (HTTP $HTTP_CODE)"
else
  print_error "Supabase API unreachable (HTTP $HTTP_CODE)"
  echo "$RESPONSE_BODY" | $PRETTY_JSON
  exit 1
fi

# ============================================
# TEST 2: Sign Up
# ============================================

print_header "Test 2: User Sign Up"

SIGNUP_RESPONSE=$(curl -s -w "\n%{http_code}" \
  "${SUPABASE_URL}/auth/v1/signup" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\"
  }")

HTTP_CODE=$(echo "$SIGNUP_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$SIGNUP_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" -eq 200 ]; then
  print_success "Sign up successful (HTTP $HTTP_CODE)"
  ACCESS_TOKEN=$(echo "$RESPONSE_BODY" | jq -r '.access_token // empty')
  USER_ID=$(echo "$RESPONSE_BODY" | jq -r '.user.id // empty')
  
  if [ -n "$ACCESS_TOKEN" ]; then
    print_success "Access token received: ${ACCESS_TOKEN:0:20}..."
    print_success "User ID: $USER_ID"
  else
    print_info "Sign up succeeded but email confirmation may be required"
    echo "$RESPONSE_BODY" | $PRETTY_JSON
  fi
else
  print_error "Sign up failed (HTTP $HTTP_CODE)"
  echo "$RESPONSE_BODY" | $PRETTY_JSON
  # Continue tests even if signup fails (user might already exist)
fi

# ============================================
# TEST 3: Sign In
# ============================================

print_header "Test 3: User Sign In"

SIGNIN_RESPONSE=$(curl -s -w "\n%{http_code}" \
  "${SUPABASE_URL}/auth/v1/token?grant_type=password" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\"
  }")

HTTP_CODE=$(echo "$SIGNIN_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$SIGNIN_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" -eq 200 ]; then
  print_success "Sign in successful (HTTP $HTTP_CODE)"
  ACCESS_TOKEN=$(echo "$RESPONSE_BODY" | jq -r '.access_token')
  REFRESH_TOKEN=$(echo "$RESPONSE_BODY" | jq -r '.refresh_token')
  print_success "Access token: ${ACCESS_TOKEN:0:20}..."
else
  print_error "Sign in failed (HTTP $HTTP_CODE)"
  echo "$RESPONSE_BODY" | $PRETTY_JSON
  print_info "If email confirmation is required, check your email and confirm before running tests"
fi

# ============================================
# TEST 4: Fetch User Profile (if signed in)
# ============================================

if [ -n "$ACCESS_TOKEN" ] && [ "$ACCESS_TOKEN" != "null" ]; then
  print_header "Test 4: Fetch User Profile"

  PROFILE_RESPONSE=$(curl -s -w "\n%{http_code}" \
    "${SUPABASE_URL}/rest/v1/profiles?select=*" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json")

  HTTP_CODE=$(echo "$PROFILE_RESPONSE" | tail -n 1)
  RESPONSE_BODY=$(echo "$PROFILE_RESPONSE" | head -n -1)

  if [ "$HTTP_CODE" -eq 200 ]; then
    print_success "Profile fetch successful (HTTP $HTTP_CODE)"
    echo "$RESPONSE_BODY" | $PRETTY_JSON
  else
    print_error "Profile fetch failed (HTTP $HTTP_CODE)"
    echo "$RESPONSE_BODY" | $PRETTY_JSON
  fi
fi

# ============================================
# TEST 5: Test Signed URL Endpoint (Optional)
# ============================================

print_header "Test 5: Signed URL API Endpoint"

# TODO: This test requires the Vercel API route to be deployed
# Uncomment after deploying to test

# SIGNED_URL_RESPONSE=$(curl -s -w "\n%{http_code}" \
#   "https://your-app.vercel.app/api/get-signed-url?key=test/file.txt" \
#   -H "Content-Type: application/json")
# 
# HTTP_CODE=$(echo "$SIGNED_URL_RESPONSE" | tail -n 1)
# RESPONSE_BODY=$(echo "$SIGNED_URL_RESPONSE" | head -n -1)
# 
# if [ "$HTTP_CODE" -eq 200 ]; then
#   print_success "Signed URL endpoint working (HTTP $HTTP_CODE)"
#   echo "$RESPONSE_BODY" | $PRETTY_JSON
# else
#   print_error "Signed URL endpoint failed (HTTP $HTTP_CODE)"
#   echo "$RESPONSE_BODY" | $PRETTY_JSON
# fi

print_info "Signed URL endpoint test skipped (requires deployment)"
print_info "After deploying to Vercel, uncomment lines 213-227 and set your Vercel URL"

# ============================================
# SUMMARY
# ============================================

print_header "Test Summary"
print_success "Smoke tests completed!"
echo ""
echo "Next steps:"
echo "1. Deploy to Vercel: vercel --prod"
echo "2. Set environment variables in Vercel dashboard"
echo "3. Test signed URL endpoint with actual deployed URL"
echo "4. Run comprehensive test suite: npm test"
echo ""
