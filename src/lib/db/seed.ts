import { db } from './index'

// Default contestants - these will be seeded if no contestants exist
const DEFAULT_CONTESTANTS = [
  'Tom', 'Jessika', 'Jasmine', 'Nataliia', 'Lesley', 'Iain',
  'Toby', 'Aaron', 'Pui Man', 'Nadia', 'Leighton', 'Hassan'
]

// No default players - these should be added via the UI

export async function seedDatabase() {
  try {
    // Only seed contestants if none exist
    const existingContestants = await db.getContestants()
    
    if (existingContestants.length === 0) {
      // Insert default contestants only
      for (const name of DEFAULT_CONTESTANTS) {
        await db.createContestant({ name, eliminatedWeek: null })
      }

      return {
        success: true,
        message: `Database seeded with ${DEFAULT_CONTESTANTS.length} contestants. Players should be added via the admin interface.`,
        players: 0,
        contestants: DEFAULT_CONTESTANTS.length,
        teams: 0
      }
    } else {
      return {
        success: true,
        message: 'Database already has contestants. No seeding needed.',
        players: existingContestants.length,
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
    // Clear all data using the JSON storage
    await db.clearAllData()

    return {
      success: true,
      message: 'All data cleared successfully'
    }
  } catch (error) {
    console.error('Clear data error:', error)
    throw error
  }
}