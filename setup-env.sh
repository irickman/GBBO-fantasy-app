#!/bin/bash

echo "🚀 Setting up GBBO Fantasy environment variables..."

# Create .env.local file
cat > .env.local << 'EOF'
# Authentication
AUTH_PASSWORD_HASH=$2b$10$KTIKFAP1dOpdkx0WFFoXsOvTw/U87NLUHSCu.ymwAv1W4oTnLYOcC
IRON_SESSION_PASSWORD=your-32-character-secret-here
IRON_SESSION_COOKIE_NAME=gbbo_session

# Vercel Blob Storage
# Replace the token below with your actual BLOB_READ_WRITE_TOKEN from Vercel dashboard
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Database
POSTGRES_URL=postgresql://username:password@host:port/database

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here
EOF

echo "✅ Created .env.local file"
echo ""
echo "📝 NEXT STEPS:"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Find your 'gbbo-fantasy' project"
echo "3. Go to Settings > Environment Variables"
echo "4. Copy the BLOB_READ_WRITE_TOKEN value"
echo "5. Replace 'vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' in .env.local with your actual token"
echo ""
echo "🔧 To get the token automatically, you can also try:"
echo "   - Install Vercel CLI: npm install -g vercel"
echo "   - Run: vercel env pull"
echo ""
echo "🧪 Test the setup by running: npm run dev"
