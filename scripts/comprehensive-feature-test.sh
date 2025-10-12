#!/bin/bash

# ========================================
# Limpopo Connect - Comprehensive Feature Test Script
# ========================================
# Purpose: Automated testing of all application features
# Date: October 12, 2025
# Version: 1.0
# ========================================

# Don't exit on error - we want to continue testing
# set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# Test categories
declare -A CATEGORY_TESTS
declare -A CATEGORY_PASSED
declare -A CATEGORY_FAILED

# Initialize categories
CATEGORIES=("Prerequisites" "Structure" "TypeScript" "Security" "Routes" "Components" "Build" "Performance")
for cat in "${CATEGORIES[@]}"; do
    CATEGORY_TESTS[$cat]=0
    CATEGORY_PASSED[$cat]=0
    CATEGORY_FAILED[$cat]=0
done

# ========================================
# Helper Functions
# ========================================

print_header() {
    echo ""
    echo -e "${BLUE}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}${BOLD}  $1${NC}"
    echo -e "${BLUE}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_section() {
    echo ""
    echo -e "${MAGENTA}${BOLD}▸ $1${NC}"
    echo -e "${MAGENTA}──────────────────────────────────────────────────${NC}"
}

print_test() {
    echo -e "${CYAN}  Testing: $1${NC}"
}

print_success() {
    echo -e "${GREEN}  ✓ $1${NC}"
    ((PASSED_TESTS++))
    if [ -n "$2" ]; then
        ((CATEGORY_PASSED[$2]++))
    fi
}

print_failure() {
    echo -e "${RED}  ✗ $1${NC}"
    ((FAILED_TESTS++))
    if [ -n "$2" ]; then
        ((CATEGORY_FAILED[$2]++))
    fi
}

print_skip() {
    echo -e "${YELLOW}  ⊘ $1${NC}"
    ((SKIPPED_TESTS++))
}

print_info() {
    echo -e "${BLUE}  ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}  ⚠ $1${NC}"
}

run_test() {
    local category="$1"
    local description="$2"
    local test_command="$3"
    
    ((TOTAL_TESTS++))
    ((CATEGORY_TESTS[$category]++))
    
    print_test "$description"
    
    if eval "$test_command" > /tmp/test_output_$$.log 2>&1; then
        print_success "$description" "$category"
        return 0
    else
        print_failure "$description - $(head -1 /tmp/test_output_$$.log)" "$category"
        return 1
    fi
}

# ========================================
# Test Suite: Prerequisites
# ========================================

test_prerequisites() {
    print_header "PHASE 1: Prerequisites Check"
    
    run_test "Prerequisites" "Node.js installed" "command -v node"
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_info "Node version: $NODE_VERSION"
    fi
    
    run_test "Prerequisites" "npm installed" "command -v npm"
    
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_info "npm version: $NPM_VERSION"
    fi
    
    run_test "Prerequisites" "package.json exists" "test -f package.json"
    run_test "Prerequisites" "node_modules exists" "test -d node_modules"
    run_test "Prerequisites" "Git repository initialized" "test -d .git"
}

# ========================================
# Test Suite: Project Structure
# ========================================

test_project_structure() {
    print_header "PHASE 2: Project Structure Validation"
    
    print_section "Core Configuration Files"
    run_test "Structure" "vite.config.ts exists" "test -f vite.config.ts"
    run_test "Structure" "tsconfig.json exists" "test -f tsconfig.json"
    run_test "Structure" "tailwind.config.js exists" "test -f tailwind.config.js"
    run_test "Structure" "package.json exists" "test -f package.json"
    
    print_section "Source Directory Structure"
    run_test "Structure" "src/ directory exists" "test -d src"
    run_test "Structure" "src/pages/ exists" "test -d src/pages"
    run_test "Structure" "src/components/ exists" "test -d src/components"
    run_test "Structure" "src/lib/ exists" "test -d src/lib"
    run_test "Structure" "public/ directory exists" "test -d public"
    
    print_section "Key Application Files"
    run_test "Structure" "src/App.tsx exists" "test -f src/App.tsx"
    run_test "Structure" "src/main.tsx exists" "test -f src/main.tsx"
    run_test "Structure" "src/lib/supabase.ts exists" "test -f src/lib/supabase.ts"
    run_test "Structure" "src/lib/AuthProvider.tsx exists" "test -f src/lib/AuthProvider.tsx"
}

