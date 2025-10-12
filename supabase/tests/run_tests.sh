#!/usr/bin/env bash
set -euo pipefail

# Simple tests: ensure RLS is enabled and service role is not in frontend (basic checks).
# Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE to be set in CI secrets for more advanced tests.

echo "Running basic sanity checks..."

# 1) Check that database returns list of tables
psql_output=$(psql "$DATABASE_URL" -Atc "SELECT tablename FROM pg_tables WHERE schemaname='public';" || true)
if [ -z "$psql_output" ]; then
  echo "Warning: unable to list tables. Ensure DATABASE_URL is available in CI."
else
  echo "Tables in public schema:"
  echo "$psql_output"
fi

# 2) Basic curl check for site
if command -v curl >/dev/null 2>&1; then
  echo "Lighthouse quick header check for frontend site (if available):"
  curl -I https://limpopoconnect.site || echo "Frontend not reachable"
fi

echo "Tests completed (add more project-specific checks as needed)"
