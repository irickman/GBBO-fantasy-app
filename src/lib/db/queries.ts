import { db } from './index'
import { players, contestants, teams, weeklyScores, seasonTotals, SCORING_CATEGORIES } from './schema'
import { eq, and, desc, sql } from 'drizzle-orm'

// Player operations
export async function createPlayer(name: string, teamName: string) {
  return await db.insert(players).values({ name, teamName }).returning()
}

export async function getAllPlayers() {
  return await db.select().from(players).orderBy(players.name)
}

// Contestant operations
export async function createContestant(name: string, eliminatedWeek?: number) {
  return await db.insert(contestants).values({ name, eliminatedWeek }).returning()
}

export async function getAllContestants() {
  return await db.select().from(contestants).orderBy(contestants.name)
}

export async function updateContestantElimination(contestantId: number, eliminatedWeek: number) {
  return await db.update(contestants)
    .set({ eliminatedWeek })
    .where(eq(contestants.id, contestantId))
    .returning()
}

// Team operations
export async function assignContestantToPlayer(playerId: number, contestantId: number) {
  return await db.insert(teams).values({ playerId, contestantId }).returning()
}

export async function getPlayerTeams(playerId: number) {
  return await db.select({
    teamId: teams.id,
    contestantId: contestants.id,
    contestantName: contestants.name,
    eliminatedWeek: contestants.eliminatedWeek,
  })
    .from(teams)
    .innerJoin(contestants, eq(teams.contestantId, contestants.id))
    .where(eq(teams.playerId, playerId))
}

export async function getAllTeams() {
  return await db.select({
    teamId: teams.id,
    playerId: players.id,
    playerName: players.name,
    teamName: players.teamName,
    contestantId: contestants.id,
    contestantName: contestants.name,
    eliminatedWeek: contestants.eliminatedWeek,
  })
    .from(teams)
    .innerJoin(players, eq(teams.playerId, players.id))
    .innerJoin(contestants, eq(teams.contestantId, contestants.id))
    .orderBy(players.name, contestants.name)
}

// Scoring operations
export async function addWeeklyScore(week: number, contestantId: number, category: keyof typeof SCORING_CATEGORIES) {
  const points = SCORING_CATEGORIES[category]
  return await db.insert(weeklyScores).values({ week, contestantId, category, points }).returning()
}

export async function getWeeklyScores(week: number) {
  return await db.select({
    id: weeklyScores.id,
    week: weeklyScores.week,
    contestantId: contestants.id,
    contestantName: contestants.name,
    category: weeklyScores.category,
    points: weeklyScores.points,
  })
    .from(weeklyScores)
    .innerJoin(contestants, eq(weeklyScores.contestantId, contestants.id))
    .where(eq(weeklyScores.week, week))
    .orderBy(contestants.name)
}

export async function getContestantScores(contestantId: number) {
  return await db.select()
    .from(weeklyScores)
    .where(eq(weeklyScores.contestantId, contestantId))
    .orderBy(weeklyScores.week, weeklyScores.category)
}

// Leaderboard operations
export async function getLeaderboard() {
  // Calculate total points for each player
  const playerTotals = await db.select({
    playerId: players.id,
    playerName: players.name,
    teamName: players.teamName,
    totalPoints: sql<number>`COALESCE(SUM(${weeklyScores.points}), 0)`.as('totalPoints'),
  })
    .from(players)
    .leftJoin(teams, eq(players.id, teams.playerId))
    .leftJoin(weeklyScores, eq(teams.contestantId, weeklyScores.contestantId))
    .groupBy(players.id, players.name, players.teamName)
    .orderBy(desc(sql`COALESCE(SUM(${weeklyScores.points}), 0)`))

  return playerTotals
}

export async function getPlayerWeeklyBreakdown(playerId: number) {
  return await db.select({
    week: weeklyScores.week,
    contestantName: contestants.name,
    category: weeklyScores.category,
    points: weeklyScores.points,
  })
    .from(teams)
    .innerJoin(contestants, eq(teams.contestantId, contestants.id))
    .innerJoin(weeklyScores, eq(teams.contestantId, weeklyScores.contestantId))
    .where(eq(teams.playerId, playerId))
    .orderBy(weeklyScores.week, contestants.name)
}

// Validation functions
export async function validateWeeklyScoring(week: number, category: keyof typeof SCORING_CATEGORIES) {
  // Check if this category already has a winner for this week
  const existing = await db.select()
    .from(weeklyScores)
    .where(and(
      eq(weeklyScores.week, week),
      eq(weeklyScores.category, category)
    ))
    .limit(1)

  return existing.length === 0
}

export async function getContestantTeamAssignments() {
  return await db.select({
    contestantId: contestants.id,
    contestantName: contestants.name,
    playerId: players.id,
    playerName: players.name,
  })
    .from(contestants)
    .leftJoin(teams, eq(contestants.id, teams.contestantId))
    .leftJoin(players, eq(teams.playerId, players.id))
    .orderBy(contestants.name)
}
