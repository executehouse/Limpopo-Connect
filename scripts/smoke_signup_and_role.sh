#!/usr/bin/env bash
set -euo pipefail

# env: SUPABASE_URL, SUPABASE_ANON_KEY, TEST_USER_EMAIL, TEST_USER_PASSWORD
if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_ANON_KEY:-}" ]; then
  echo "Set SUPABASE_URL and SUPABASE_ANON_KEY"
  exit 1
fi

EMAIL="${TEST_USER_EMAIL:-test+signup@example.com}"
PASSWORD="${TEST_USER_PASSWORD:-Test12345!}"

echo "Signing up test user $EMAIL"

# 1) sign up
RESP=$(curl -s -X POST "${SUPABASE_URL}/auth/v1/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

echo "Signup response: $RESP"

# 2) wait a few seconds for webhook to process
sleep 3

# 3) sign in to get token
LOGIN=$(curl -s -X POST "${SUPABASE_URL}/auth/v1/token?grant_type=password" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

ACCESS_TOKEN=$(echo "$LOGIN" | jq -r .access_token)

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" == "null" ]; then
  echo "Failed to get access token. Response: $LOGIN"
  exit 1
fi

echo "Got access token."

# 4) Call RPC get_my_role
ROLE=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/get_my_role" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{}' | jq -r .)

echo "get_my_role response: $ROLE"

# 5) Query profiles to confirm role was set (requires anon key to allow select via RLS or admin)
PROFILE=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/profiles?id=eq.${USER_ID:-}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "apikey: ${SUPABASE_ANON_KEY}")

echo "Profile: $PROFILE"

echo "Smoke test complete"