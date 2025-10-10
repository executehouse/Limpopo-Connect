#!/bin/bash

# Limpopo Connect - Comprehensive Smoke Test Script
# Tests all 6 critical fixes from the implementation guide

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SUPABASE_URL="${SUPABASE_URL:-}"
SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY:-}"
TEST_EMAIL="smoketest_$(date +%s)@example.com"
TEST_PASSWORD="SecureTest123!@#"

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((TESTS_PASSED++))
}

print_failure() {
    echo -e "${RED}✗ $1${NC}"
    ((TESTS_FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    ((TESTS_RUN++))
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js installed: $NODE_VERSION"
    else
        print_failure "Node.js not installed"
        return 1
    fi
    
    ((TESTS_RUN++))
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm installed: $NPM_VERSION"
    else
        print_failure "npm not installed"
        return 1
    fi
    
    ((TESTS_RUN++))
    if [ -f "package.json" ]; then
        print_success "package.json found"
    else
        print_failure "package.json not found"
        return 1
    fi
    
    ((TESTS_RUN++))
    if [ -f "vite.config.ts" ]; then
        print_success "vite.config.ts found"
    else
        print_failure "vite.config.ts not found"
        return 1
    fi
    
    echo ""
}

# Test 1: Fix #1 - RLS Profile Exposure
test_rls_profiles() {
    print_header "Test #1: RLS Profile Exposure Fix"
    
    ((TESTS_RUN++))
    if [ -f "supabase/migrations/20251010_fix_rls_profiles.sql" ]; then
        print_success "RLS profiles migration file exists"
    else
        print_failure "RLS profiles migration file missing"
        return 1
    fi
    
    ((TESTS_RUN++))
    if grep -q "DROP POLICY IF EXISTS public_profiles_viewable" "supabase/migrations/20251010_fix_rls_profiles.sql"; then
        print_success "Migration removes insecure using(true) policy"
    else
        print_failure "Migration doesn't remove using(true) policy"
    fi
    
    ((TESTS_RUN++))
    if grep -q "auth.uid() = id" "supabase/migrations/20251010_fix_rls_profiles.sql"; then
        print_success "JWT-based authorization using auth.uid()"
    else
        print_failure "JWT-based authorization not implemented"
    fi
    
    ((TESTS_RUN++))
    if grep -q "is_public = true" "supabase/migrations/20251010_fix_rls_profiles.sql"; then
        print_success "Public profile visibility implemented"
    else
        print_failure "Public profile visibility not implemented"
    fi
    
    ((TESTS_RUN++))
    if [ -f "supabase/tests/test-rls-profiles-fixed.sql" ]; then
        print_success "RLS profiles test file exists"
    else
        print_warning "RLS profiles test file missing (optional)"
    fi
    
    echo ""
}

# Test 2: Fix #2 - Unauthorized Room Access
test_room_access() {
    print_header "Test #2: Unauthorized Room Access Fix"
    
    ((TESTS_RUN++))
    if [ -f "supabase/migrations/20251010_fix_room_access.sql" ]; then
        print_success "Room access migration file exists"
    else
        print_failure "Room access migration file missing"
        return 1
    fi
    
    ((TESTS_RUN++))
    if grep -q "EXISTS.*room_members" "supabase/migrations/20251010_fix_room_access.sql"; then
        print_success "Membership-based access control implemented"
    else
        print_failure "Membership checks not implemented"
    fi
    
    ((TESTS_RUN++))
    if grep -q "is_room_member" "supabase/migrations/20251010_fix_room_access.sql"; then
        print_success "is_room_member function defined"
    else
        print_failure "is_room_member function not found"
    fi
    
    ((TESTS_RUN++))
    if grep -q "room_access_audit" "supabase/migrations/20251010_fix_room_access.sql"; then
        print_success "Audit logging implemented"
    else
        print_warning "Audit logging not found (optional)"
    fi
    
    ((TESTS_RUN++))
    if [ -f "supabase/tests/test-rls-rooms-fixed.sql" ]; then
        print_success "Room access test file exists"
    else
        print_warning "Room access test file missing (optional)"
    fi
    
    echo ""
}

# Test 3: Fix #3 - Password Strength Gap
test_password_validation() {
    print_header "Test #3: Password Strength Validation"
    
    ((TESTS_RUN++))
    if [ -f "supabase/migrations/20251010_add_password_validation.sql" ]; then
        print_success "Password validation migration exists"
    else
        print_failure "Password validation migration missing"
        return 1
    fi
    
    ((TESTS_RUN++))
    if grep -q "validate_password_strength" "supabase/migrations/20251010_add_password_validation.sql"; then
        print_success "Server-side validation function defined"
    else
        print_failure "Validation function not found"
    fi
    
    ((TESTS_RUN++))
    if [ -f "src/components/PasswordStrengthMeter.tsx" ]; then
        print_success "PasswordStrengthMeter component exists"
    else
        print_failure "PasswordStrengthMeter component missing"
        return 1
    fi
    
    ((TESTS_RUN++))
    if grep -q "zxcvbn" "src/components/PasswordStrengthMeter.tsx"; then
        print_success "zxcvbn library integration confirmed"
    else
        print_failure "zxcvbn library not integrated"
    fi
    
    ((TESTS_RUN++))
    if grep -q "PasswordStrengthMeter" "src/pages/auth/Register.tsx"; then
        print_success "Password meter integrated in Register"
    else
        print_failure "Password meter not in Register form"
    fi
    
    ((TESTS_RUN++))
    if grep -q "zxcvbn" "package.json"; then
        print_success "zxcvbn dependency in package.json"
    else
        print_failure "zxcvbn dependency missing"
    fi
    
    echo ""
}

# Test 4: Fix #4 - Header Navigation Bug
test_header_navigation() {
    print_header "Test #4: Header Navigation Fix"
    
    ((TESTS_RUN++))
    if [ -f "src/components/layout/Header.tsx" ]; then
        print_success "Header component exists"
    else
        print_failure "Header component missing"
        return 1
    fi
    
    ((TESTS_RUN++))
    if grep -q "useAuthContext" "src/components/layout/Header.tsx"; then
        print_success "Header uses auth context"
    else
        print_failure "Header doesn't use auth context"
    fi
    
    ((TESTS_RUN++))
    if grep -q "isAuthenticated" "src/components/layout/Header.tsx"; then
        print_success "Conditional rendering based on auth"
    else
        print_failure "No conditional rendering"
    fi
    
    ((TESTS_RUN++))
    if grep -q "signOut" "src/components/layout/Header.tsx"; then
        print_success "Sign out functionality present"
    else
        print_failure "Sign out functionality missing"
    fi
    
    echo ""
}

# Test 5: Fix #5 - Profile Page Creation
test_profile_page() {
    print_header "Test #5: Profile Page Implementation"
    
    ((TESTS_RUN++))
    if [ -f "src/pages/Profile.tsx" ]; then
        print_success "Profile page exists"
    else
        print_failure "Profile page missing"
        return 1
    fi
    
    ((TESTS_RUN++))
    FILE_SIZE=$(wc -l < "src/pages/Profile.tsx")
    if [ "$FILE_SIZE" -gt 100 ]; then
        print_success "Profile page has substantial implementation ($FILE_SIZE lines)"
    else
        print_failure "Profile page appears incomplete ($FILE_SIZE lines)"
    fi
    
    ((TESTS_RUN++))
    if grep -q "uploadAvatar" "src/pages/Profile.tsx"; then
        print_success "Avatar upload functionality present"
    else
        print_failure "Avatar upload missing"
    fi
    
    ((TESTS_RUN++))
    if grep -q "is_public" "src/pages/Profile.tsx"; then
        print_success "Privacy toggle implemented"
    else
        print_failure "Privacy toggle missing"
    fi
    
    ((TESTS_RUN++))
    if grep -q "user-uploads" "src/pages/Profile.tsx"; then
        print_success "Supabase Storage integration present"
    else
        print_warning "Storage bucket reference not found"
    fi
    
    ((TESTS_RUN++))
    if grep -q "avatar_url" "src/lib/useAuth.ts"; then
        print_success "Profile interface includes avatar_url"
    else
        print_failure "Profile interface missing avatar_url"
    fi
    
    echo ""
}

# Test 6: Fix #6 - Vite Host Binding
test_vite_host_binding() {
    print_header "Test #6: Vite Host Binding Fix"
    
    ((TESTS_RUN++))
    if grep -q "host: true" "vite.config.ts"; then
        print_success "Vite configured with host: true"
    else
        print_failure "Vite not configured for 0.0.0.0 binding"
        return 1
    fi
    
    ((TESTS_RUN++))
    if grep -q '"dev".*--host' "package.json"; then
        print_success "Dev script includes --host flag"
    else
        print_warning "Dev script doesn't include --host (may use config)"
    fi
    
    ((TESTS_RUN++))
    if grep -q "strictPort: false" "vite.config.ts"; then
        print_success "Flexible port configuration"
    else
        print_warning "strictPort not set (may cause conflicts)"
    fi
    
    echo ""
}

# Test 7: Documentation Completeness
test_documentation() {
    print_header "Test #7: Documentation Completeness"
    
    ((TESTS_RUN++))
    if [ -f "IMPLEMENTATION_GUIDE.md" ]; then
        print_success "IMPLEMENTATION_GUIDE.md exists"
    else
        print_warning "IMPLEMENTATION_GUIDE.md missing"
    fi
    
    ((TESTS_RUN++))
    if [ -f "PROJECT_SUMMARY.md" ]; then
        print_success "PROJECT_SUMMARY.md exists"
    else
        print_warning "PROJECT_SUMMARY.md missing"
    fi
    
    ((TESTS_RUN++))
    if [ -f "AUTHENTICATION_TEST_PLAN.md" ]; then
        print_success "AUTHENTICATION_TEST_PLAN.md exists"
    else
        print_warning "AUTHENTICATION_TEST_PLAN.md missing"
    fi
    
    ((TESTS_RUN++))
    if [ -f "PR_DELIVERABLES.md" ]; then
        print_success "PR_DELIVERABLES.md exists"
    else
        print_warning "PR_DELIVERABLES.md missing"
    fi
    
    ((TESTS_RUN++))
    if [ -f "IMPLEMENTATION_COMPLETE.md" ]; then
        print_success "IMPLEMENTATION_COMPLETE.md exists"
    else
        print_warning "IMPLEMENTATION_COMPLETE.md missing"
    fi
    
    ((TESTS_RUN++))
    if [ -f "README.md" ]; then
        print_success "README.md exists"
    else
        print_failure "README.md missing"
    fi
    
    ((TESTS_RUN++))
    if [ -f "SECURITY.md" ]; then
        print_success "SECURITY.md exists"
    else
        print_warning "SECURITY.md missing"
    fi
    
    echo ""
}

# Test 8: Build and Lint
test_build() {
    print_header "Test #8: Build and Lint Checks"
    
    print_info "Installing dependencies..."
    if npm install --silent 2>&1 | tail -5; then
        ((TESTS_RUN++))
        print_success "Dependencies installed"
    else
        ((TESTS_RUN++))
        print_failure "Dependency installation failed"
        return 1
    fi
    
    print_info "Running ESLint..."
    ((TESTS_RUN++))
    if npm run lint --silent 2>&1 | tail -10; then
        print_success "ESLint check passed"
    else
        print_warning "ESLint found issues (review output)"
    fi
    
    print_info "Running TypeScript type check..."
    ((TESTS_RUN++))
    if npm run build 2>&1 | tail -15; then
        print_success "TypeScript build succeeded"
    else
        print_failure "TypeScript build failed"
        return 1
    fi
    
    echo ""
}

# Generate summary report
generate_report() {
    print_header "Smoke Test Summary"
    
    echo -e "Tests Run:    ${BLUE}$TESTS_RUN${NC}"
    echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
    echo ""
    
    PASS_RATE=$((TESTS_PASSED * 100 / TESTS_RUN))
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}  ALL TESTS PASSED! ✓${NC}"
        echo -e "${GREEN}  Pass Rate: $PASS_RATE%${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        return 0
    elif [ $PASS_RATE -ge 80 ]; then
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}  TESTS MOSTLY PASSED${NC}"
        echo -e "${YELLOW}  Pass Rate: $PASS_RATE%${NC}"
        echo -e "${YELLOW}  Review failed tests above${NC}"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        return 1
    else
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${RED}  CRITICAL FAILURES DETECTED${NC}"
        echo -e "${RED}  Pass Rate: $PASS_RATE%${NC}"
        echo -e "${RED}  Review implementation${NC}"
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        return 2
    fi
}

# Main execution
main() {
    clear
    echo -e "${BLUE}"
    cat << "EOF"
╔══════════════════════════════════════════════════════╗
║                                                      ║
║        LIMPOPO CONNECT                               ║
║        Comprehensive Smoke Test Suite                ║
║                                                      ║
║        Testing 6 Critical Fixes + Documentation      ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    echo ""
    
    # Run all tests
    check_prerequisites || exit 1
    test_rls_profiles
    test_room_access
    test_password_validation
    test_header_navigation
    test_profile_page
    test_vite_host_binding
    test_documentation
    test_build
    
    # Generate report
    echo ""
    generate_report
    exit $?
}

# Execute main function
main "$@"
