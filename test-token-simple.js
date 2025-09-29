// Simple test to verify the token is in .env.local
const fs = require('fs');

console.log('🧪 Testing .env.local file...');

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  
  if (envContent.includes('BLOB_READ_WRITE_TOKEN=')) {
    console.log('✅ BLOB_READ_WRITE_TOKEN found in .env.local');
    
    const tokenLine = envContent.split('\n').find(line => line.startsWith('BLOB_READ_WRITE_TOKEN='));
    if (tokenLine) {
      const token = tokenLine.split('=')[1];
      if (token && token !== 'vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
        console.log('✅ Token is set with actual value');
        console.log('🎯 Ready to test with: npm run dev');
      } else {
        console.log('❌ Token still has placeholder value');
      }
    }
  } else {
    console.log('❌ BLOB_READ_WRITE_TOKEN not found in .env.local');
  }
} catch (error) {
  console.error('❌ Error reading .env.local:', error.message);
}
