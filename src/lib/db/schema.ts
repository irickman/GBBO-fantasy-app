import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

// Players table - stores the 15 fantasy league participants
export const players = sqliteTable('players', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  teamName: text('team_name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// Contestants table - stores the 15 GBBO contestants
export const contestants = sqliteTable('contestants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  eliminatedWeek: integer('eliminated_week'), // null if still in competition
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// Teams table - links players to their 3 contestants
export const teams = sqliteTable('teams', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  playerId: integer('player_id').notNull().references(() => players.id),
  contestantId: integer('contestant_id').notNull().references(() => contestants.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// Weekly scores table - stores all scoring events
export const weeklyScores = sqliteTable('weekly_scores', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  week: integer('week').notNull(), // 1-10 (scoring starts week 2)
  contestantId: integer('contestant_id').notNull().references(() => contestants.id),
  category: text('category', { 
    enum: ['star_baker', 'technical_win', 'handshake', 'raw', 'overbaked', 'last_technical', 'cries_testimonial'] 
  }).notNull(),
  points: real('points').notNull(), // 4, 3, 4, -1, -1, -1, 1
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// Season totals table - calculated totals for each player
export const seasonTotals = sqliteTable('season_totals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  playerId: integer('player_id').notNull().references(() => players.id),
  totalPoints: real('total_points').notNull().default(0),
  lastUpdated: integer('last_updated', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// Scoring categories and their point values
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

