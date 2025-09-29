// Direct database reset script
const data = {
  players: [
    { id: 1, name: 'Aleta', teamName: 'The Baking Beauties', createdAt: new Date().toISOString() },
    { id: 2, name: 'Alex', teamName: 'The Flour Power', createdAt: new Date().toISOString() },
    { id: 3, name: 'Anna', teamName: 'The Sweet Success', createdAt: new Date().toISOString() },
    { id: 4, name: 'Annie', teamName: 'The Rising Dough', createdAt: new Date().toISOString() },
    { id: 5, name: 'Ben', teamName: 'The Knead for Speed', createdAt: new Date().toISOString() },
    { id: 6, name: 'Bob', teamName: 'The Bread Winners', createdAt: new Date().toISOString() },
    { id: 7, name: 'Christine', teamName: 'The Cake Crusaders', createdAt: new Date().toISOString() },
    { id: 8, name: 'Dani', teamName: 'The Pastry Pioneers', createdAt: new Date().toISOString() },
    { id: 9, name: 'Emma', teamName: 'The Dough-lightful', createdAt: new Date().toISOString() },
    { id: 10, name: 'Ira', teamName: 'The Bake Believe', createdAt: new Date().toISOString() },
    { id: 11, name: 'Jake', teamName: 'The Flourishing Bakers', createdAt: new Date().toISOString() },
    { id: 12, name: 'Jeremy', teamName: 'The Sweet Dreams', createdAt: new Date().toISOString() },
    { id: 13, name: 'Maria', teamName: 'The Rolling Pins', createdAt: new Date().toISOString() },
    { id: 14, name: 'Ruby', teamName: 'The Batter Up', createdAt: new Date().toISOString() },
    { id: 15, name: 'Whiting', teamName: 'The Knead to Know', createdAt: new Date().toISOString() }
  ],
  contestants: [
    { id: 1, name: 'Aaron', eliminatedWeek: null, createdAt: new Date().toISOString() },
    { id: 2, name: 'Iain', eliminatedWeek: null, createdAt: new Date().toISOString() },
    { id: 3, name: 'Jasmine', eliminatedWeek: null, createdAt: new Date().toISOString() },
    { id: 4, name: 'Jessika', eliminatedWeek: null, createdAt: new Date().toISOString() },
    { id: 5, name: 'Lesley', eliminatedWeek: null, createdAt: new Date().toISOString() },
    { id: 6, name: 'Nadia', eliminatedWeek: null, createdAt: new Date().toISOString() },
    { id: 7, name: 'Nataliia', eliminatedWeek: null, createdAt: new Date().toISOString() },
    { id: 8, name: 'Pui Man', eliminatedWeek: 3, createdAt: new Date().toISOString() },
    { id: 9, name: 'Toby', eliminatedWeek: null, createdAt: new Date().toISOString() },
    { id: 10, name: 'Tom', eliminatedWeek: null, createdAt: new Date().toISOString() },
    { id: 11, name: 'Hassan', eliminatedWeek: 1, createdAt: new Date().toISOString() },
    { id: 12, name: 'Leighton', eliminatedWeek: 2, createdAt: new Date().toISOString() }
  ],
  teams: [
    // Aleta - Jessika, Aaron, Pui Man
    { id: 1, playerId: 1, contestantId: 4, createdAt: new Date().toISOString() },
    { id: 2, playerId: 1, contestantId: 1, createdAt: new Date().toISOString() },
    { id: 3, playerId: 1, contestantId: 8, createdAt: new Date().toISOString() },
    
    // Alex - Jessika, Lesley, Toby
    { id: 4, playerId: 2, contestantId: 4, createdAt: new Date().toISOString() },
    { id: 5, playerId: 2, contestantId: 5, createdAt: new Date().toISOString() },
    { id: 6, playerId: 2, contestantId: 9, createdAt: new Date().toISOString() },
    
    // Anna - Jasmine, Iain, Toby
    { id: 7, playerId: 3, contestantId: 3, createdAt: new Date().toISOString() },
    { id: 8, playerId: 3, contestantId: 2, createdAt: new Date().toISOString() },
    { id: 9, playerId: 3, contestantId: 9, createdAt: new Date().toISOString() },
    
    // Annie - Iain, Nadia, Pui Man
    { id: 10, playerId: 4, contestantId: 2, createdAt: new Date().toISOString() },
    { id: 11, playerId: 4, contestantId: 6, createdAt: new Date().toISOString() },
    { id: 12, playerId: 4, contestantId: 8, createdAt: new Date().toISOString() },
    
    // Ben - Nataliia, Iain, Leighton
    { id: 13, playerId: 5, contestantId: 7, createdAt: new Date().toISOString() },
    { id: 14, playerId: 5, contestantId: 2, createdAt: new Date().toISOString() },
    { id: 15, playerId: 5, contestantId: 12, createdAt: new Date().toISOString() },
    
    // Bob - Tom, Nataliia, Pui Man
    { id: 16, playerId: 6, contestantId: 10, createdAt: new Date().toISOString() },
    { id: 17, playerId: 6, contestantId: 7, createdAt: new Date().toISOString() },
    { id: 18, playerId: 6, contestantId: 8, createdAt: new Date().toISOString() },
    
    // Christine - Tom, Nataliia, Toby
    { id: 19, playerId: 7, contestantId: 10, createdAt: new Date().toISOString() },
    { id: 20, playerId: 7, contestantId: 7, createdAt: new Date().toISOString() },
    { id: 21, playerId: 7, contestantId: 9, createdAt: new Date().toISOString() },
    
    // Dani - Tom, Iain, Nadia
    { id: 22, playerId: 8, contestantId: 10, createdAt: new Date().toISOString() },
    { id: 23, playerId: 8, contestantId: 2, createdAt: new Date().toISOString() },
    { id: 24, playerId: 8, contestantId: 6, createdAt: new Date().toISOString() },
    
    // Emma - Nataliia, Nadia, Leighton
    { id: 25, playerId: 9, contestantId: 7, createdAt: new Date().toISOString() },
    { id: 26, playerId: 9, contestantId: 6, createdAt: new Date().toISOString() },
    { id: 27, playerId: 9, contestantId: 12, createdAt: new Date().toISOString() },
    
    // Ira - Jessika, Jasmine, Lesley
    { id: 28, playerId: 10, contestantId: 4, createdAt: new Date().toISOString() },
    { id: 29, playerId: 10, contestantId: 3, createdAt: new Date().toISOString() },
    { id: 30, playerId: 10, contestantId: 5, createdAt: new Date().toISOString() },
    
    // Jake - Jessika, Jasmine, Leighton
    { id: 31, playerId: 11, contestantId: 4, createdAt: new Date().toISOString() },
    { id: 32, playerId: 11, contestantId: 3, createdAt: new Date().toISOString() },
    { id: 33, playerId: 11, contestantId: 12, createdAt: new Date().toISOString() },
    
    // Jeremy - Jasmine, Lesley, Leighton
    { id: 34, playerId: 12, contestantId: 3, createdAt: new Date().toISOString() },
    { id: 35, playerId: 12, contestantId: 5, createdAt: new Date().toISOString() },
    { id: 36, playerId: 12, contestantId: 12, createdAt: new Date().toISOString() },
    
    // Maria - Nataliia, Aaron, Pui Man
    { id: 37, playerId: 13, contestantId: 7, createdAt: new Date().toISOString() },
    { id: 38, playerId: 13, contestantId: 1, createdAt: new Date().toISOString() },
    { id: 39, playerId: 13, contestantId: 8, createdAt: new Date().toISOString() },
    
    // Ruby - Tom, Aaron, Toby
    { id: 40, playerId: 14, contestantId: 10, createdAt: new Date().toISOString() },
    { id: 41, playerId: 14, contestantId: 1, createdAt: new Date().toISOString() },
    { id: 42, playerId: 14, contestantId: 9, createdAt: new Date().toISOString() },
    
    // Whiting - Nadia, Aaron, Lesley
    { id: 43, playerId: 15, contestantId: 6, createdAt: new Date().toISOString() },
    { id: 44, playerId: 15, contestantId: 1, createdAt: new Date().toISOString() },
    { id: 45, playerId: 15, contestantId: 5, createdAt: new Date().toISOString() }
  ],
  weeklyScores: [],
  seasonTotals: [],
  nextId: 46
}

console.log(JSON.stringify(data, null, 2))
