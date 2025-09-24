import { pgTable, text, integer, decimal, timestamp, serial } from 'drizzle-orm/pg-core'

// Players table - stores the 15 fantasy league participants
export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  teamName: text('team_name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Contestants table - stores the 15 GBBO contestants
export const contestants = pgTable('contestants', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  eliminatedWeek: integer('eliminated_week'), // null if still in competition
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Teams table - links players to their 3 contestants
export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').notNull().references(() => players.id),
  contestantId: integer('contestant_id').notNull().references(() => contestants.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Weekly scores table - stores all scoring events
export const weeklyScores = pgTable('weekly_scores', {
  id: serial('id').primaryKey(),
  week: integer('week').notNull(), // 1-10 (scoring starts week 2)
  contestantId: integer('contestant_id').notNull().references(() => contestants.id),
  category: text('category', { 
    enum: ['star_baker', 'technical_win', 'handshake', 'raw', 'overbaked', 'last_technical', 'cries_testimonial'] 
  }).notNull(),
  points: decimal('points').notNull(), // 4, 3, 4, -1, -1, -1, 1
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Season totals table - calculated totals for each player
export const seasonTotals = pgTable('season_totals', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').notNull().references(() => players.id),
  totalPoints: decimal('total_points').notNull().default('0'),
  lastUpdated: timestamp('last_updated').notNull().defaultNow(),
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

