import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'

// Create SQLite database connection
const sqlite = new Database('./gbbo.db')
export const db = drizzle(sqlite, { schema })

// Database initialization function
export async function initializeDatabase() {
  // Create tables if they don't exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      team_name TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contestants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      eliminated_week INTEGER,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      contestant_id INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (player_id) REFERENCES players (id),
      FOREIGN KEY (contestant_id) REFERENCES contestants (id)
    );

    CREATE TABLE IF NOT EXISTS weekly_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      week INTEGER NOT NULL,
      contestant_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      points REAL NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (contestant_id) REFERENCES contestants (id)
    );

    CREATE TABLE IF NOT EXISTS season_totals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      total_points REAL NOT NULL DEFAULT 0,
      last_updated INTEGER NOT NULL,
      FOREIGN KEY (player_id) REFERENCES players (id)
    );
  `)
}

// Export schema for use in other files
export * from './schema'

