import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    console.log('Resetting database with complete dataset...')
    
    // Clear all existing data
    await db.clearAllData()
    
    // Create contestants
    const contestants = [
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
      { name: 'Leighton', eliminatedWeek: 2 }
    ]
    
    const contestantMap = new Map<string, number>()
    for (const c of contestants) {
      const contestant = await db.createContestant(c.name, c.eliminatedWeek)
      contestantMap.set(c.name, contestant.id)
    }
    
    // Create players with teams
    const players = [
      { name: 'Aleta', teamName: 'The Baking Beauties', contestants: ['Jessika', 'Aaron', 'Pui Man'] },
      { name: 'Alex', teamName: 'The Flour Power', contestants: ['Jessika', 'Lesley', 'Toby'] },
      { name: 'Anna', teamName: 'The Sweet Success', contestants: ['Jasmine', 'Iain', 'Toby'] },
      { name: 'Annie', teamName: 'The Rising Dough', contestants: ['Iain', 'Nadia', 'Pui Man'] },
      { name: 'Ben', teamName: 'The Knead for Speed', contestants: ['Nataliia', 'Iain', 'Leighton'] },
      { name: 'Bob', teamName: 'The Bread Winners', contestants: ['Tom', 'Nataliia', 'Pui Man'] },
      { name: 'Christine', teamName: 'The Cake Crusaders', contestants: ['Tom', 'Nataliia', 'Toby'] },
      { name: 'Dani', teamName: 'The Pastry Pioneers', contestants: ['Tom', 'Iain', 'Nadia'] },
      { name: 'Emma', teamName: 'The Dough-lightful', contestants: ['Nataliia', 'Nadia', 'Leighton'] },
      { name: 'Ira', teamName: 'The Bake Believe', contestants: ['Jessika', 'Jasmine', 'Lesley'] },
      { name: 'Jake', teamName: 'The Flourishing Bakers', contestants: ['Jessika', 'Jasmine', 'Leighton'] },
      { name: 'Jeremy', teamName: 'The Sweet Dreams', contestants: ['Jasmine', 'Lesley', 'Leighton'] },
      { name: 'Maria', teamName: 'The Rolling Pins', contestants: ['Nataliia', 'Aaron', 'Pui Man'] },
      { name: 'Ruby', teamName: 'The Batter Up', contestants: ['Tom', 'Aaron', 'Toby'] },
      { name: 'Whiting', teamName: 'The Knead to Know', contestants: ['Nadia', 'Aaron', 'Lesley'] }
    ]
    
    for (const p of players) {
      const player = await db.createPlayer(p.name, p.teamName)
      const contestantIds = p.contestants.map(name => contestantMap.get(name)!).filter(Boolean)
      if (contestantIds.length === 3) {
        await db.updatePlayerTeam(player.id, contestantIds)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database reset with complete dataset',
      contestants: contestants.length,
      players: players.length
    })
    
  } catch (error) {
    console.error('Database reset error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
