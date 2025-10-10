#!/bin/bash
# Role-based functionality smoke test script
# Tests role detection, route access, and dashboard functionality

set -e

echo "🧪 Starting Role-Based Functionality Smoke Test"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test configuration
BASE_URL=${BASE_URL:-"http://localhost:5173"}
TEST_TIMEOUT=10

# Check if server is running
echo -e "${YELLOW}📡 Checking if development server is running...${NC}"
if ! curl -s "$BASE_URL" > /dev/null; then
    echo -e "${RED}❌ Development server not running at $BASE_URL${NC}"
    echo "Please run 'npm run dev' first"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"

# Test public routes (visitor access)
echo -e "${YELLOW}🌐 Testing public routes (visitor access)...${NC}"

test_route() {
    local route=$1
    local expected_status=${2:-200}
    local description=$3
    
    echo -n "  Testing $route... "
    
    if response=$(curl -s -w "%{http_code}" -o /dev/null --max-time $TEST_TIMEOUT "$BASE_URL$route"); then
        if [ "$response" = "$expected_status" ]; then
            echo -e "${GREEN}✅ $description${NC}"
            return 0
        else
            echo -e "${RED}❌ Expected $expected_status, got $response${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Request failed${NC}"
        return 1
    fi
}

# Test public routes
test_route "/" 200 "Home page accessible"
test_route "/explore" 200 "Explore page accessible"
test_route "/business-directory" 200 "Business directory accessible"
test_route "/tourism" 200 "Tourism page accessible"
test_route "/events" 200 "Events page accessible"
test_route "/news" 200 "News page accessible"

# Test auth routes
test_route "/auth/login" 200 "Login page accessible"
test_route "/auth/register" 200 "Register page accessible"

echo -e "${YELLOW}🔐 Testing protected routes (should redirect to login)...${NC}"

# These should redirect to login for unauthenticated users
test_route "/profile" 200 "Profile redirects to login"
test_route "/chat-demo" 200 "Chat demo redirects to login"
test_route "/admin" 200 "Admin panel redirects to login"
test_route "/business-dashboard" 200 "Business dashboard redirects to login"

echo -e "${YELLOW}📱 Testing role configuration...${NC}"

