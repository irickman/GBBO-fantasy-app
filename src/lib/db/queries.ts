import { db } from './index'
import { contestants, players, teams, weeklyScores, seasonTotals } from './schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { SCORING_CATEGORIES } from './index'

// Contestants
export async function createContestant(name: string, eliminatedWeek: number | null = null) {
  const [contestant] = await db.insert(contestants).values({
    name,
    eliminatedWeek,
  }).returning()
  return contestant
}

export async function getContestants() {
  return await db.select().from(contestants).orderBy(contestants.name)
}

export async function getContestantById(id: number) {
  const [contestant] = await db.select().from(contestants).where(eq(contestants.id, id))
  return contestant || null
}

export async function updateContestant(id: number, updates: { name?: string; eliminatedWeek?: number | null }) {
  const [contestant] = await db.update(contestants)
    .set(updates)
    .where(eq(contestants.id, id))
    .returning()
  return contestant || null
}

export async function deleteContestant(id: number) {
  const result = await db.delete(contestants).where(eq(contestants.id, id))
  return result.rowCount > 0
}

// Players
export async function createPlayer(name: string, teamName: string) {
  const [player] = await db.insert(players).values({
    name,
    teamName,
  }).returning()
  return player
}

export async function getPlayers() {
  return await db.select().from(players).orderBy(players.name)
}

export async function getPlayerById(id: number) {
  const [player] = await db.select().from(players).where(eq(players.id, id))
  return player || null
}

export async function updatePlayer(id: number, updates: { name?: string; teamName?: string }) {
  const [player] = await db.update(players)
    .set(updates)
    .where(eq(players.id, id))
    .returning()
  return player || null
}

export async function deletePlayer(id: number) {
  const result = await db.delete(players).where(eq(players.id, id))
  return result.rowCount > 0
}

// Teams
export async function createTeam(playerId: number, contestantId: number) {
  const [team] = await db.insert(teams).values({
    playerId,
    contestantId,
  }).returning()
  return team
}

export async function getTeamsByPlayerId(playerId: number) {
  return await db.select({
    id: teams.id,
    playerId: teams.playerId,
    contestantId: teams.contestantId,
    contestantName: contestants.name,
    eliminatedWeek: contestants.eliminatedWeek,
    createdAt: teams.createdAt,
  })
  .from(teams)
  .innerJoin(contestants, eq(teams.contestantId, contestants.id))
  .where(eq(teams.playerId, playerId))
}

export async function updatePlayerTeam(playerId: number, contestantIds: number[]) {
  // Delete existing teams for this player
  await db.delete(teams).where(eq(teams.playerId, playerId))
  
  // Insert new teams
  if (contestantIds.length > 0) {
    await db.insert(teams).values(
      contestantIds.map(contestantId => ({
        playerId,
        contestantId,
      }))
    )
  }
}

// Weekly Scores
export async function createWeeklyScore(week: number, contestantId: number, category: string, points: number) {
  const [score] = await db.insert(weeklyScores).values({
    week,
    contestantId,
    category,
    points,
  }).returning()
  return score
}

export async function getWeeklyScores(week?: number) {
  let query = db.select({
    id: weeklyScores.id,
    week: weeklyScores.week,
    contestantId: weeklyScores.contestantId,
    contestantName: contestants.name,
    category: weeklyScores.category,
    points: weeklyScores.points,
    createdAt: weeklyScores.createdAt,
  })
  .from(weeklyScores)
  .innerJoin(contestants, eq(weeklyScores.contestantId, contestants.id))
  .orderBy(desc(weeklyScores.week), weeklyScores.category)

  if (week !== undefined) {
    query = query.where(eq(weeklyScores.week, week))
  }

  return await query
}

export async function getWeeklyScoreById(id: number) {
  const [score] = await db.select({
    id: weeklyScores.id,
    week: weeklyScores.week,
    contestantId: weeklyScores.contestantId,
    contestantName: contestants.name,
    category: weeklyScores.category,
    points: weeklyScores.points,
    createdAt: weeklyScores.createdAt,
  })
  .from(weeklyScores)
  .innerJoin(contestants, eq(weeklyScores.contestantId, contestants.id))
  .where(eq(weeklyScores.id, id))
  
  return score || null
}

export async function updateWeeklyScore(id: number, week: number, contestantId: number, category: string, points: number) {
  const [score] = await db.update(weeklyScores)
    .set({ week, contestantId, category, points })
    .where(eq(weeklyScores.id, id))
    .returning()
  return score || null
}

export async function deleteWeeklyScore(id: number) {
  const result = await db.delete(weeklyScores).where(eq(weeklyScores.id, id))
  return result.rowCount > 0
}

