// Vercel Blob storage database connection
import { blobDb } from './blob-storage'

// Export the blob database as the main database
export const db = blobDb

// Database initialization function
export async function initializeDatabase() {
  try {
    // Seed default data
    await blobDb.seedDefaultData()
    console.log('Database initialized with default data')
  } catch (error) {
    console.error('Database initialization error:', error)
    throw error
  }
}

// Scoring categories configuration
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