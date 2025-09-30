import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Contestants data
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

// Players data
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

export async function POST() {
  try {
    console.log('Starting production data upload...')
    
    // Clear existing data
    console.log('Clearing existing data...')
    await db.clearAllData()
    
    // Upload contestants
    console.log('Uploading contestants...')
    for (const contestant of contestants) {
      await db.createContestant(contestant.name, contestant.eliminatedWeek)
      console.log(`✓ Created contestant: ${contestant.name}${contestant.eliminatedWeek ? ` (eliminated week ${contestant.eliminatedWeek})` : ''}`)
    }
    
    // Wait a moment for contestants to be created
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Get all contestants to map names to IDs
    const allContestants = await db.getContestants()
    console.log('Created contestants:', allContestants.map(c => c.name))
    const contestantMap = new Map(allContestants.map(c => [c.name, c.id]))
    
    // Upload players and their teams
    console.log('Uploading players and teams...')
    for (const player of players) {
      // Create player
      const createdPlayer = await db.createPlayer(player.name, player.teamName)
      console.log(`✓ Created player: ${player.name} (${player.teamName})`)
      
      // Get contestant IDs for this player's team
      const contestantIds = player.contestants.map(name => {
        const id = contestantMap.get(name)
        if (!id) {
          throw new Error(`Contestant not found: ${name}`)
        }
        return id
      })
      
      // Create team assignments
      await db.updatePlayerTeam(createdPlayer.id, contestantIds)
      console.log(`  ✓ Assigned contestants: ${player.contestants.join(', ')}`)
    }
    
    console.log('\n🎉 Production data upload completed successfully!')
    console.log(`📊 Uploaded ${contestants.length} contestants and ${players.length} players`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Production data uploaded successfully',
      contestants: contestants.length,
      players: players.length
    })
    
  } catch (error) {
    console.error('❌ Error during production data upload:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}
