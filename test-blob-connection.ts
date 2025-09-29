// Test script to verify Vercel Blob connection
import { list } from '@vercel/blob';

async function testConnection() {
  try {
    console.log('Testing Vercel Blob connection...');
    console.log('BLOB_READ_WRITE_TOKEN:', process.env.BLOB_READ_WRITE_TOKEN ? 'Set' : 'Not set');
    
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.log('Please set BLOB_READ_WRITE_TOKEN environment variable');
      console.log('You can get this from your Vercel dashboard -> Project Settings -> Environment Variables');
      console.log('');
      console.log('To set it locally, create a .env.local file with:');
      console.log('BLOB_READ_WRITE_TOKEN=your_token_here');
      return;
    }
    
    const { blobs } = await list();
    console.log('Connection successful! Found', blobs.length, 'blobs');
    
    if (blobs.length > 0) {
      console.log('First few blobs:');
      blobs.slice(0, 3).forEach((blob, index) => {
        console.log(`${index + 1}. ${blob.pathname} (${blob.size} bytes)`);
      });
    }
  } catch (error) {
    console.error('Connection failed:', error instanceof Error ? error.message : 'Unknown error');
  }
}

testConnection();
