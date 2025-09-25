import { pgTable, serial, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core'

export const contestants = pgTable('contestants', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  eliminatedWeek: integer('eliminated_week'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  teamName: text('team_name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').notNull().references(() => players.id, { onDelete: 'cascade' }),
  contestantId: integer('contestant_id').notNull().references(() => contestants.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const weeklyScores = pgTable('weekly_scores', {
  id: serial('id').primaryKey(),
  week: integer('week').notNull(),
  contestantId: integer('contestant_id').notNull().references(() => contestants.id, { onDelete: 'cascade' }),
  category: text('category').notNull(),
  points: integer('points').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const seasonTotals = pgTable('season_totals', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').notNull().references(() => players.id, { onDelete: 'cascade' }),
  totalPoints: integer('total_points').notNull().default(0),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
})

// Export types
export type Contestant = typeof contestants.$inferSelect
export type NewContestant = typeof contestants.$inferInsert
export type Player = typeof players.$inferSelect
export type NewPlayer = typeof players.$inferInsert
export type Team = typeof teams.$inferSelect
export type NewTeam = typeof teams.$inferInsert
export type WeeklyScore = typeof weeklyScores.$inferSelect
export type NewWeeklyScore = typeof weeklyScores.$inferInsert
export type SeasonTotal = typeof seasonTotals.$inferSelect
export type NewSeasonTotal = typeof seasonTotals.$inferInsert
