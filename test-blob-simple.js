// Simple test script for blob storage
const { put, head } = require('@vercel/blob');

async function testBlobStorage() {
  try {
    console.log('Testing blob storage...');
    
    // Test data
    const testData = {
      players: [
        { id: 1, name: 'Test Player', teamName: 'Test Team', createdAt: new Date() }
      ],
      contestants: [
        { id: 1, name: 'Test Contestant', eliminatedWeek: null, createdAt: new Date() }
      ],
      teams: [],
      weeklyScores: [],
      seasonTotals: [],
      nextId: 2
    };
    
    console.log('Uploading test data...');
    const result = await put('database/data.json', JSON.stringify(testData, null, 2), {
      access: 'public',
      addRandomSuffix: false
    });
    
    console.log('Upload successful:', result.url);
    
    // Test reading the data
    console.log('Testing data retrieval...');
    const blobInfo = await head('database/data.json');
    console.log('Blob info:', blobInfo);
    
    const response = await fetch(blobInfo.url);
    const data = await response.json();
    console.log('Retrieved data:', data);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testBlobStorage();
