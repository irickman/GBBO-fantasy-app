import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createContestant, createPlayer, updatePlayerTeam } from '@/lib/db/queries'

export async function POST(req: Request) {
  try {
    // Clear existing data first
    await db.clearAllData()

    // 1. Create Contestants
    const contestantsData = [
      { name: 'Aaron', eliminatedWeek: null },
      { name: 'Iain', eliminatedWeek: null },
      { name: 'Jasmine', eliminatedWeek: null },
      { name: 'Jessika', eliminatedWeek: null },
      { name: 'Lesley', eliminatedWeek: null },
      { name: 'Nadia', eliminatedWeek: null },
      { name: 'Nataliia', eliminatedWeek: null },
      { name: 'Pui Man', eliminatedWeek: 3 },
      { name: 'Toby', eliminatedWeek: null },
      { name: 'Tom', eliminatedWeek: null },
      { name: 'Hassan', eliminatedWeek: 1 },
      { name: 'Leighton', eliminatedWeek: 2 },
    ]

    const contestantMap = new Map<string, number>()
    for (const c of contestantsData) {
      const contestant = await createContestant(c.name, c.eliminatedWeek)
      contestantMap.set(c.name, contestant.id)
    }

    // 2. Create Players and their Teams
    const playersData = [
      { name: 'Aleta', teamName: 'Aleta\'s Aces', contestants: ['Jessika', 'Aaron', 'Pui Man'] },
      { name: 'Alex', teamName: 'Alex\'s Alchemists', contestants: ['Jessika', 'Lesley', 'Toby'] },
      { name: 'Anna', teamName: 'Anna\'s Artisans', contestants: ['Jasmine', 'Iain', 'Toby'] },
      { name: 'Annie', teamName: 'Annie\'s Angels', contestants: ['Iain', 'Nadia', 'Pui Man'] },
      { name: 'Ben', teamName: 'Ben\'s Bakes', contestants: ['Nataliia', 'Iain', 'Leighton'] },
      { name: 'Bob', teamName: 'Bob\'s Best', contestants: ['Tom', 'Nataliia', 'Pui Man'] },
      { name: 'Christine', teamName: 'Christine\'s Creations', contestants: ['Tom', 'Nataliia', 'Toby'] },
      { name: 'Dani', teamName: 'Dani\'s Delights', contestants: ['Tom', 'Iain', 'Nadia'] },
      { name: 'Emma', teamName: 'Emma\'s Edibles', contestants: ['Nataliia', 'Nadia', 'Leighton'] },
      { name: 'Ira', teamName: 'Ira\'s Icing', contestants: ['Jessika', 'Jasmine', 'Lesley'] },
      { name: 'Jake', teamName: 'Jake\'s Jellies', contestants: ['Jessika', 'Jasmine', 'Leighton'] },
      { name: 'Jeremy', teamName: 'Jeremy\'s Jewels', contestants: ['Jasmine', 'Lesley', 'Leighton'] },
      { name: 'Maria', teamName: 'Maria\'s Marvels', contestants: ['Nataliia', 'Aaron', 'Pui Man'] },
      { name: 'Ruby', teamName: 'Ruby\'s Roulades', contestants: ['Tom', 'Aaron', 'Toby'] },
      { name: 'Whiting', teamName: 'Whiting\'s Wonders', contestants: ['Nadia', 'Aaron', 'Lesley'] },
    ]

    for (const p of playersData) {
      const newPlayer = await createPlayer(p.name, p.teamName)
      const contestantIds = p.contestants.map(name => contestantMap.get(name)).filter(Boolean) as number[]
      if (newPlayer && newPlayer.id && contestantIds.length === 3) {
        await updatePlayerTeam(newPlayer.id, contestantIds)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Data uploaded successfully',
      contestants: contestantMap.size,
      players: playersData.length
    })
  } catch (error) {
    console.error('Data upload error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to upload data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