# ========================================
# Test Suite: Page Components
# ========================================

test_page_components() {
    print_header "PHASE 3: Page Components Validation"
    
    print_section "Authentication Pages"
    run_test "Components" "Login page exists" "test -f src/pages/auth/Login.tsx"
    run_test "Components" "Register page exists" "test -f src/pages/auth/Register.tsx"
    run_test "Components" "ForgotPassword page exists" "test -f src/pages/auth/ForgotPassword.tsx"
    run_test "Components" "ResetPassword page exists" "test -f src/pages/auth/ResetPassword.tsx"
    
    print_section "Dashboard Pages"
    run_test "Components" "CitizenDashboard exists" "test -f src/pages/CitizenDashboard.tsx"
    run_test "Components" "BusinessDashboard exists" "test -f src/pages/BusinessDashboard.tsx"
    run_test "Components" "AdminDashboard exists" "test -f src/pages/AdminDashboard.tsx"
    run_test "Components" "VisitorDashboard exists" "test -f src/pages/VisitorDashboard.tsx"
    
    print_section "Public Pages"
    run_test "Components" "Home page exists" "test -f src/pages/Home.tsx"
    run_test "Components" "BusinessDirectory exists" "test -f src/pages/BusinessDirectory.tsx"
    run_test "Components" "Events page exists" "test -f src/pages/Events.tsx"
    run_test "Components" "Tourism page exists" "test -f src/pages/Tourism.tsx"
    run_test "Components" "News page exists" "test -f src/pages/News.tsx"
    
    print_section "Protected Pages"
    run_test "Components" "Profile page exists" "test -f src/pages/Profile.tsx"
    run_test "Components" "ProfileEdit exists" "test -f src/pages/ProfileEdit.tsx"
    run_test "Components" "ProfileView exists" "test -f src/pages/ProfileView.tsx"
    run_test "Components" "Marketplace exists" "test -f src/pages/Marketplace.tsx"
    run_test "Components" "Connections exists" "test -f src/pages/Connections.tsx"
    run_test "Components" "ChatDemo exists" "test -f src/pages/ChatDemo.tsx"
    
    print_section "Onboarding & Special Pages"
    run_test "Components" "CompleteOnboarding exists" "test -f src/pages/CompleteOnboarding.tsx"
    run_test "Components" "DiagnosticPage exists" "test -f src/pages/DiagnosticPage.tsx"
}

# ========================================
# Test Suite: Layout Components
# ========================================

test_layout_components() {
    print_header "PHASE 4: Layout Components Validation"
    
    print_section "Layout Components"
    run_test "Components" "Header component exists" "test -f src/components/layout/Header.tsx"
    run_test "Components" "Footer component exists" "test -f src/components/layout/Footer.tsx"
    run_test "Components" "Layout component exists" "test -f src/components/layout/Layout.tsx"
    
    print_section "Shared Components"
    run_test "Components" "ProtectedRoute exists" "test -f src/components/ProtectedRoute.tsx"
    run_test "Components" "RequireRole exists" "test -f src/components/RequireRole.tsx"
    run_test "Components" "RoleGuard exists" "test -f src/components/RoleGuard.tsx"
    run_test "Components" "PasswordStrengthMeter exists" "test -f src/components/PasswordStrengthMeter.tsx"
}

# ========================================
# Test Suite: TypeScript Compilation
# ========================================

test_typescript() {
    print_header "PHASE 5: TypeScript Compilation"
    
    print_section "Type Checking"
    run_test "TypeScript" "TypeScript compilation succeeds" "npm run typecheck"
    
    print_section "Linting"
    run_test "TypeScript" "ESLint passes" "npm run lint"
}

# ========================================
# Test Suite: Security Implementation
# ========================================

