#!/bin/bash

# Simple Role System Validation Script
echo "🚀 Role-Based Authentication System Validation"
echo "============================================="

# Test counters
total=0
passed=0

# Test function
test_check() {
    local name="$1"
    local cmd="$2"
    total=$((total + 1))
    
    echo -n "Test $total: $name... "
    
    if eval "$cmd" > /dev/null 2>&1; then
        echo "✅ PASSED"
        passed=$((passed + 1))
    else
        echo "❌ FAILED"
    fi
}

echo ""
echo "Phase 1: File Structure Check"
echo "============================="

test_check "Migration files exist" "test -f supabase/migrations/20251010_add_role_to_profiles.sql"
test_check "JWT config exists" "test -f supabase/migrations/20251010_configure_jwt_claims.sql"
test_check "RLS policies exist" "test -f supabase/migrations/20251010_enhanced_rls_policies.sql"
test_check "useAuth hook exists" "test -f src/lib/useAuth.ts"
test_check "AuthProvider exists" "test -f src/lib/AuthProvider.tsx"
test_check "Roles config exists" "test -f src/config/roles.json"
test_check "Role tests exist" "test -f src/tests/auth.role.test.ts"
test_check "SQL tests exist" "test -f supabase/tests/test-role-system.sql"

echo ""
echo "Phase 2: Content Validation" 
echo "=========================="

test_check "Role enum in migration" "grep -q 'CREATE TYPE user_role' supabase/migrations/20251010_add_role_to_profiles.sql"
test_check "JWT claims config" "grep -q 'ALTER ROLE authenticator' supabase/migrations/20251010_configure_jwt_claims.sql"
test_check "RLS role functions" "grep -q 'get_current_user_role' supabase/migrations/20251010_enhanced_rls_policies.sql"
test_check "Frontend role types" "grep -q 'type UserRole' src/lib/useAuth.ts"
test_check "Business verification" "grep -q 'requestBusinessVerification' src/lib/useAuth.ts"
test_check "All 4 roles defined" "grep -q 'visitor.*citizen.*business.*admin' src/config/roles.json"

echo ""
echo "Phase 3: Build & Lint Check"
echo "=========================="

test_check "TypeScript compiles" "npm run build"
test_check "Linting passes" "npm run lint"

echo ""
echo "Results Summary"
echo "=============="
echo "Total tests: $total"
echo "Passed: $passed"
echo "Failed: $((total - passed))"
echo "Success rate: $(( passed * 100 / total ))%"

if [ $passed -eq $total ]; then
    echo ""
    echo "🎉 All tests passed! Role system ready for deployment."
    exit 0
else
    echo ""
    echo "⚠️  Some tests failed. Review the output above."
    exit 1
fi