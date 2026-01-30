#!/bin/bash
set -e

echo "Waiting for Metabase to be ready..."
until curl -sf "${MB_INSTANCE_URL}/api/health" > /dev/null 2>&1; do
  sleep 2
done
echo "Metabase is ready!"

echo "Getting session token..."
SESSION_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"${MB_ADMIN_EMAIL}\", \"password\": \"${MB_ADMIN_PASSWORD}\"}" \
  "${MB_INSTANCE_URL}/api/session")

SESSION_ID=$(echo "$SESSION_RESPONSE" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')

if [ -z "$SESSION_ID" ]; then
  echo "Failed to get session token. Response: $SESSION_RESPONSE"
  exit 1
fi

echo "Enabling static embedding for dashboard ${MB_DASHBOARD_ID_TO_EMBED}..."
RESPONSE=$(curl -s -X PUT "${MB_INSTANCE_URL}/api/dashboard/${MB_DASHBOARD_ID_TO_EMBED}" \
  -H "Content-Type: application/json" \
  -H "X-Metabase-Session: ${SESSION_ID}" \
  -d '{"enable_embedding": true}')

if echo "$RESPONSE" | grep -q '"error"'; then
  echo "Failed to enable embedding. Response: $RESPONSE"
  exit 1
fi

echo "Static embedding enabled for dashboard ${MB_DASHBOARD_ID_TO_EMBED}!"
