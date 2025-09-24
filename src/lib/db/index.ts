import { drizzle } from 'drizzle-orm/vercel-postgres'
import { sql } from '@vercel/postgres'
import * as schema from './schema'

// Create Postgres database connection
export const db = drizzle(sql, { schema })

// Database initialization function
export async function initializeDatabase() {
  try {
    // Create tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        team_name TEXT NOT NULL,
        created_at BIGINT NOT NULL
      );
    `

    await sql`
      CREATE TABLE IF NOT EXISTS contestants (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        eliminated_week INTEGER,
        created_at BIGINT NOT NULL
      );
    `

    await sql`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        player_id INTEGER NOT NULL,
        contestant_id INTEGER NOT NULL,
        created_at BIGINT NOT NULL,
        FOREIGN KEY (player_id) REFERENCES players (id),
        FOREIGN KEY (contestant_id) REFERENCES contestants (id)
      );
    `

    await sql`
      CREATE TABLE IF NOT EXISTS weekly_scores (
        id SERIAL PRIMARY KEY,
        week INTEGER NOT NULL,
        contestant_id INTEGER NOT NULL,
        category TEXT NOT NULL,
        points DECIMAL NOT NULL,
        created_at BIGINT NOT NULL,
        FOREIGN KEY (contestant_id) REFERENCES contestants (id)
      );
    `

    await sql`
      CREATE TABLE IF NOT EXISTS season_totals (
        id SERIAL PRIMARY KEY,
        player_id INTEGER NOT NULL,
        total_points DECIMAL NOT NULL DEFAULT 0,
        last_updated BIGINT NOT NULL,
        FOREIGN KEY (player_id) REFERENCES players (id)
      );
    `
  } catch (error) {
    console.error('Database initialization error:', error)
    throw error
  }
}

// Export schema for use in other files
export * from './schema'