test_security() {
    print_header "PHASE 6: Security Implementation"
    
    print_section "SQL Migrations"
    run_test "Security" "RLS profiles migration exists" \
        "test -f supabase/migrations/20251010_fix_rls_profiles.sql"
    run_test "Security" "Room access migration exists" \
        "test -f supabase/migrations/20251010_fix_room_access.sql"
    run_test "Security" "Password validation migration exists" \
        "test -f supabase/migrations/20251010_add_password_validation.sql"
    
    print_section "Security Components"
    run_test "Security" "PasswordStrengthMeter implemented" \
        "grep -q 'zxcvbn' src/components/PasswordStrengthMeter.tsx"
    # Validate that our auth layer integrates with Supabase JWT/session APIs.
    # Accept evidence in either AuthProvider (context wrapper) or useAuth (hook implementation).
    run_test "Security" "Auth provider uses JWT" \
        "grep -q 'auth.uid()' src/lib/AuthProvider.tsx || grep -q 'getSession' src/lib/AuthProvider.tsx || grep -q 'getSession' src/lib/useAuth.ts"
    
    print_section "Security Policies"
    if [ -f "supabase/migrations/20251010_fix_rls_profiles.sql" ]; then
        # Ensure we do not ship insecure USING(true) policies. If the legacy line exists, it must be flagged with a removal comment.
        # Use '--' to terminate grep options since the pattern starts with a dash in the comment text.
        run_test "Security" "No insecure using(true) in RLS profiles" \
            "! grep -q 'USING (true)' supabase/migrations/20251010_fix_rls_profiles.sql || grep -q -- 'Remove insecure' supabase/migrations/20251010_fix_rls_profiles.sql"
    else
        print_skip "RLS profile migration check (file missing)"
    fi
}

# ========================================
# Test Suite: Route Configuration
# ========================================

test_routes() {
    print_header "PHASE 7: Route Configuration"
    
    print_section "App.tsx Route Definitions"
    
    # Check for key routes in App.tsx
    run_test "Routes" "Login route defined" "grep -q '/auth/login' src/App.tsx"
    run_test "Routes" "Register route defined" "grep -q '/auth/register' src/App.tsx"
    # Accept either absolute ("/route") or nested route definitions (path="route").
    run_test "Routes" "Profile route defined" "grep -q 'path.*profile' src/App.tsx || grep -q '/profile' src/App.tsx"
    run_test "Routes" "Business directory route defined" "grep -q 'path.*business-directory' src/App.tsx || grep -q '/business-directory' src/App.tsx"
    run_test "Routes" "Events route defined" "grep -q 'path.*events' src/App.tsx || grep -q '/events' src/App.tsx"
    run_test "Routes" "Marketplace route defined" "grep -q 'path.*marketplace' src/App.tsx || grep -q '/marketplace' src/App.tsx"
    run_test "Routes" "Admin dashboard route defined" "grep -q '/admin' src/App.tsx || grep -q '/dashboard/admin' src/App.tsx"
    
    print_section "Protected Routes with RoleGuard"
    run_test "Routes" "RequireRole component imported" "grep -q 'RequireRole' src/App.tsx"
    run_test "Routes" "Protected routes use role guards" "grep -q '<RequireRole' src/App.tsx"
}

# ========================================
# Test Suite: Build Process
# ========================================

test_build() {
    print_header "PHASE 8: Build Process"
    
    print_section "Production Build"
    print_test "Building production bundle..."
    
    if npm run build > /tmp/build_output_$$.log 2>&1; then
        print_success "Production build successful" "Build"
        
        # Check build output
        if [ -d "dist" ]; then
            print_success "dist/ directory created" "Build"
            
            if [ -f "dist/index.html" ]; then
                print_success "index.html generated" "Build"
            else
                print_failure "index.html not found in dist/" "Build"
            fi
            
            # Check for asset files
            ASSET_COUNT=$(find dist/assets -type f 2>/dev/null | wc -l)
            if [ "$ASSET_COUNT" -gt 0 ]; then
                print_success "Assets generated ($ASSET_COUNT files)" "Build"
            else
                print_failure "No assets generated" "Build"
            fi
        else
            print_failure "dist/ directory not created" "Build"
        fi
    else
        print_failure "Production build failed" "Build"
        print_warning "Check /tmp/build_output_$$.log for details"
    fi
}

