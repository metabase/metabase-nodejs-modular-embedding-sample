#!/bin/bash
set -e

METABASE_INSTANCE_URL="${METABASE_INSTANCE_URL}"
METABASE_ADMIN_API_KEY="${METABASE_ADMIN_API_KEY}"

echo "Waiting for Metabase to be ready..."
until curl -sf "${METABASE_INSTANCE_URL}/api/health" > /dev/null 2>&1; do
  sleep 2
done
echo "Metabase is ready!"

echo "Enabling static embedding for dashboard ${DASHBOARD_ID_TO_EMBED}..."
curl -sf -X PUT "${METABASE_INSTANCE_URL}/api/dashboard/${DASHBOARD_ID_TO_EMBED}" \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: ${METABASE_ADMIN_API_KEY}" \
  -d '{"enable_embedding": true}' > /dev/null

echo "Static embedding enabled for dashboard ${DASHBOARD_ID_TO_EMBED}!"
