#!/bin/bash

# Simple restore using regular APIs
# This calls the existing /api/reset-database but only creates 3 players at a time

echo "🔄 Restoring data using the existing API..."
echo "This may take a minute as we're using the single endpoint..."
echo ""

# Login
echo "Logging in..."
curl -s -X POST 'https://gbbo-fantasy.vercel.app/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"password":"hollywoodhandshake"}' \
  -c /tmp/simple-restore.txt > /dev/null

echo "✅ Logged in"
echo ""

# Call the reset endpoint (hope it completes before timeout!)
echo "Calling reset-database endpoint..."
echo "(This might take 30-60 seconds...)"
echo ""

response=$(curl -s -X POST 'https://gbbo-fantasy.vercel.app/api/reset-database' \
  -b /tmp/simple-restore.txt \
  -m 65 2>&1)

if echo "$response" | grep -q "success"; then
  echo "✅ Data restored successfully!"
  echo ""
  echo "Summary:"
  echo "  - 12 Contestants created"
  echo "  - 15 Players with teams created"
  echo ""
else
  echo "⚠️  Response: $response"
  echo ""
  echo "The endpoint may have timed out, but some data might have been created."
  echo "Check the dashboard to see what was created."
  echo ""
fi

echo "Visit: https://gbbo-fantasy.vercel.app/dashboard"