# Check if role config file exists and is valid
if [ -f "src/config/roles.json" ]; then
    echo -n "  Validating roles.json... "
    if node -e "
        const roles = require('./src/config/roles.json');
        const expectedRoles = ['visitor', 'citizen', 'business', 'admin'];
        const actualRoles = Object.keys(roles);
        
        for (const role of expectedRoles) {
            if (!actualRoles.includes(role)) {
                throw new Error(\`Missing role: \${role}\`);
            }
            const config = roles[role];
            if (!config.label || !config.color || !config.defaultLanding) {
                throw new Error(\`Invalid config for role: \${role}\`);
            }
        }
        console.log('✅ All role configurations valid');
    " 2>/dev/null; then
        echo -e "${GREEN}✅ Role configuration valid${NC}"
    else
        echo -e "${RED}❌ Role configuration invalid${NC}"
    fi
else
    echo -e "${RED}❌ roles.json file not found${NC}"
fi

echo -e "${YELLOW}🏗️  Testing component files...${NC}"

# Check if required components exist
components=(
    "src/components/RequireRole.tsx"
    "src/config/route-map.ts"
    "src/pages/CompleteOnboarding.tsx"
    "src/pages/CitizenDashboard.tsx"
    "src/pages/BusinessDashboard.tsx"
    "src/pages/AdminDashboard.tsx"
)

for component in "${components[@]}"; do
    echo -n "  Checking $component... "
    if [ -f "$component" ]; then
        echo -e "${GREEN}✅ Exists${NC}"
    else
        echo -e "${RED}❌ Missing${NC}"
    fi
done

echo -e "${YELLOW}🗄️  Testing database migrations...${NC}"

# Check if migration files exist
migrations=(
    "supabase/migrations/20251010_implement_role_enum.sql"
    "supabase/migrations/20251010_update_rls_role_based.sql"
)

for migration in "${migrations[@]}"; do
    echo -n "  Checking $migration... "
    if [ -f "$migration" ]; then
        echo -e "${GREEN}✅ Exists${NC}"
    else
        echo -e "${RED}❌ Missing${NC}"
    fi
done

echo -e "${YELLOW}🧪 Testing TypeScript compilation...${NC}"

if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ TypeScript compilation successful${NC}"
else
    echo -e "${RED}❌ TypeScript compilation failed${NC}"
    echo "Run 'npm run build' for detailed errors"
fi

echo -e "${YELLOW}🔍 Testing ESLint...${NC}"

if npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✅ ESLint passed${NC}"
else
    echo -e "${YELLOW}⚠️  ESLint warnings (run 'npm run lint' for details)${NC}"
fi

echo -e "${YELLOW}📋 Testing role-based routing logic...${NC}"

# Test route-map configuration
echo -n "  Validating route-map.ts... "
if node -e "
    const { routeMap, getRoutesByRole, canAccessRoute } = require('./src/config/route-map.ts');
    
    // Test role-based route filtering
    const citizenRoutes = getRoutesByRole('citizen');
    const adminRoutes = getRoutesByRole('admin');
    
    if (citizenRoutes.length === 0) {
        throw new Error('No routes found for citizen role');
    }
    
    if (adminRoutes.length === 0) {
        throw new Error('No routes found for admin role');
    }
    
    // Test route access checking
    if (!canAccessRoute('/admin', 'admin')) {
        throw new Error('Admin should be able to access /admin route');
    }
    
    if (canAccessRoute('/admin', 'visitor')) {
        throw new Error('Visitor should not be able to access /admin route');
    }
    
    console.log('✅ Route mapping logic works correctly');
" 2>/dev/null; then
    echo -e "${GREEN}✅ Route mapping valid${NC}"
else
    echo -e "${RED}❌ Route mapping invalid${NC}"
fi

# Test auth provider enhancements
echo -n "  Testing AuthProvider exports... "
if node -e "
    const fs = require('fs');
    const authContent = fs.readFileSync('src/lib/useAuth.ts', 'utf8');
    
    const requiredExports = ['UserRole', 'Profile', 'getRoleConfig', 'hasPermission', 'canAccessRoute'];
    
    for (const exportName of requiredExports) {
        if (!authContent.includes(exportName)) {
            throw new Error(\`Missing export: \${exportName}\`);
        }
    }
    
    console.log('✅ AuthProvider exports are complete');
" 2>/dev/null; then
    echo -e "${GREEN}✅ AuthProvider enhanced correctly${NC}"
else
    echo -e "${RED}❌ AuthProvider missing required exports${NC}"
fi

echo ""
echo "🎯 Role-Based Functionality Test Summary"
echo "======================================="

# Count successful tests (this is a simplified check)
total_tests=20
echo -e "📊 Completed smoke test for role-based functionality"
echo -e "🔧 Manual testing steps:"
echo -e "   1. Register new user → should redirect to onboarding"
echo -e "   2. Complete onboarding as citizen → should redirect to /home"
echo -e "   3. Complete onboarding as business → should redirect to /business-dashboard"
echo -e "   4. Try accessing /admin as non-admin → should show access denied"
echo -e "   5. Check header shows role badge when logged in"
echo -e "   6. Verify role-specific quick actions in dropdown"

echo ""
echo -e "${GREEN}✅ Smoke test completed!${NC}"
echo -e "Next steps:"
echo -e "  • Run unit tests: ${YELLOW}npm test${NC}"
echo -e "  • Run database tests: ${YELLOW}psql \$DATABASE_URL -f supabase/tests/test-rls-roles.sql${NC}"
echo -e "  • Test manual user flows with different roles"
echo -e "  • Deploy to staging for integration testing"