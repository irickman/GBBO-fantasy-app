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

// Export SCORING_CATEGORIES for use in other files
export const SCORING_CATEGORIES = {
  star_baker: 4,        // 1 per week
  technical_win: 3,     // 1 per week  
  handshake: 4,         // unlimited
  raw: -1,              // unlimited
  overbaked: -1,        // unlimited
  last_technical: -1,   // 1 per week
  cries_testimonial: 1, // unlimited
} as const

export type ScoringCategory = keyof typeof SCORING_CATEGORIES