// Season Totals
export async function createSeasonTotal(data: { playerId: number; totalPoints: number }) {
  const [total] = await db.insert(seasonTotals).values(data).returning()
  return total
}

export async function getSeasonTotals() {
  return await db.select({
    id: seasonTotals.id,
    playerId: seasonTotals.playerId,
    playerName: players.name,
    totalPoints: seasonTotals.totalPoints,
    lastUpdated: seasonTotals.lastUpdated,
  })
  .from(seasonTotals)
  .innerJoin(players, eq(seasonTotals.playerId, players.id))
  .orderBy(desc(seasonTotals.totalPoints))
}

export async function getSeasonTotalByPlayerId(playerId: number) {
  const [total] = await db.select().from(seasonTotals).where(eq(seasonTotals.playerId, playerId))
  return total || null
}

export async function updateSeasonTotal(playerId: number, updates: { totalPoints: number }) {
  const [total] = await db.update(seasonTotals)
    .set({ ...updates, lastUpdated: new Date() })
    .where(eq(seasonTotals.playerId, playerId))
    .returning()
  return total || null
}

// Validation functions
export async function validateContestantElimination(contestantId: number, week: number): Promise<boolean> {
  const contestant = await getContestantById(contestantId)
  if (!contestant) return false
  
  // If contestant is eliminated, they can only be scored in the week they were eliminated
  if (contestant.eliminatedWeek !== null) {
    return contestant.eliminatedWeek === week
  }
  
  return true
}

export async function validateWeeklyScoring(week: number, contestantId: number, category: string): Promise<{ valid: boolean; error?: string }> {
  // Check if contestant can be scored for this week
  const canScore = await validateContestantElimination(contestantId, week)
  if (!canScore) {
    return { valid: false, error: 'Contestant is eliminated and cannot be scored for this week' }
  }

  // Check for duplicate winners (only one per week for certain categories)
  const restrictedCategories = ['star_baker', 'technical_win', 'last_technical']
  if (restrictedCategories.includes(category)) {
    const existing = await db.select()
      .from(weeklyScores)
      .where(and(
        eq(weeklyScores.week, week),
        eq(weeklyScores.category, category)
      ))
    
    if (existing.length > 0) {
      return { valid: false, error: `Only one ${category} per week is allowed` }
    }
  }

  return { valid: true }
}

// Current week and status
export async function getCurrentWeek(): Promise<number> {
  // For now, return week 4. In a real app, this would be dynamic
  return 4
}

export async function getWeekStatus(week: number): Promise<'complete' | 'current' | 'upcoming'> {
  const currentWeek = await getCurrentWeek()
  if (week < currentWeek) return 'complete'
  if (week === currentWeek) return 'current'
  return 'upcoming'
}

// Season totals calculation
export async function calculateSeasonTotals() {
  const allPlayers = await getPlayers()
  
  for (const player of allPlayers) {
    // Get all teams for this player
    const playerTeams = await getTeamsByPlayerId(player.id)
    const contestantIds = playerTeams.map(team => team.contestantId)
    
    if (contestantIds.length === 0) continue
    
    // Calculate total points for this player
    const scores = await db.select({
      points: weeklyScores.points,
    })
    .from(weeklyScores)
    .where(sql`${weeklyScores.contestantId} = ANY(${contestantIds})`)
    
    const totalPoints = scores.reduce((sum, score) => sum + score.points, 0)
    
    // Update or create season total
    const existing = await getSeasonTotalByPlayerId(player.id)
    if (existing) {
      await updateSeasonTotal(player.id, { totalPoints })
    } else {
      await createSeasonTotal({ playerId: player.id, totalPoints })
    }
  }
}

// Leaderboard
export async function getLeaderboard() {
  return await getSeasonTotals()
}

// Player weekly breakdown
export async function getPlayerWeeklyBreakdown(playerId: number) {
  const playerTeams = await getTeamsByPlayerId(playerId)
  const contestantIds = playerTeams.map(team => team.contestantId)
  
  if (contestantIds.length === 0) return []
  
  const scores = await db.select({
    week: weeklyScores.week,
    contestantName: contestants.name,
    category: weeklyScores.category,
    points: weeklyScores.points,
  })
  .from(weeklyScores)
  .innerJoin(contestants, eq(weeklyScores.contestantId, contestants.id))
  .where(sql`${weeklyScores.contestantId} = ANY(${contestantIds})`)
  .orderBy(desc(weeklyScores.week), contestants.name)
  
  return scores
}

// Alias for consistency
export const getWeeklyScoresByWeek = getWeeklyScores