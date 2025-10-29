// Drizzle schema for GBBO Fantasy League
import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

// Players table
export const players = sqliteTable('players', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  teamName: text('team_name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Contestants table
export const contestants = sqliteTable('contestants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  eliminatedWeek: integer('eliminated_week'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Teams table with indexes for performance
export const teams = sqliteTable(
  'teams',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    playerId: integer('player_id')
      .notNull()
      .references(() => players.id, { onDelete: 'cascade' }),
    contestantId: integer('contestant_id')
      .notNull()
      .references(() => contestants.id, { onDelete: 'cascade' }),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    // Composite index for getting active teams by player (fixes N+1 query!)
    playerActiveIdx: index('teams_player_active_idx').on(
      table.playerId,
      table.isActive
    ),
    // Index for joining teams with contestants
    contestantIdx: index('teams_contestant_idx').on(table.contestantId),
  })
);

// Weekly scores table with indexes for performance
export const weeklyScores = sqliteTable(
  'weekly_scores',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    week: integer('week').notNull(),
    contestantId: integer('contestant_id')
      .notNull()
      .references(() => contestants.id, { onDelete: 'cascade' }),
    category: text('category').notNull(),
    points: real('points').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    // Composite index for getting scores by week and contestant (fixes N+1 query!)
    weekContestantIdx: index('weekly_scores_week_contestant_idx').on(
      table.week,
      table.contestantId
    ),
    // Index for getting all scores for a specific week
    weekIdx: index('weekly_scores_week_idx').on(table.week),
  })
);

// Season totals table
export const seasonTotals = sqliteTable('season_totals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  playerId: integer('player_id')
    .notNull()
    .unique()
    .references(() => players.id, { onDelete: 'cascade' }),
  totalPoints: real('total_points').notNull().default(0),
  lastUpdated: integer('last_updated', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Relations for Drizzle queries
export const playersRelations = relations(players, ({ many }) => ({
  teams: many(teams),
  seasonTotals: many(seasonTotals),
}));

export const contestantsRelations = relations(contestants, ({ many }) => ({
  teams: many(teams),
  weeklyScores: many(weeklyScores),
}));

export const teamsRelations = relations(teams, ({ one }) => ({
  player: one(players, {
    fields: [teams.playerId],
    references: [players.id],
  }),
  contestant: one(contestants, {
    fields: [teams.contestantId],
    references: [contestants.id],
  }),
}));

export const weeklyScoresRelations = relations(weeklyScores, ({ one }) => ({
  contestant: one(contestants, {
    fields: [weeklyScores.contestantId],
    references: [contestants.id],
  }),
}));

export const seasonTotalsRelations = relations(seasonTotals, ({ one }) => ({
  player: one(players, {
    fields: [seasonTotals.playerId],
    references: [players.id],
  }),
}));

// Type exports for use in application code
export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;

export type Contestant = typeof contestants.$inferSelect;
export type NewContestant = typeof contestants.$inferInsert;

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;

export type WeeklyScore = typeof weeklyScores.$inferSelect;
export type NewWeeklyScore = typeof weeklyScores.$inferInsert;

export type SeasonTotal = typeof seasonTotals.$inferSelect;
export type NewSeasonTotal = typeof seasonTotals.$inferInsert;