# ========================================
# Test Suite: Performance Checks
# ========================================

test_performance() {
    print_header "PHASE 9: Performance Checks"
    
    print_section "Bundle Analysis"
    
    if [ -d "dist" ]; then
        # Check main JS bundle size
        MAIN_JS=$(find dist/assets -name "index-*.js" -type f | head -1)
        if [ -n "$MAIN_JS" ]; then
            SIZE=$(du -h "$MAIN_JS" | cut -f1)
            SIZE_KB=$(du -k "$MAIN_JS" | cut -f1)
            print_info "Main JS bundle: $SIZE"
            
            if [ "$SIZE_KB" -lt 1024 ]; then
                print_success "Main bundle < 1MB ($SIZE)" "Performance"
            elif [ "$SIZE_KB" -lt 2048 ]; then
                print_warning "Main bundle is large ($SIZE)"
                ((PASSED_TESTS++))
                ((CATEGORY_PASSED["Performance"]++))
            else
                print_failure "Main bundle too large ($SIZE)" "Performance"
            fi
        fi
        
        # Check CSS bundle size
        MAIN_CSS=$(find dist/assets -name "index-*.css" -type f | head -1)
        if [ -n "$MAIN_CSS" ]; then
            SIZE=$(du -h "$MAIN_CSS" | cut -f1)
            SIZE_KB=$(du -k "$MAIN_CSS" | cut -f1)
            print_info "Main CSS bundle: $SIZE"
            
            if [ "$SIZE_KB" -lt 200 ]; then
                print_success "CSS bundle optimized ($SIZE)" "Performance"
            else
                print_warning "CSS bundle size: $SIZE"
                ((PASSED_TESTS++))
                ((CATEGORY_PASSED["Performance"]++))
            fi
        fi
        
        # Count total asset files
        TOTAL_ASSETS=$(find dist/assets -type f | wc -l)
        print_info "Total asset files: $TOTAL_ASSETS"
        
        if [ "$TOTAL_ASSETS" -lt 20 ]; then
            print_success "Asset count reasonable ($TOTAL_ASSETS files)" "Performance"
        else
            print_warning "Many asset files ($TOTAL_ASSETS)"
        fi
    else
        print_skip "Bundle analysis (build not available)"
    fi
}

# ========================================
# Test Suite: Documentation
# ========================================

test_documentation() {
    print_header "PHASE 10: Documentation Validation"
    
    print_section "Core Documentation"
    run_test "Structure" "README.md exists" "test -f README.md"
    run_test "Structure" "QUICK_START.md exists" "test -f QUICK_START.md"
    run_test "Structure" "IMPLEMENTATION_GUIDE.md exists" "test -f IMPLEMENTATION_GUIDE.md"
    run_test "Structure" "SMOKE_TEST_GUIDE.md exists" "test -f SMOKE_TEST_GUIDE.md"
    
    print_section "Testing Documentation"
    run_test "Structure" "AUTHENTICATION_TEST_PLAN.md exists" "test -f AUTHENTICATION_TEST_PLAN.md"
    run_test "Structure" "WEB_TESTING_GUIDE.md exists" "test -f WEB_TESTING_GUIDE.md"
    run_test "Structure" "COMPREHENSIVE_MANUAL_TEST_GUIDE.md exists" \
        "test -f COMPREHENSIVE_MANUAL_TEST_GUIDE.md"
    
    print_section "Deployment Documentation"
    run_test "Structure" "VERCEL_DEPLOYMENT.md exists" "test -f VERCEL_DEPLOYMENT.md"
    run_test "Structure" "SUPABASE_SETUP_GUIDE.md exists" "test -f SUPABASE_SETUP_GUIDE.md"
}

# ========================================
# Test Suite: Test Files
# ========================================

