// Test script to verify local blob connection
const https = require('https');

// Simple test without requiring the full blob SDK
function testBlobAccess() {
  console.log('🧪 Testing blob storage access...');
  
  // Test if we can access the public blob URL
  https.get('https://szyuihqvww7iktlw.public.blob.vercel-storage.com/database/data.json', (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('✅ Successfully accessed blob storage!');
        console.log('📊 Data summary:');
        console.log(`   - Players: ${jsonData.players ? jsonData.players.length : 0}`);
        console.log(`   - Contestants: ${jsonData.contestants ? jsonData.contestants.length : 0}`);
        console.log(`   - Teams: ${jsonData.teams ? jsonData.teams.length : 0}`);
        console.log(`   - Weekly Scores: ${jsonData.weeklyScores ? jsonData.weeklyScores.length : 0}`);
        console.log(`   - Season Totals: ${jsonData.seasonTotals ? jsonData.seasonTotals.length : 0}`);
        
        if (jsonData.players && jsonData.players.length > 0) {
          console.log('\n👥 Sample players:');
          jsonData.players.slice(0, 3).forEach(player => {
            console.log(`   - ${player.name} (${player.teamName})`);
          });
        }
        
        console.log('\n🎯 The blob storage is working and contains data!');
        console.log('💡 To use it locally, you need the BLOB_READ_WRITE_TOKEN in your .env.local file');
        
      } catch (e) {
        console.error('❌ Error parsing blob data:', e.message);
      }
    });
  }).on('error', (err) => {
    console.error('❌ Error accessing blob storage:', err.message);
  });
}

testBlobAccess();
