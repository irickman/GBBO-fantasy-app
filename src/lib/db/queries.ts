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

export async function deletePlayer(playerId: number) {
  // First delete all team assignments for this player
  await db.delete(teams).where(eq(teams.playerId, playerId))
  
  // Delete season totals for this player
  await db.delete(seasonTotals).where(eq(seasonTotals.playerId, playerId))
  
  // Finally delete the player
  return await db.delete(players).where(eq(players.id, playerId))
}

// Contestant operations
export async function createContestant(name: string, eliminatedWeek?: number) {
  return await db.insert(contestants).values({ name, eliminatedWeek }).returning()
}

export async function getAllContestants() {
  return await db.select().from(contestants).orderBy(contestants.name)
}

export async function updateContestantElimination(contestantId: number, eliminatedWeek?: number) {
  return await db.update(contestants)
    .set({ eliminatedWeek })
    .where(eq(contestants.id, contestantId))
    .returning()
}

export async function updateContestant(contestantId: number, name: string, eliminatedWeek?: number) {
  return await db.update(contestants)
    .set({ name, eliminatedWeek })
    .where(eq(contestants.id, contestantId))
    .returning()
}

export async function deleteContestant(contestantId: number) {
  // First delete all team assignments for this contestant
  await db.delete(teams).where(eq(teams.contestantId, contestantId))
  
  // Then delete all weekly scores for this contestant
  await db.delete(weeklyScores).where(eq(weeklyScores.contestantId, contestantId))
  
  // Finally delete the contestant
  return await db.delete(contestants).where(eq(contestants.id, contestantId))
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

export async function updateWeeklyScore(scoreId: number, contestantId: number, category: keyof typeof SCORING_CATEGORIES) {
  const points = SCORING_CATEGORIES[category]
  return await db.update(weeklyScores)
    .set({ contestantId, category, points })
    .where(eq(weeklyScores.id, scoreId))
    .returning()
}

export async function deleteWeeklyScore(scoreId: number) {
  return await db.delete(weeklyScores).where(eq(weeklyScores.id, scoreId))
}

export async function getWeeklyScoreById(scoreId: number) {
  return await db.select()
    .from(weeklyScores)
    .where(eq(weeklyScores.id, scoreId))
    .limit(1)
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

// Alias for consistency
export async function getWeeklyScoresByWeek(week: number) {
  return await getWeeklyScores(week)
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

export async function validateContestantElimination(contestantId: number, week: number) {
  // Check if contestant is eliminated before this week
  const contestant = await db.select()
    .from(contestants)
    .where(eq(contestants.id, contestantId))
    .limit(1)

  if (contestant.length === 0) {
    return { valid: false, error: 'Contestant not found' }
  }

  const eliminatedWeek = contestant[0].eliminatedWeek
  if (eliminatedWeek && week > eliminatedWeek) {
    return { 
      valid: false, 
      error: `Cannot score for contestant eliminated in week ${eliminatedWeek}` 
    }
  }

  return { valid: true }
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

export async function getCurrentWeek() {
  // Find the highest week that has scores
  const result = await db.select({
    maxWeek: sql<number>`MAX(${weeklyScores.week})`.as('maxWeek')
  })
    .from(weeklyScores)
    .limit(1)

  const maxWeek = result[0]?.maxWeek || 0
  
  // If no scores exist, start at week 2 (as per PRD)
  // If scores exist, current week is the next week after the highest scored week
  return maxWeek === 0 ? 2 : maxWeek + 1
}

export async function getWeekStatus(week: number) {
  // Check if this week has any scores
  const scores = await getWeeklyScores(week)
  return {
    week,
    hasScores: scores.length > 0,
    scoreCount: scores.length,
    isComplete: scores.length > 0 // Could add more sophisticated completion logic
  }
}

export async function calculateSeasonTotals() {
  // Calculate total points for each player
  const playerTotals = await db.select({
    playerId: players.id,
    totalPoints: sql<number>`COALESCE(SUM(${weeklyScores.points}), 0)`.as('totalPoints'),
  })
    .from(players)
    .leftJoin(teams, eq(players.id, teams.playerId))
    .leftJoin(weeklyScores, eq(teams.contestantId, weeklyScores.contestantId))
    .groupBy(players.id)
    .orderBy(desc(sql`COALESCE(SUM(${weeklyScores.points}), 0)`))

  // Update or insert season totals
  for (const playerTotal of playerTotals) {
    const existingTotal = await db.select()
      .from(seasonTotals)
      .where(eq(seasonTotals.playerId, playerTotal.playerId))
      .limit(1)

    if (existingTotal.length > 0) {
      await db.update(seasonTotals)
        .set({ 
          totalPoints: playerTotal.totalPoints,
          lastUpdated: new Date()
        })
        .where(eq(seasonTotals.playerId, playerTotal.playerId))
    } else {
      await db.insert(seasonTotals).values({
        playerId: playerTotal.playerId,
        totalPoints: playerTotal.totalPoints
      })
    }
  }

  return playerTotals
}

export async function getSeasonTotals() {
  return await db.select({
    playerId: players.id,
    playerName: players.name,
    teamName: players.teamName,
    totalPoints: seasonTotals.totalPoints,
    lastUpdated: seasonTotals.lastUpdated,
  })
    .from(seasonTotals)
    .innerJoin(players, eq(seasonTotals.playerId, players.id))
    .orderBy(desc(seasonTotals.totalPoints))
}

