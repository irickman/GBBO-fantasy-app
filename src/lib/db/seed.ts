import { db } from './index'
import { players, contestants, teams } from './schema'

// Sample GBBO contestants (you can replace these with actual contestants)
const SAMPLE_CONTESTANTS = [
  'Tom', 'Jessika', 'Jasmine', 'Nataliia', 'Lesley', 'Iain',
  'Toby', 'Aaron', 'Pui Man', 'Nadia', 'Leighton'
]

// Sample players (you can replace these with actual player names)
const SAMPLE_PLAYERS = [
  { name: 'Christine', teamName: 'The Rising Stars' },
  { name: 'Ruby', teamName: 'Baking Champions' },
  { name: 'Anna', teamName: 'Sweet Dreams' },
  { name: 'Dani', teamName: 'Flour Power' },
  { name: 'Ira', teamName: 'Cake Masters' },
  { name: 'Jake', teamName: 'Dough Believers' },
  { name: 'Jeremy', teamName: 'Sugar Rush' },
  { name: 'Bob', teamName: 'Bread Winners' },
  { name: 'Alex', teamName: 'Pastry Perfect' },
  { name: 'Ben', teamName: 'Crust Crusaders' },
  { name: 'Emma', teamName: 'Muffin Tops' },
  { name: 'Whiting', teamName: 'Scone Zone' },
  { name: 'Aleta', teamName: 'Tart Attack' },
  { name: 'Annie', teamName: 'Pie in the Sky' },
  { name: 'Maria', teamName: 'Biscuit Brigade' },
]

export async function seedDatabase() {
  try {
    // Clear existing data
    await db.delete(teams)
    await db.delete(players)
    await db.delete(contestants)

    // Insert contestants
    const insertedContestants = await db.insert(contestants).values(
      SAMPLE_CONTESTANTS.map(name => ({ name }))
    ).returning()

    // Insert players
    const insertedPlayers = await db.insert(players).values(SAMPLE_PLAYERS).returning()

    // Assign 3 random contestants to each player
    const teamAssignments = []
    const shuffledContestants = [...insertedContestants].sort(() => Math.random() - 0.5)
    
    for (let i = 0; i < insertedPlayers.length; i++) {
      const player = insertedPlayers[i]
      const startIndex = i * 3
      const playerContestants = shuffledContestants.slice(startIndex, startIndex + 3)
      
      for (const contestant of playerContestants) {
        teamAssignments.push({
          playerId: player.id,
          contestantId: contestant.id
        })
      }
    }

    await db.insert(teams).values(teamAssignments)

    return {
      success: true,
      message: `Database seeded with ${insertedPlayers.length} players and ${insertedContestants.length} contestants`,
      players: insertedPlayers.length,
      contestants: insertedContestants.length,
      teams: teamAssignments.length
    }
  } catch (error) {
    console.error('Seeding error:', error)
    throw error
  }
}