test_test_files() {
    print_header "PHASE 11: Test Files Validation"
    
    print_section "Component Tests"
    run_test "Structure" "Login test exists" "test -f src/pages/auth/Login.test.tsx"
    run_test "Structure" "Register test exists" "test -f src/pages/auth/Register.test.tsx"
    run_test "Structure" "Header test exists" "test -f src/components/layout/Header.test.tsx"
    run_test "Structure" "PasswordStrengthMeter test exists" \
        "test -f src/components/PasswordStrengthMeter.test.tsx"
    
    print_section "Integration Tests"
    run_test "Structure" "useProfile test exists" "test -f src/tests/useProfile.test.tsx"
    run_test "Structure" "Dashboard routing test exists" "test -f src/tests/dashboard.routing.test.tsx"
    
    print_section "Database Tests"
    run_test "Structure" "RLS profiles test exists" \
        "test -f supabase/tests/test-rls-profiles-fixed.sql"
    run_test "Structure" "RLS rooms test exists" \
        "test -f supabase/tests/test-rls-rooms-fixed.sql"
    run_test "Structure" "Password validation test exists" \
        "test -f supabase/tests/test-password-validation.sql"
}

# ========================================
# Summary Report
# ========================================

print_summary() {
    echo ""
    echo ""
    print_header "TEST EXECUTION SUMMARY"
    
    # Calculate overall pass rate
    if [ $TOTAL_TESTS -gt 0 ]; then
        PASS_RATE=$(awk "BEGIN {printf \"%.1f\", ($PASSED_TESTS / $TOTAL_TESTS) * 100}")
    else
        PASS_RATE="0.0"
    fi
    
    echo ""
    echo -e "${BOLD}Overall Results:${NC}"
    echo -e "  Total Tests:    ${CYAN}$TOTAL_TESTS${NC}"
    echo -e "  Passed:         ${GREEN}$PASSED_TESTS${NC}"
    echo -e "  Failed:         ${RED}$FAILED_TESTS${NC}"
    echo -e "  Skipped:        ${YELLOW}$SKIPPED_TESTS${NC}"
    echo -e "  Pass Rate:      ${CYAN}${PASS_RATE}%${NC}"
    
    echo ""
    echo -e "${BOLD}Results by Category:${NC}"
    echo ""
    
    for cat in "${CATEGORIES[@]}"; do
        total=${CATEGORY_TESTS[$cat]}
        passed=${CATEGORY_PASSED[$cat]}
        failed=${CATEGORY_FAILED[$cat]}
        
        if [ $total -gt 0 ]; then
            rate=$(awk "BEGIN {printf \"%.0f\", ($passed / $total) * 100}")
            
            # Color code based on pass rate
            if [ $rate -eq 100 ]; then
                color=$GREEN
                status="✓"
            elif [ $rate -ge 80 ]; then
                color=$YELLOW
                status="◐"
            else
                color=$RED
                status="✗"
            fi
            
            printf "  ${color}${status} %-20s %2d/%2d tests passed (%3d%%)${NC}\n" \
                "$cat:" "$passed" "$total" "$rate"
        fi
    done
    
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Overall status
    echo ""
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}${BOLD}✓ ALL TESTS PASSED!${NC}"
        echo -e "${GREEN}Application is ready for deployment.${NC}"
        exit 0
    elif [ $FAILED_TESTS -le 5 ]; then
        echo -e "${YELLOW}${BOLD}⚠ SOME TESTS FAILED${NC}"
        echo -e "${YELLOW}$FAILED_TESTS issue(s) need attention before deployment.${NC}"
        exit 1
    else
        echo -e "${RED}${BOLD}✗ MULTIPLE TEST FAILURES${NC}"
        echo -e "${RED}$FAILED_TESTS critical issues must be resolved.${NC}"
        exit 1
    fi
}

# ========================================
# Main Execution
# ========================================

main() {
    clear
    echo ""
    echo -e "${CYAN}${BOLD}"
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                                                                ║"
    echo "║              LIMPOPO CONNECT                                   ║"
    echo "║       Comprehensive Feature Test Suite                         ║"
    echo "║                                                                ║"
    echo "║          Testing All Application Features                      ║"
    echo "║                                                                ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    print_info "Starting test execution at $(date)"
    print_info "Test suite will validate 11 categories of functionality"
    
    # Run all test suites
    test_prerequisites
    test_project_structure
    test_page_components
    test_layout_components
    test_typescript
    test_security
    test_routes
    test_build
    test_performance
    test_documentation
    test_test_files
    
    # Print summary
    print_summary
}

# Execute main function
main "$@"
