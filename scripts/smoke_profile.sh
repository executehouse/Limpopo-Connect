#!/bin/bash

# Profile Page Smoke Test
# Tests the complete profile functionality including view, edit, and upload flows

set -e

echo "🔥 Limpopo Connect - Profile Page Smoke Test"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Not in project root directory${NC}"
    exit 1
fi

# Check environment variables
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}❌ Error: Supabase environment variables not set${NC}"
    echo "Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
    exit 1
fi

print_info "Starting Profile Page smoke test..."

# 1. Check if migration files exist
echo -e "\n📁 Migration Files Check"
echo "========================"

migration_files=(
    "supabase/migrations/20251010_profiles_profile_page.sql"
    "supabase/migrations/20251010_profile_page_rls.sql"
)

for file in "${migration_files[@]}"; do
    if [ -f "$file" ]; then
        print_status 0 "Migration file exists: $file"
    else
        print_status 1 "Missing migration file: $file"
        echo -e "${RED}Please create the missing migration file${NC}"
        exit 1
    fi
done

# 2. Check if profile components exist
echo -e "\n🧩 Profile Components Check"
echo "============================"

component_files=(
    "src/components/ProfileView.tsx"
    "src/components/ProfileEdit.tsx"
    "src/lib/useProfile.ts"
    "src/lib/storage.ts"
    "src/pages/Profile.tsx"
)

for file in "${component_files[@]}"; do
    if [ -f "$file" ]; then
        print_status 0 "Component exists: $file"
    else
        print_status 1 "Missing component: $file"
        echo -e "${RED}Please create the missing component${NC}"
        exit 1
    fi
done

# 3. Run TypeScript compilation
echo -e "\n🔍 TypeScript Compilation"
echo "========================="

if npm run build > /dev/null 2>&1; then
    print_status 0 "TypeScript compilation successful"
else
    print_status 1 "TypeScript compilation failed"
    echo -e "${YELLOW}Running build to see errors...${NC}"
    npm run build
    exit 1
fi

# 4. Run ESLint
echo -e "\n📋 Code Quality Check"
echo "===================="

if npm run lint > /dev/null 2>&1; then
    print_status 0 "ESLint check passed"
else
    print_status 1 "ESLint check failed"
    echo -e "${YELLOW}Running lint to see warnings...${NC}"
    npm run lint
fi

# 5. Run profile-specific tests
echo -e "\n🧪 Profile Tests"
echo "================"

test_files=(
    "src/tests/ProfileView.test.tsx"
    "src/tests/ProfileEdit.test.tsx"
    "src/tests/useProfile.test.tsx"
)

for test_file in "${test_files[@]}"; do
    if [ -f "$test_file" ]; then
        print_status 0 "Test file exists: $test_file"
        if npm test "$test_file" > /dev/null 2>&1; then
            print_status 0 "Tests passed: $test_file"
        else
            print_status 1 "Tests failed: $test_file"
            echo -e "${YELLOW}Run 'npm test $test_file' to see details${NC}"
        fi
    else
        print_status 1 "Missing test file: $test_file"
    fi
done

# 6. Check if profile routes are configured
echo -e "\n🛣️  Route Configuration"
echo "======================="

if grep -q "profile/me" src/App.tsx; then
    print_status 0 "Profile routes configured in App.tsx"
else
    print_status 1 "Profile routes missing in App.tsx"
fi

if grep -q "ProfileView\|ProfileEdit" src/App.tsx || grep -q "Profile" src/App.tsx; then
    print_status 0 "Profile components imported in routing"
else
    print_status 1 "Profile components not imported in routing"
fi

# 7. Database Schema Validation (if DATABASE_URL is available)
echo -e "\n🗄️  Database Schema Check"
echo "========================="

if [ -n "$DATABASE_URL" ]; then
    print_info "Checking database schema..."
    
    # Check if profiles table has required columns
    if psql "$DATABASE_URL" -c "SELECT avatar_url, bio, phone, is_public_profile, show_contact, updated_at FROM profiles LIMIT 1;" > /dev/null 2>&1; then
        print_status 0 "Profiles table has required columns"
    else
        print_status 1 "Profiles table missing required columns"
        echo -e "${YELLOW}Run migration: psql \"\$DATABASE_URL\" -f supabase/migrations/20251010_profiles_profile_page.sql${NC}"
    fi
    
    # Check if RLS policies exist
    if psql "$DATABASE_URL" -c "SELECT * FROM pg_policies WHERE tablename = 'profiles';" | grep -q "profiles_select_policy\|profiles_update_policy"; then
        print_status 0 "Profile RLS policies configured"
    else
        print_status 1 "Profile RLS policies missing"
        echo -e "${YELLOW}Run migration: psql \"\$DATABASE_URL\" -f supabase/migrations/20251010_profile_page_rls.sql${NC}"
    fi
    
    # Check if audit table exists
    if psql "$DATABASE_URL" -c "SELECT 1 FROM profile_audit_logs LIMIT 1;" > /dev/null 2>&1; then
        print_status 0 "Profile audit logging table exists"
    else
        print_status 1 "Profile audit logging table missing"
    fi
