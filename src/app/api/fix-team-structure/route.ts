import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

// Correct data structure: One team per player with multiple contestants
const correctData = {
  players: [
    { id: 1, name: 'Aleta', teamName: 'The Baking Beauties', createdAt: new Date() },
    { id: 2, name: 'Alex', teamName: 'The Flour Power', createdAt: new Date() },
    { id: 3, name: 'Anna', teamName: 'The Sweet Success', createdAt: new Date() },
    { id: 4, name: 'Annie', teamName: 'The Rising Dough', createdAt: new Date() },
    { id: 5, name: 'Ben', teamName: 'The Knead for Speed', createdAt: new Date() },
    { id: 6, name: 'Bob', teamName: 'The Bread Winners', createdAt: new Date() },
    { id: 7, name: 'Christine', teamName: 'The Cake Crusaders', createdAt: new Date() },
    { id: 8, name: 'Dani', teamName: 'The Pastry Pioneers', createdAt: new Date() },
    { id: 9, name: 'Emma', teamName: 'The Dough-lightful', createdAt: new Date() },
    { id: 10, name: 'Ira', teamName: 'The Bake Believe', createdAt: new Date() },
    { id: 11, name: 'Jake', teamName: 'The Flourishing Bakers', createdAt: new Date() },
    { id: 12, name: 'Jeremy', teamName: 'The Sweet Dreams', createdAt: new Date() },
    { id: 13, name: 'Maria', teamName: 'The Rolling Pins', createdAt: new Date() },
    { id: 14, name: 'Ruby', teamName: 'The Batter Up', createdAt: new Date() },
    { id: 15, name: 'Whiting', teamName: 'The Knead to Know', createdAt: new Date() }
  ],
  contestants: [
    { id: 1, name: 'Aaron', eliminatedWeek: null, createdAt: new Date() },
    { id: 2, name: 'Iain', eliminatedWeek: null, createdAt: new Date() },
    { id: 3, name: 'Jasmine', eliminatedWeek: null, createdAt: new Date() },
    { id: 4, name: 'Jessika', eliminatedWeek: null, createdAt: new Date() },
    { id: 5, name: 'Lesley', eliminatedWeek: null, createdAt: new Date() },
    { id: 6, name: 'Nadia', eliminatedWeek: null, createdAt: new Date() },
    { id: 7, name: 'Nataliia', eliminatedWeek: null, createdAt: new Date() },
    { id: 8, name: 'Pui Man', eliminatedWeek: 3, createdAt: new Date() },
    { id: 9, name: 'Toby', eliminatedWeek: null, createdAt: new Date() },
    { id: 10, name: 'Tom', eliminatedWeek: null, createdAt: new Date() },
    { id: 11, name: 'Hassan', eliminatedWeek: 1, createdAt: new Date() },
    { id: 12, name: 'Leighton', eliminatedWeek: 2, createdAt: new Date() }
  ],
  teams: [
    // Each player has ONE team with multiple contestants
    { id: 1, playerId: 1, contestantIds: [4, 1, 8], createdAt: new Date() }, // Aleta: Jessika, Aaron, Pui Man
    { id: 2, playerId: 2, contestantIds: [4, 5, 9], createdAt: new Date() }, // Alex: Jessika, Lesley, Toby
    { id: 3, playerId: 3, contestantIds: [3, 2, 9], createdAt: new Date() }, // Anna: Jasmine, Iain, Toby
    { id: 4, playerId: 4, contestantIds: [2, 6, 8], createdAt: new Date() }, // Annie: Iain, Nadia, Pui Man
    { id: 5, playerId: 5, contestantIds: [7, 2, 12], createdAt: new Date() }, // Ben: Nataliia, Iain, Leighton
    { id: 6, playerId: 6, contestantIds: [10, 7, 8], createdAt: new Date() }, // Bob: Tom, Nataliia, Pui Man
    { id: 7, playerId: 7, contestantIds: [10, 7, 9], createdAt: new Date() }, // Christine: Tom, Nataliia, Toby
    { id: 8, playerId: 8, contestantIds: [10, 2, 6], createdAt: new Date() }, // Dani: Tom, Iain, Nadia
    { id: 9, playerId: 9, contestantIds: [7, 6, 12], createdAt: new Date() }, // Emma: Nataliia, Nadia, Leighton
    { id: 10, playerId: 10, contestantIds: [4, 3, 5], createdAt: new Date() }, // Ira: Jessika, Jasmine, Lesley
    { id: 11, playerId: 11, contestantIds: [4, 3, 12], createdAt: new Date() }, // Jake: Jessika, Jasmine, Leighton
    { id: 12, playerId: 12, contestantIds: [3, 5, 12], createdAt: new Date() }, // Jeremy: Jasmine, Lesley, Leighton
    { id: 13, playerId: 13, contestantIds: [7, 1, 8], createdAt: new Date() }, // Maria: Nataliia, Aaron, Pui Man
    { id: 14, playerId: 14, contestantIds: [10, 1, 9], createdAt: new Date() }, // Ruby: Tom, Aaron, Toby
    { id: 15, playerId: 15, contestantIds: [6, 1, 5], createdAt: new Date() }  // Whiting: Nadia, Aaron, Lesley
  ],
  weeklyScores: [],
  seasonTotals: [],
  nextId: 16
}

export async function POST() {
  try {
    console.log('🔧 Fixing team structure - one team per player...')
    
    // Upload the corrected data structure
    const result = await put('database/data.json', JSON.stringify(correctData, null, 2), {
      access: 'public',
      addRandomSuffix: false
    })
    
    console.log('✅ Successfully fixed team structure!')
    console.log('📊 Corrected data summary:')
    console.log(`   - Players: ${correctData.players.length}`)
    console.log(`   - Contestants: ${correctData.contestants.length}`)
    console.log(`   - Teams: ${correctData.teams.length} (one per player)`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Team structure fixed - one team per player',
      data: {
        players: correctData.players.length,
        contestants: correctData.contestants.length,
        teams: correctData.teams.length,
        blobUrl: result.url
      }
    })
    
  } catch (error) {
    console.error('❌ Error fixing team structure:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
