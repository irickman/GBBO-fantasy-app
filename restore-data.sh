#!/bin/bash

# Script to restore all data in batches
# Usage: bash restore-data.sh

echo "🔄 Starting data restoration in batches..."
echo ""

# Login and get session
echo "1. Logging in..."
curl -s -X POST 'https://gbbo-fantasy.vercel.app/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"password":"hollywoodhandshake"}' \
  -c /tmp/gbbo-restore-cookies.txt > /dev/null

if [ $? -ne 0 ]; then
  echo "❌ Login failed!"
  exit 1
fi
echo "✅ Logged in successfully"
echo ""

# Step 1: Clear data
echo "2. Clearing old data..."
response=$(curl -s -X POST 'https://gbbo-fantasy.vercel.app/api/restore-data-batch' \
  -H 'Content-Type: application/json' \
  -d '{"step":"clear"}' \
  -b /tmp/gbbo-restore-cookies.txt)
echo "$response" | jq -r '.message'
echo ""

# Step 2: Create contestants
echo "3. Creating contestants..."
response=$(curl -s -X POST 'https://gbbo-fantasy.vercel.app/api/restore-data-batch' \
  -H 'Content-Type: application/json' \
  -d '{"step":"contestants"}' \
  -b /tmp/gbbo-restore-cookies.txt)
echo "$response" | jq -r '.message'
echo ""

# Step 3a: Create players 1-5
echo "4. Creating players batch 1 (1-5)..."
response=$(curl -s -X POST 'https://gbbo-fantasy.vercel.app/api/restore-data-batch' \
  -H 'Content-Type: application/json' \
  -d '{"step":"players-1"}' \
  -b /tmp/gbbo-restore-cookies.txt)
echo "$response" | jq -r '.message'
players=$(echo "$response" | jq -r '.players[]')
echo "  Players: $players"
echo ""

# Step 3b: Create players 6-10
echo "5. Creating players batch 2 (6-10)..."
response=$(curl -s -X POST 'https://gbbo-fantasy.vercel.app/api/restore-data-batch' \
  -H 'Content-Type: application/json' \
  -d '{"step":"players-2"}' \
  -b /tmp/gbbo-restore-cookies.txt)
echo "$response" | jq -r '.message'
players=$(echo "$response" | jq -r '.players[]')
echo "  Players: $players"
echo ""

# Step 3c: Create players 11-15
echo "6. Creating players batch 3 (11-15)..."
response=$(curl -s -X POST 'https://gbbo-fantasy.vercel.app/api/restore-data-batch' \
  -H 'Content-Type: application/json' \
  -d '{"step":"players-3"}' \
  -b /tmp/gbbo-restore-cookies.txt)
echo "$response" | jq -r '.message'
players=$(echo "$response" | jq -r '.players[]')
echo "  Players: $players"
echo ""

echo "🎉 Data restoration complete!"
echo ""
echo "Summary:"
echo "  - 12 Contestants"
echo "  - 15 Players with teams"
echo "  - 45 Team assignments"
echo ""
echo "Visit: https://gbbo-fantasy.vercel.app/dashboard"

