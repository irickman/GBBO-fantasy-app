import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

// Correct data from upload-data.ts
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
    // Aleta's team: Jessika, Aaron, Pui Man
    { id: 1, playerId: 1, contestantId: 4, createdAt: new Date() },
    { id: 2, playerId: 1, contestantId: 1, createdAt: new Date() },
    { id: 3, playerId: 1, contestantId: 8, createdAt: new Date() },
    
    // Alex's team: Jessika, Lesley, Toby
    { id: 4, playerId: 2, contestantId: 4, createdAt: new Date() },
    { id: 5, playerId: 2, contestantId: 5, createdAt: new Date() },
    { id: 6, playerId: 2, contestantId: 9, createdAt: new Date() },
    
    // Anna's team: Jasmine, Iain, Toby
    { id: 7, playerId: 3, contestantId: 3, createdAt: new Date() },
    { id: 8, playerId: 3, contestantId: 2, createdAt: new Date() },
    { id: 9, playerId: 3, contestantId: 9, createdAt: new Date() },
    
    // Annie's team: Iain, Nadia, Pui Man
    { id: 10, playerId: 4, contestantId: 2, createdAt: new Date() },
    { id: 11, playerId: 4, contestantId: 6, createdAt: new Date() },
    { id: 12, playerId: 4, contestantId: 8, createdAt: new Date() },
    
    // Ben's team: Nataliia, Iain, Leighton
    { id: 13, playerId: 5, contestantId: 7, createdAt: new Date() },
    { id: 14, playerId: 5, contestantId: 2, createdAt: new Date() },
    { id: 15, playerId: 5, contestantId: 12, createdAt: new Date() },
    
    // Bob's team: Tom, Nataliia, Pui Man
    { id: 16, playerId: 6, contestantId: 10, createdAt: new Date() },
    { id: 17, playerId: 6, contestantId: 7, createdAt: new Date() },
    { id: 18, playerId: 6, contestantId: 8, createdAt: new Date() },
    
    // Christine's team: Tom, Nataliia, Toby
    { id: 19, playerId: 7, contestantId: 10, createdAt: new Date() },
    { id: 20, playerId: 7, contestantId: 7, createdAt: new Date() },
    { id: 21, playerId: 7, contestantId: 9, createdAt: new Date() },
    
    // Dani's team: Tom, Iain, Nadia
    { id: 22, playerId: 8, contestantId: 10, createdAt: new Date() },
    { id: 23, playerId: 8, contestantId: 2, createdAt: new Date() },
    { id: 24, playerId: 8, contestantId: 6, createdAt: new Date() },
    
    // Emma's team: Nataliia, Nadia, Leighton
    { id: 25, playerId: 9, contestantId: 7, createdAt: new Date() },
    { id: 26, playerId: 9, contestantId: 6, createdAt: new Date() },
    { id: 27, playerId: 9, contestantId: 12, createdAt: new Date() },
    
    // Ira's team: Jessika, Jasmine, Lesley
    { id: 28, playerId: 10, contestantId: 4, createdAt: new Date() },
    { id: 29, playerId: 10, contestantId: 3, createdAt: new Date() },
    { id: 30, playerId: 10, contestantId: 5, createdAt: new Date() },
    
    // Jake's team: Jessika, Jasmine, Leighton
    { id: 31, playerId: 11, contestantId: 4, createdAt: new Date() },
    { id: 32, playerId: 11, contestantId: 3, createdAt: new Date() },
    { id: 33, playerId: 11, contestantId: 12, createdAt: new Date() },
    
    // Jeremy's team: Jasmine, Lesley, Leighton
    { id: 34, playerId: 12, contestantId: 3, createdAt: new Date() },
    { id: 35, playerId: 12, contestantId: 5, createdAt: new Date() },
    { id: 36, playerId: 12, contestantId: 12, createdAt: new Date() },
    
    // Maria's team: Nataliia, Aaron, Pui Man
    { id: 37, playerId: 13, contestantId: 7, createdAt: new Date() },
    { id: 38, playerId: 13, contestantId: 1, createdAt: new Date() },
    { id: 39, playerId: 13, contestantId: 8, createdAt: new Date() },
    
    // Ruby's team: Tom, Aaron, Toby
    { id: 40, playerId: 14, contestantId: 10, createdAt: new Date() },
    { id: 41, playerId: 14, contestantId: 1, createdAt: new Date() },
    { id: 42, playerId: 14, contestantId: 9, createdAt: new Date() },
    
    // Whiting's team: Nadia, Aaron, Lesley
    { id: 43, playerId: 15, contestantId: 6, createdAt: new Date() },
    { id: 44, playerId: 15, contestantId: 1, createdAt: new Date() },
    { id: 45, playerId: 15, contestantId: 5, createdAt: new Date() }
  ],
  weeklyScores: [],
  seasonTotals: [],
  nextId: 46
}

export async function POST() {
  try {
    console.log('🔧 Uploading correct data to blob storage...')
    
    // Upload the correct data
    const result = await put('database/data.json', JSON.stringify(correctData, null, 2), {
      access: 'public',
      addRandomSuffix: false
    })
    
    console.log('✅ Successfully uploaded correct data!')
    console.log('📊 Data summary:')
    console.log(`   - Players: ${correctData.players.length}`)
    console.log(`   - Contestants: ${correctData.contestants.length}`)
    console.log(`   - Teams: ${correctData.teams.length}`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Data uploaded successfully',
      data: {
        players: correctData.players.length,
        contestants: correctData.contestants.length,
        teams: correctData.teams.length,
        blobUrl: result.url
      }
    })
    
  } catch (error) {
    console.error('❌ Error uploading data:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
