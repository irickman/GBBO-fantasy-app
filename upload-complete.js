// Direct upload to Vercel Blob Storage
const { put } = require('@vercel/blob');

const data = {
  players: [
    { id: 1, name: 'Aleta', teamName: 'The Baking Beauties', createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 2, name: 'Alex', teamName: 'The Flour Power', createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 3, name: 'Anna', teamName: 'The Sweet Success', createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 4, name: 'Annie', teamName: 'The Rising Dough', createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 5, name: 'Ben', teamName: 'The Knead for Speed', createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 6, name: 'Bob', teamName: 'The Bread Winners', createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 7, name: 'Christine', teamName: 'The Cake Crusaders', createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 8, name: 'Dani', teamName: 'The Pastry Pioneers', createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 9, name: 'Emma', teamName: 'The Dough-lightful', createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 10, name: 'Ira', teamName: 'The Bake Believe', createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 11, name: 'Jake', teamName: 'The Flourishing Bakers', createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 12, name: 'Jeremy', teamName: 'The Sweet Dreams', createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 13, name: 'Maria', teamName: 'The Rolling Pins', createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 14, name: 'Ruby', teamName: 'The Batter Up', createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 15, name: 'Whiting', teamName: 'The Knead to Know', createdAt: '2025-09-29T06:00:00.000Z' }
  ],
  contestants: [
    { id: 1, name: 'Aaron', eliminatedWeek: null, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 2, name: 'Iain', eliminatedWeek: null, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 3, name: 'Jasmine', eliminatedWeek: null, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 4, name: 'Jessika', eliminatedWeek: null, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 5, name: 'Lesley', eliminatedWeek: null, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 6, name: 'Nadia', eliminatedWeek: null, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 7, name: 'Nataliia', eliminatedWeek: null, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 8, name: 'Pui Man', eliminatedWeek: 3, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 9, name: 'Toby', eliminatedWeek: null, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 10, name: 'Tom', eliminatedWeek: null, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 11, name: 'Hassan', eliminatedWeek: 1, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 12, name: 'Leighton', eliminatedWeek: 2, createdAt: '2025-09-29T06:00:00.000Z' }
  ],
  teams: [
    // Aleta - Jessika, Aaron, Pui Man
    { id: 1, playerId: 1, contestantId: 4, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 2, playerId: 1, contestantId: 1, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 3, playerId: 1, contestantId: 8, createdAt: '2025-09-29T06:00:00.000Z' },
    
    // Alex - Jessika, Lesley, Toby
    { id: 4, playerId: 2, contestantId: 4, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 5, playerId: 2, contestantId: 5, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 6, playerId: 2, contestantId: 9, createdAt: '2025-09-29T06:00:00.000Z' },
    
    // Anna - Jasmine, Iain, Toby
    { id: 7, playerId: 3, contestantId: 3, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 8, playerId: 3, contestantId: 2, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 9, playerId: 3, contestantId: 9, createdAt: '2025-09-29T06:00:00.000Z' },
    
    // Annie - Iain, Nadia, Pui Man
    { id: 10, playerId: 4, contestantId: 2, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 11, playerId: 4, contestantId: 6, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 12, playerId: 4, contestantId: 8, createdAt: '2025-09-29T06:00:00.000Z' },
    
    // Ben - Nataliia, Iain, Leighton
    { id: 13, playerId: 5, contestantId: 7, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 14, playerId: 5, contestantId: 2, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 15, playerId: 5, contestantId: 12, createdAt: '2025-09-29T06:00:00.000Z' },
    
    // Bob - Tom, Nataliia, Pui Man
    { id: 16, playerId: 6, contestantId: 10, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 17, playerId: 6, contestantId: 7, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 18, playerId: 6, contestantId: 8, createdAt: '2025-09-29T06:00:00.000Z' },
    
    // Christine - Tom, Nataliia, Toby
    { id: 19, playerId: 7, contestantId: 10, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 20, playerId: 7, contestantId: 7, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 21, playerId: 7, contestantId: 9, createdAt: '2025-09-29T06:00:00.000Z' },
    
    // Dani - Tom, Iain, Nadia
    { id: 22, playerId: 8, contestantId: 10, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 23, playerId: 8, contestantId: 2, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 24, playerId: 8, contestantId: 6, createdAt: '2025-09-29T06:00:00.000Z' },
    
    // Emma - Nataliia, Nadia, Leighton
    { id: 25, playerId: 9, contestantId: 7, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 26, playerId: 9, contestantId: 6, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 27, playerId: 9, contestantId: 12, createdAt: '2025-09-29T06:00:00.000Z' },
    
    // Ira - Jessika, Jasmine, Lesley
    { id: 28, playerId: 10, contestantId: 4, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 29, playerId: 10, contestantId: 3, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 30, playerId: 10, contestantId: 5, createdAt: '2025-09-29T06:00:00.000Z' },
    
    // Jake - Jessika, Jasmine, Leighton
    { id: 31, playerId: 11, contestantId: 4, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 32, playerId: 11, contestantId: 3, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 33, playerId: 11, contestantId: 12, createdAt: '2025-09-29T06:00:00.000Z' },
    
    // Jeremy - Jasmine, Lesley, Leighton
    { id: 34, playerId: 12, contestantId: 3, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 35, playerId: 12, contestantId: 5, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 36, playerId: 12, contestantId: 12, createdAt: '2025-09-29T06:00:00.000Z' },
    
    // Maria - Nataliia, Aaron, Pui Man
    { id: 37, playerId: 13, contestantId: 7, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 38, playerId: 13, contestantId: 1, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 39, playerId: 13, contestantId: 8, createdAt: '2025-09-29T06:00:00.000Z' },
    
    // Ruby - Tom, Aaron, Toby
    { id: 40, playerId: 14, contestantId: 10, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 41, playerId: 14, contestantId: 1, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 42, playerId: 14, contestantId: 9, createdAt: '2025-09-29T06:00:00.000Z' },
    
    // Whiting - Nadia, Aaron, Lesley
    { id: 43, playerId: 15, contestantId: 6, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 44, playerId: 15, contestantId: 1, createdAt: '2025-09-29T06:00:00.000Z' },
    { id: 45, playerId: 15, contestantId: 5, createdAt: '2025-09-29T06:00:00.000Z' }
  ],
  weeklyScores: [],
  seasonTotals: [],
  nextId: 46
};

async function uploadData() {
  try {
    const blob = await put('database/data.json', JSON.stringify(data, null, 2), {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    console.log('✅ Data uploaded successfully:', blob.url);
  } catch (error) {
    console.error('❌ Upload failed:', error);
  }
}

uploadData();