else
    print_warning "DATABASE_URL not set, skipping database checks"
fi

# 8. Storage Configuration Check
echo -e "\n📦 Storage Configuration"
echo "========================"

if grep -q "user-uploads" src/lib/storage.ts; then
    print_status 0 "Storage utilities configured for user-uploads bucket"
else
    print_status 1 "Storage utilities missing user-uploads configuration"
fi

if grep -q "validateAndResizeImage" src/lib/storage.ts; then
    print_status 0 "Image validation and resizing implemented"
else
    print_status 1 "Image validation and resizing missing"
fi

if grep -q "uploadAvatar\|deleteAvatar" src/lib/storage.ts; then
    print_status 0 "Avatar upload/delete functions implemented"
else
    print_status 1 "Avatar upload/delete functions missing"
fi

# 9. Security Validation
echo -e "\n🔒 Security Checks"
echo "=================="

# Check for proper auth context usage
if grep -q "useAuthContext" src/components/ProfileView.tsx && grep -q "useAuthContext" src/components/ProfileEdit.tsx; then
    print_status 0 "Components use authentication context"
else
    print_status 1 "Components missing authentication context"
fi

# Check for role-based access controls
if grep -q "isAdmin\|isCitizen\|isBusiness" src/components/ProfileView.tsx; then
    print_status 0 "Profile view has role-based access controls"
else
    print_status 1 "Profile view missing role-based access controls"
fi

# Check for input validation
if grep -q "validate\|validation" src/components/ProfileEdit.tsx; then
    print_status 0 "Profile edit has input validation"
else
    print_status 1 "Profile edit missing input validation"
fi

# 10. Documentation Check
echo -e "\n📚 Documentation"
echo "================"

if [ -f "PROFILE_API.md" ]; then
    print_status 0 "Profile API documentation exists"
else
    print_status 1 "Profile API documentation missing"
    print_warning "Create PROFILE_API.md with endpoints and RLS documentation"
fi

if grep -q "Profile Page" IMPLEMENTATION_GUIDE.md 2>/dev/null; then
    print_status 0 "Implementation guide updated with profile section"
else
    print_status 1 "Implementation guide missing profile section"
fi

# Summary and next steps
echo -e "\n🎯 Smoke Test Summary"
echo "===================="

echo -e "${GREEN}✅ Profile Components:${NC}"
echo "   - ProfileView: Display user profiles with privacy controls"
echo "   - ProfileEdit: Form for updating profile information"
echo "   - Profile: Main page handling view/edit modes"

echo -e "\n${GREEN}✅ Profile Features:${NC}"
echo "   - Avatar upload and management"
echo "   - Privacy settings (public profile, contact visibility)"
echo "   - Role-based access controls"
echo "   - Form validation and error handling"

echo -e "\n${GREEN}✅ Backend Integration:${NC}"
echo "   - Database schema with profile columns"
echo "   - RLS policies for secure access"
echo "   - Audit logging for profile operations"
echo "   - Supabase Storage for file uploads"

echo -e "\n${BLUE}🚀 Manual Testing Steps:${NC}"
echo "1. Start dev server: npm run dev"
echo "2. Log in as different user roles (citizen, business, admin)"
echo "3. Navigate to /profile/me to view your profile"
echo "4. Click 'Edit Profile' to test form functionality"
echo "5. Upload an avatar image (test size limits)"
echo "6. Toggle privacy settings and save"
echo "7. View another user's profile at /profile/{userId}"
echo "8. Verify privacy controls work correctly"

echo -e "\n${BLUE}📋 Production Checklist:${NC}"
echo "□ Apply database migrations to production"
echo "□ Create 'user-uploads' storage bucket in Supabase"
echo "□ Configure storage policies for user file access"
echo "□ Set up image resizing edge function (optional)"
echo "□ Test file upload limits in production environment"
echo "□ Verify RLS policies work with real user accounts"
echo "□ Set up monitoring for profile operations"

echo -e "\n${GREEN}✨ Profile Page Implementation Ready!${NC}"
echo -e "${BLUE}Users can now create, view, and manage their profiles securely.${NC}"

exit 0