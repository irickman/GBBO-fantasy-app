// Temporary JSON-based storage for Vercel deployment
// This will be replaced with proper Postgres once database is set up
import { jsonDb } from './json-storage'

// Export the JSON database as the main database
export const db = jsonDb

// Database initialization function
export async function initializeDatabase() {
  try {
    // Seed default data
    await jsonDb.seedDefaultData()
    console.log('Database initialized with default data')
  } catch (error) {
    console.error('Database initialization error:', error)
    throw error
  }
}

// Export schema for use in other files
export * from './schema'

