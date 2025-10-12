#!/bin/bash

# ============================================
# LIMPOPO CONNECT - SUPABASE QUICK SETUP
# ============================================

echo "🚀 Limpopo Connect - Supabase Configuration"
echo "==========================================="

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found!"
    echo "Please create .env.local with your Supabase credentials."
    exit 1
fi

# Load environment variables
source .env.local

# Check if Supabase variables are set
if [[ -z "$VITE_SUPABASE_URL" || "$VITE_SUPABASE_URL" == "https://your-project-id.supabase.co" ]]; then
    echo "❌ VITE_SUPABASE_URL not configured in .env.local"
    echo ""
    echo "📋 TO FIX THIS:"
    echo "1. Go to https://app.supabase.com"
    echo "2. Create a new project (or select existing)"
    echo "3. Go to Settings → API"
    echo "4. Copy the Project URL and anon public key"
    echo "5. Update .env.local with real values"
    echo ""
    echo "Example .env.local:"
    echo "VITE_SUPABASE_URL=https://abcdefg.supabase.co"
    echo "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs..."
    exit 1
fi

if [[ -z "$VITE_SUPABASE_ANON_KEY" || "$VITE_SUPABASE_ANON_KEY" == "your-anon-public-key-here" ]]; then
    echo "❌ VITE_SUPABASE_ANON_KEY not configured in .env.local"
    echo "Please update .env.local with your real Supabase anon key"
    exit 1
fi

echo "✅ Environment variables configured"
echo "   URL: $VITE_SUPABASE_URL"
echo "   Key: ${VITE_SUPABASE_ANON_KEY:0:20}..."

# Test Supabase connection
echo ""
echo "🔍 Testing Supabase connection..."
node scripts/validate-supabase.mjs

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUPABASE SETUP COMPLETE!"
    echo ""
    echo "📋 NEXT STEPS:"
    echo "1. Run database setup (if not done yet):"
    echo "   → Copy supabase/setup-database.sql"
    echo "   → Paste in Supabase Dashboard → SQL Editor"
    echo "   → Click 'Run'"
    echo ""
    echo "2. For production deployment:"
    echo "   → Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
    echo "   → In Vercel Dashboard → Settings → Environment Variables"
    echo ""
    echo "3. Start development:"
    echo "   → npm run dev"
    echo ""
    echo "🎉 Your Limpopo Connect app is ready!"
else
    echo ""
    echo "❌ Supabase connection failed"
    echo "Please check your credentials and try again"
    exit 1
fi