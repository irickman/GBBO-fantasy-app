// Test script to verify the extracted token works
require('dotenv').config({ path: '.env.local' });

console.log('🧪 Testing extracted blob token...');
console.log('Token:', process.env.BLOB_READ_WRITE_TOKEN ? 'Set' : 'Not set');

if (process.env.BLOB_READ_WRITE_TOKEN) {
  console.log('✅ Token is set in environment!');
  console.log('🎯 Ready to test with: npm run dev');
} else {
  console.log('❌ Token not found in environment');
}
