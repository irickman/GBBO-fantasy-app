// Script to extract blob token from working deployment
const https = require('https');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function extractToken() {
  try {
    console.log('Testing deployed blob storage...');
    
    // Test the deployed API
    const result = await makeRequest('https://gbbo-fantasy.vercel.app/api/test-blob');
    console.log('Deployed blob test result:', result);
    
    if (result.success && result.blobs && result.blobs.length > 0) {
      console.log('\n✅ Blob storage is working on deployment!');
      console.log('Found blobs:', result.blobs);
      console.log('Test blob URL:', result.testBlobUrl);
      
      // The token is working on deployment, we just need to set it locally
      console.log('\n📝 To set up locally, you need to:');
      console.log('1. Go to https://vercel.com/dashboard');
      console.log('2. Find your gbbo-fantasy project');
      console.log('3. Go to Settings > Environment Variables');
      console.log('4. Copy the BLOB_READ_WRITE_TOKEN value');
      console.log('5. Create .env.local with: BLOB_READ_WRITE_TOKEN=your_token_here');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

extractToken();
