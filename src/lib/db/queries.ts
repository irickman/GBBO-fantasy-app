import { db } from './index'
import { SCORING_CATEGORIES } from './schema'

// Player operations
export async function createPlayer(name: string, teamName: string) {
  return await db.createPlayer({ name, teamName })
}

export async function getAllPlayers() {
  const players = await db.getPlayers()
  return players.sort((a, b) => a.name.localeCompare(b.name))
}

export async function deletePlayer(playerId: number) {
  return await db.deletePlayer(playerId)
}

// Contestant operations
export async function createContestant(name: string, eliminatedWeek?: number) {
  return await db.createContestant({ name, eliminatedWeek: eliminatedWeek || null })
}

export async function getAllContestants() {
  const contestants = await db.getContestants()
  return contestants.sort((a, b) => a.name.localeCompare(b.name))
}

export async function updateContestantElimination(contestantId: number, eliminatedWeek?: number) {
  return await db.updateContestant(contestantId, { eliminatedWeek: eliminatedWeek || null })
}

export async function updateContestant(contestantId: number, name: string, eliminatedWeek?: number) {
  return await db.updateContestant(contestantId, { name, eliminatedWeek: eliminatedWeek || null })
}

export async function deleteContestant(contestantId: number) {
  return await db.deleteContestant(contestantId)
}

// Team operations
export async function createTeam(playerId: number, contestantId: number) {
  return await db.createTeam({ playerId, contestantId })
}

export async function getTeamsByPlayerId(playerId: number) {
  return await db.getTeamsByPlayerId(playerId)
}

export async function getAllTeams() {
  return await db.getTeams()
}

export async function updateTeam(teamId: number, playerId: number, contestantId: number) {
  return await db.updateTeam(teamId, { playerId, contestantId })
}

export async function deleteTeam(teamId: number) {
  return await db.deleteTeam(teamId)
}

// Weekly scores operations
export async function addWeeklyScore(week: number, contestantId: number, category: string, points: number) {
  return await db.createWeeklyScore({ week, contestantId, category, points })
}

export async function getWeeklyScores(week?: number) {
  const scores = await db.getWeeklyScores(week)
  const contestants = await getAllContestants()
  
  // Add contestant names to scores
  return scores.map(score => {
    const contestant = contestants.find(c => c.id === score.contestantId)
    return {
      ...score,
      contestantName: contestant?.name || 'Unknown'
    }
  })
}

export async function getWeeklyScoresByWeek(week: number) {
  return await getWeeklyScores(week)
}

export async function getWeeklyScoreById(scoreId: number) {
  return await db.getWeeklyScoreById(scoreId)
}

export async function updateWeeklyScore(scoreId: number, week: number, contestantId: number, category: string, points: number) {
  return await db.updateWeeklyScore(scoreId, { week, contestantId, category, points })
}

export async function deleteWeeklyScore(scoreId: number) {
  return await db.deleteWeeklyScore(scoreId)
}

// Season totals operations
export async function createSeasonTotal(playerId: number, totalPoints: number) {
  return await db.createSeasonTotal({ playerId, totalPoints })
}

export async function getSeasonTotals() {
  return await db.getSeasonTotals()
}

export async function getSeasonTotalByPlayerId(playerId: number) {
  return await db.getSeasonTotalByPlayerId(playerId)
}

export async function updateSeasonTotal(playerId: number, totalPoints: number) {
  return await db.updateSeasonTotal(playerId, { totalPoints })
}

// Validation functions
export async function validateContestantElimination(contestantId: number, week: number) {
  const contestant = await db.getContestantById(contestantId)
  if (!contestant) return false
  
  // If contestant is eliminated before this week, they can't be scored
  if (contestant.eliminatedWeek && contestant.eliminatedWeek < week) {
    return false
  }
  
  return true
}

// Current week functions
export async function getCurrentWeek() {
  // For now, return week 4 as current
  return 4
}

export async function getWeekStatus(week: number) {
  const scores = await db.getWeeklyScores(week)
  return {
    week,
    hasScores: scores.length > 0,
    scoreCount: scores.length,
    isComplete: scores.length > 0 // Simplified for now
  }
}

// Calculate season totals for a player
export async function calculateSeasonTotals(playerId: number) {
  const playerTeams = await db.getTeamsByPlayerId(playerId)
  const contestantIds = playerTeams.map(t => t.contestantId)
  
  let totalPoints = 0
  
  // Get all weekly scores for this player's contestants
  const allScores = await db.getWeeklyScores()
  const playerScores = allScores.filter(score => contestantIds.includes(score.contestantId))
  
  // Sum up all points
  totalPoints = playerScores.reduce((sum, score) => sum + score.points, 0)
  
  // Update or create season total
  const existingTotal = await db.getSeasonTotalByPlayerId(playerId)
  if (existingTotal) {
    await db.updateSeasonTotal(playerId, totalPoints)
  } else {
    await db.createSeasonTotal(playerId, totalPoints)
  }
  
  return totalPoints
}

// Clear all data
export async function clearAllData() {
  return await db.clearAllData()
}

// Seed database
export async function seedDatabase() {
  return await db.seedDefaultData()
}

// Leaderboard functions
export async function getLeaderboard() {
  const players = await getAllPlayers()
  const seasonTotals = await getSeasonTotals()
  
  const leaderboard = players.map(player => {
    const total = seasonTotals.find(st => st.playerId === player.id)
    return {
      playerId: player.id,
      playerName: player.name,
      teamName: player.teamName,
      totalPoints: total ? total.totalPoints : 0
    }
  })
  
  return leaderboard.sort((a, b) => b.totalPoints - a.totalPoints)
}

export async function getPlayerWeeklyBreakdown(playerId: number) {
  const playerTeams = await getTeamsByPlayerId(playerId)
  const contestantIds = playerTeams.map(t => t.contestantId)
  
  const allScores = await getWeeklyScores()
  const playerScores = allScores.filter(score => contestantIds.includes(score.contestantId))
  
  // Group by week
  const weeklyBreakdown = playerScores.reduce((acc, score) => {
    if (!acc[score.week]) {
      acc[score.week] = []
    }
    acc[score.week].push(score)
    return acc
  }, {} as Record<number, any[]>)
  
  return weeklyBreakdown
}

// Validation functions
export async function validateWeeklyScoring(week: number, contestantId: number, category: string) {
  // Check if contestant is eliminated
  const contestant = await db.getContestantById(contestantId)
  if (!contestant) return false
  
  if (contestant.eliminatedWeek && contestant.eliminatedWeek < week) {
    return false
  }
  
  // Check for duplicate winners (star_baker, technical_win, last_technical are unique per week)
  if (['star_baker', 'technical_win', 'last_technical'].includes(category)) {
    const existingScores = await getWeeklyScores(week)
    const hasDuplicate = existingScores.some(score => 
      score.category === category && score.contestantId !== contestantId
    )
    if (hasDuplicate) return false
  }
  
  return true
}