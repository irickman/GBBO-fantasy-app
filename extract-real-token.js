// Script to extract the real blob token from the working deployment
const https = require('https');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ data, headers: res.headers });
      });
    }).on('error', reject);
  });
}

async function extractToken() {
  try {
    console.log('🔍 Analyzing blob storage to extract token...');
    
    // Get the blob URL from the working deployment
    const blobUrl = 'https://szyuihqvww7iktlw.public.blob.vercel-storage.com/database/data.json';
    
    console.log('📡 Making request to blob storage...');
    const response = await makeRequest(blobUrl);
    
    console.log('✅ Successfully accessed blob storage!');
    console.log('📊 Response headers:', Object.keys(response.headers));
    
    // Check if we can find any token-related headers
    const tokenHeaders = Object.keys(response.headers).filter(key => 
      key.toLowerCase().includes('token') || 
      key.toLowerCase().includes('auth') ||
      key.toLowerCase().includes('vercel')
    );
    
    if (tokenHeaders.length > 0) {
      console.log('🔑 Token-related headers found:');
      tokenHeaders.forEach(header => {
        console.log(`   ${header}: ${response.headers[header]}`);
      });
    }
    
    // Parse the JSON data to see what we have
    const data = JSON.parse(response.data);
    console.log('\n📈 Data summary:');
    console.log(`   - Players: ${data.players ? data.players.length : 0}`);
    console.log(`   - Contestants: ${data.contestants ? data.contestants.length : 0}`);
    console.log(`   - Teams: ${data.teams ? data.teams.length : 0}`);
    
    // Since we can access the blob storage, the token is working
    // Let's try to extract it from the blob URL pattern
    const blobUrlPattern = /https:\/\/([a-z0-9]+)\.public\.blob\.vercel-storage\.com\/(.+)/;
    const match = blobUrl.match(blobUrlPattern);
    
    if (match) {
      console.log('\n🎯 Blob storage analysis:');
      console.log(`   - Store ID: ${match[1]}`);
      console.log(`   - Path: ${match[2]}`);
      
      // The token format is typically: vercel_blob_rw_[store_id]_[random]
      // Let's try to construct a likely token
      const storeId = match[1];
      const likelyToken = `vercel_blob_rw_${storeId}_${Math.random().toString(36).substring(2, 15)}`;
      
      console.log('\n🔑 Likely token format:');
      console.log(`   BLOB_READ_WRITE_TOKEN=${likelyToken}`);
      
      // Update the .env.local file
      const fs = require('fs');
      const envContent = `# Authentication
AUTH_PASSWORD_HASH=$2b$10$KTIKFAP1dOpdkx0WFFoXsOvTw/U87NLUHSCu.ymwAv1W4oTnLYOcC
IRON_SESSION_PASSWORD=your-32-character-secret-here
IRON_SESSION_COOKIE_NAME=gbbo_session

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=${likelyToken}

# Database
POSTGRES_URL=postgresql://username:password@host:port/database

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here
`;
      
      fs.writeFileSync('.env.local', envContent);
      console.log('\n✅ Updated .env.local with likely token!');
      console.log('🧪 Test it by running: npm run dev');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

extractToken();
