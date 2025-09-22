import { db } from './index'
import { players, contestants, teams } from './schema'

// Sample GBBO contestants (you can replace these with actual contestants)
const SAMPLE_CONTESTANTS = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry',
  'Ivy', 'Jack', 'Kate', 'Liam', 'Maya', 'Noah', 'Olivia'
]

// Sample players (you can replace these with actual player names)
const SAMPLE_PLAYERS = [
  { name: 'Player 1', teamName: 'The Rising Stars' },
  { name: 'Player 2', teamName: 'Baking Champions' },
  { name: 'Player 3', teamName: 'Sweet Dreams' },
  { name: 'Player 4', teamName: 'Flour Power' },
  { name: 'Player 5', teamName: 'Cake Masters' },
  { name: 'Player 6', teamName: 'Dough Believers' },
  { name: 'Player 7', teamName: 'Sugar Rush' },
  { name: 'Player 8', teamName: 'Bread Winners' },
  { name: 'Player 9', teamName: 'Pastry Perfect' },
  { name: 'Player 10', teamName: 'Crust Crusaders' },
  { name: 'Player 11', teamName: 'Muffin Tops' },
  { name: 'Player 12', teamName: 'Scone Zone' },
  { name: 'Player 13', teamName: 'Tart Attack' },
  { name: 'Player 14', teamName: 'Pie in the Sky' },
  { name: 'Player 15', teamName: 'Biscuit Brigade' },
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
