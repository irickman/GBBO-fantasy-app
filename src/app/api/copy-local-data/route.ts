import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

// This is the exact data from your working local environment
const workingData = {
  players: [
    { id: 1, name: 'Aleta', teamName: 'The Baking Beauties', createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 2, name: 'Alex', teamName: 'The Flour Power', createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 3, name: 'Anna', teamName: 'The Sweet Success', createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 4, name: 'Annie', teamName: 'The Rising Dough', createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 5, name: 'Ben', teamName: 'The Knead for Speed', createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 6, name: 'Bob', teamName: 'The Bread Winners', createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 7, name: 'Christine', teamName: 'The Cake Crusaders', createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 8, name: 'Dani', teamName: 'The Pastry Pioneers', createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 9, name: 'Emma', teamName: 'The Dough-lightful', createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 10, name: 'Ira', teamName: 'The Bake Believe', createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 11, name: 'Jake', teamName: 'The Flourishing Bakers', createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 12, name: 'Jeremy', teamName: 'The Sweet Dreams', createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 13, name: 'Maria', teamName: 'The Rolling Pins', createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 14, name: 'Ruby', teamName: 'The Batter Up', createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 15, name: 'Whiting', teamName: 'The Knead to Know', createdAt: new Date('2025-09-29T06:44:38.115Z') }
  ],
  contestants: [
    { id: 1, name: 'Aaron', eliminatedWeek: null, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 2, name: 'Iain', eliminatedWeek: null, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 3, name: 'Jasmine', eliminatedWeek: null, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 4, name: 'Jessika', eliminatedWeek: null, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 5, name: 'Lesley', eliminatedWeek: null, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 6, name: 'Nadia', eliminatedWeek: null, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 7, name: 'Nataliia', eliminatedWeek: null, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 8, name: 'Pui Man', eliminatedWeek: 3, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 9, name: 'Toby', eliminatedWeek: null, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 10, name: 'Tom', eliminatedWeek: null, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 11, name: 'Hassan', eliminatedWeek: 1, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 12, name: 'Leighton', eliminatedWeek: 2, createdAt: new Date('2025-09-29T06:44:38.115Z') }
  ],
  teams: [
    { id: 1, playerId: 1, contestantId: 4, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 2, playerId: 1, contestantId: 1, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 3, playerId: 1, contestantId: 8, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 4, playerId: 2, contestantId: 4, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 5, playerId: 2, contestantId: 5, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 6, playerId: 2, contestantId: 9, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 7, playerId: 3, contestantId: 3, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 8, playerId: 3, contestantId: 2, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 9, playerId: 3, contestantId: 9, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 10, playerId: 4, contestantId: 2, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 11, playerId: 4, contestantId: 6, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 12, playerId: 4, contestantId: 8, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 13, playerId: 5, contestantId: 7, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 14, playerId: 5, contestantId: 2, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 15, playerId: 5, contestantId: 12, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 16, playerId: 6, contestantId: 10, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 17, playerId: 6, contestantId: 7, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 18, playerId: 6, contestantId: 8, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 19, playerId: 7, contestantId: 10, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 20, playerId: 7, contestantId: 7, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 21, playerId: 7, contestantId: 9, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 22, playerId: 8, contestantId: 10, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 23, playerId: 8, contestantId: 2, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 24, playerId: 8, contestantId: 6, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 25, playerId: 9, contestantId: 7, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 26, playerId: 9, contestantId: 6, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 27, playerId: 9, contestantId: 12, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 28, playerId: 10, contestantId: 4, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 29, playerId: 10, contestantId: 3, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 30, playerId: 10, contestantId: 5, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 31, playerId: 11, contestantId: 4, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 32, playerId: 11, contestantId: 3, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 33, playerId: 11, contestantId: 12, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 34, playerId: 12, contestantId: 3, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 35, playerId: 12, contestantId: 5, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 36, playerId: 12, contestantId: 12, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 37, playerId: 13, contestantId: 7, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 38, playerId: 13, contestantId: 1, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 39, playerId: 13, contestantId: 8, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 40, playerId: 14, contestantId: 10, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 41, playerId: 14, contestantId: 1, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 42, playerId: 14, contestantId: 9, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 43, playerId: 15, contestantId: 6, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 44, playerId: 15, contestantId: 1, createdAt: new Date('2025-09-29T06:44:38.115Z') },
    { id: 45, playerId: 15, contestantId: 5, createdAt: new Date('2025-09-29T06:44:38.115Z') }
  ],
  weeklyScores: [],
  seasonTotals: [],
  nextId: 46
}

export async function POST() {
  try {
    console.log('Copying working local data to production...')
    
    // Directly upload the working data to blob storage
    const result = await put('database/data.json', JSON.stringify(workingData, null, 2), {
      access: 'public',
      addRandomSuffix: false
    })
    
    console.log('Data copied successfully:', result.url)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Working data copied to production successfully',
      url: result.url,
      players: workingData.players.length,
      contestants: workingData.contestants.length,
      teams: workingData.teams.length
    })
    
  } catch (error) {
    console.error('❌ Error copying data:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}
