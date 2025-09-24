import { db } from './index'
import { players, contestants, teams } from './schema'

// Default contestants - these will be seeded if no contestants exist
const DEFAULT_CONTESTANTS = [
  'Tom', 'Jessika', 'Jasmine', 'Nataliia', 'Lesley', 'Iain',
  'Toby', 'Aaron', 'Pui Man', 'Nadia', 'Leighton', 'Hassan'
]

// No default players - these should be added via the UI

export async function seedDatabase() {
  try {
    // Only seed contestants if none exist
    const existingContestants = await db.select().from(contestants).limit(1)
    
    if (existingContestants.length === 0) {
      // Insert default contestants only
      const insertedContestants = await db.insert(contestants).values(
        DEFAULT_CONTESTANTS.map(name => ({ name }))
      ).returning()

      return {
        success: true,
        message: `Database seeded with ${insertedContestants.length} contestants. Players should be added via the admin interface.`,
        players: 0,
        contestants: insertedContestants.length,
        teams: 0
      }
    } else {
      return {
        success: true,
        message: 'Database already has contestants. No seeding needed.',
        players: 0,
        contestants: existingContestants.length,
        teams: 0
      }
    }
  } catch (error) {
    console.error('Seeding error:', error)
    throw error
  }
}

export async function clearAllData() {
  try {
    // Clear all data in correct order (respecting foreign keys)
    await db.delete(teams)
    await db.delete(weeklyScores)
    await db.delete(seasonTotals)
    await db.delete(players)
    await db.delete(contestants)

    return {
      success: true,
      message: 'All data cleared successfully'
    }
  } catch (error) {
    console.error('Clear data error:', error)
    throw error
  }
}
