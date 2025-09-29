// Script to fix the corrupted blob storage data
const { put } = require('@vercel/blob');

// Complete dataset from upload-data.ts
const completeData = {
  players: [
    { id: 1, name: "Alice", teamName: "Alice's Amazing Bakes", createdAt: new Date() },
    { id: 2, name: "Bob", teamName: "Bob's Best", createdAt: new Date() },
    { id: 3, name: "Charlie", teamName: "Charlie's Champions", createdAt: new Date() },
    { id: 4, name: "Diana", teamName: "Diana's Delights", createdAt: new Date() },
    { id: 5, name: "Eve", teamName: "Eve's Excellence", createdAt: new Date() },
    { id: 6, name: "Frank", teamName: "Frank's Fabulous", createdAt: new Date() },
    { id: 7, name: "Grace", teamName: "Grace's Greats", createdAt: new Date() },
    { id: 8, name: "Henry", teamName: "Henry's Heroes", createdAt: new Date() },
    { id: 9, name: "Ivy", teamName: "Ivy's Incredible", createdAt: new Date() },
    { id: 10, name: "Jack", teamName: "Jack's Jems", createdAt: new Date() },
    { id: 11, name: "Kate", teamName: "Kate's Kreative", createdAt: new Date() },
    { id: 12, name: "Liam", teamName: "Liam's Legends", createdAt: new Date() },
    { id: 13, name: "Maya", teamName: "Maya's Marvelous", createdAt: new Date() },
    { id: 14, name: "Noah", teamName: "Noah's Notable", createdAt: new Date() },
    { id: 15, name: "Olivia", teamName: "Olivia's Outstanding", createdAt: new Date() }
  ],
  contestants: [
    { id: 1, name: "Abby", eliminatedWeek: null, createdAt: new Date() },
    { id: 2, name: "Ben", eliminatedWeek: null, createdAt: new Date() },
    { id: 3, name: "Cara", eliminatedWeek: null, createdAt: new Date() },
    { id: 4, name: "David", eliminatedWeek: null, createdAt: new Date() },
    { id: 5, name: "Emma", eliminatedWeek: null, createdAt: new Date() },
    { id: 6, name: "Felix", eliminatedWeek: null, createdAt: new Date() },
    { id: 7, name: "Gina", eliminatedWeek: null, createdAt: new Date() },
    { id: 8, name: "Harry", eliminatedWeek: null, createdAt: new Date() },
    { id: 9, name: "Iris", eliminatedWeek: null, createdAt: new Date() },
    { id: 10, name: "Jake", eliminatedWeek: null, createdAt: new Date() },
    { id: 11, name: "Kara", eliminatedWeek: null, createdAt: new Date() },
    { id: 12, name: "Leo", eliminatedWeek: null, createdAt: new Date() }
  ],
  teams: [
    // Alice's team
    { id: 1, playerId: 1, contestantId: 1, createdAt: new Date() },
    { id: 2, playerId: 1, contestantId: 2, createdAt: new Date() },
    { id: 3, playerId: 1, contestantId: 3, createdAt: new Date() },
    
    // Bob's team
    { id: 4, playerId: 2, contestantId: 4, createdAt: new Date() },
    { id: 5, playerId: 2, contestantId: 5, createdAt: new Date() },
    { id: 6, playerId: 2, contestantId: 6, createdAt: new Date() },
    
    // Charlie's team
    { id: 7, playerId: 3, contestantId: 7, createdAt: new Date() },
    { id: 8, playerId: 3, contestantId: 8, createdAt: new Date() },
    { id: 9, playerId: 3, contestantId: 9, createdAt: new Date() },
    
    // Diana's team
    { id: 10, playerId: 4, contestantId: 10, createdAt: new Date() },
    { id: 11, playerId: 4, contestantId: 11, createdAt: new Date() },
    { id: 12, playerId: 4, contestantId: 12, createdAt: new Date() }
  ],
  weeklyScores: [],
  seasonTotals: [],
  nextId: 16
};

async function fixBlobData() {
  try {
    console.log('🔧 Fixing corrupted blob storage data...');
    
    // Upload the complete dataset
    const result = await put('database/data.json', JSON.stringify(completeData, null, 2), {
      access: 'public',
      addRandomSuffix: false
    });
    
    console.log('✅ Successfully uploaded complete dataset!');
    console.log('📊 Data summary:');
    console.log(`   - Players: ${completeData.players.length}`);
    console.log(`   - Contestants: ${completeData.contestants.length}`);
    console.log(`   - Teams: ${completeData.teams.length}`);
    console.log('🌐 Blob URL:', result.url);
    
    // Verify the upload
    const response = await fetch(result.url);
    const uploadedData = await response.json();
    
    console.log('\n🧪 Verification:');
    console.log(`   - Players uploaded: ${uploadedData.players.length}`);
    console.log(`   - Contestants uploaded: ${uploadedData.contestants.length}`);
    console.log(`   - Teams uploaded: ${uploadedData.teams.length}`);
    
    if (uploadedData.players.length === 15 && uploadedData.contestants.length === 12) {
      console.log('\n🎉 SUCCESS! Blob storage is now fixed with complete data!');
      console.log('🧪 Test the UI at: http://localhost:3002/admin/teams');
    } else {
      console.log('\n❌ Upload verification failed');
    }
    
  } catch (error) {
    console.error('❌ Error fixing blob data:', error.message);
  }
}

fixBlobData();
