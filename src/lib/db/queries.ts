import { db } from './index'
import { unstable_cache } from 'next/cache'
import { SCORING_CATEGORIES } from './index'

// Contestants
export async function createContestant(name: string, eliminatedWeek: number | null = null) {
  return await db.createContestant(name, eliminatedWeek)
}

export async function getContestants() {
  return await db.getContestants()
}

export async function getContestantById(id: number) {
  return await db.getContestantById(id)
}

export async function updateContestant(id: number, updates: { name?: string; eliminatedWeek?: number | null }) {
  return await db.updateContestant(id, updates)
}

export async function deleteContestant(id: number) {
  return await db.deleteContestant(id)
}

// Players
export async function createPlayer(name: string, teamName: string) {
  return await db.createPlayer(name, teamName)
}

export async function getPlayers() {
  return await db.getPlayers()
}

export async function getPlayerById(id: number) {
  return await db.getPlayerById(id)
}

export async function updatePlayer(id: number, updates: { name?: string; teamName?: string }) {
  return await db.updatePlayer(id, updates)
}

export async function deletePlayer(id: number) {
  return await db.deletePlayer(id)
}

// Teams
export async function createTeam(playerId: number, contestantId: number) {
  return await db.createTeam(playerId, contestantId)
}

export async function getTeamsByPlayerId(playerId: number) {
  const teams = await db.getTeamsByPlayerId(playerId)
  const contestants = await db.getContestants()
  
  // Add contestant names to teams
  return teams.map(team => {
    const contestant = contestants.find(c => c.id === team.contestantId)
    return {
      ...team,
      contestantName: contestant?.name || 'Unknown',
      eliminatedWeek: contestant?.eliminatedWeek || null
    }
  })
}

export async function updatePlayerTeam(playerId: number, contestantIds: number[]) {
  return await db.updatePlayerTeam(playerId, contestantIds)
}

// Weekly Scores
export async function createWeeklyScore(week: number, contestantId: number, category: string, points: number) {
  return await db.createWeeklyScore(week, contestantId, category, points)
}

export async function addWeeklyScore(week: number, contestantId: number, category: string, points: number) {
  return await db.createWeeklyScore(week, contestantId, category, points)
}

export async function getWeeklyScores(week?: number) {
  const scores = await db.getWeeklyScores(week)
  const contestants = await db.getContestants()
  
  // Add contestant names to scores
  return scores.map(score => {
    const contestant = contestants.find(c => c.id === score.contestantId)
    return {
      ...score,
      contestantName: contestant?.name || 'Unknown'
    }
  })
}

export async function getWeeklyScoreById(id: number) {
  const score = await db.getWeeklyScoreById(id)
  if (!score) return null
  
  const contestants = await db.getContestants()
  const contestant = contestants.find(c => c.id === score.contestantId)
  
  return {
    ...score,
    contestantName: contestant?.name || 'Unknown'
  }
}

export async function updateWeeklyScore(id: number, week: number, contestantId: number, category: string, points: number) {
  return await db.updateWeeklyScore(id, week, contestantId, category, points)
}

export async function deleteWeeklyScore(id: number) {
  return await db.deleteWeeklyScore(id)
}

// Season Totals
export async function createSeasonTotal(data: { playerId: number; week: number; contestantId: number; points: number; runningTotal: number }) {
  return await db.createSeasonTotal(data)
}

export async function getSeasonTotals() {
  const totals = await db.getSeasonTotals()
  const players = await db.getPlayers()
  const contestants = await db.getContestants()
  
  // Add player and contestant names to season totals
  return totals.map(total => {
    const player = players.find(p => p.id === total.playerId)
    const contestant = contestants.find(c => c.id === total.contestantId)
    return {
      ...total,
      playerName: player?.name || 'Unknown',
      contestantName: contestant?.name || 'Unknown'
    }
  })
}

export async function getSeasonTotalByPlayerId(playerId: number) {
  const totals = await db.getSeasonTotalByPlayerId(playerId)
  const contestants = await db.getContestants()
  
  // Add contestant names to season totals
  return totals.map(total => {
    const contestant = contestants.find(c => c.id === total.contestantId)
    return {
      ...total,
      contestantName: contestant?.name || 'Unknown'
    }
  })
}

export async function updateSeasonTotal(id: number, updates: { points?: number; runningTotal?: number }) {
  return await db.updateSeasonTotal(id, updates)
}

export async function deleteSeasonTotal(id: number) {
  return await db.deleteSeasonTotal(id)
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
    const existing = await db.getWeeklyScores(week)
    const hasDuplicate = existing.some(score => score.category === category)
    
    if (hasDuplicate) {
      return { valid: false, error: `Only one ${category} per week is allowed` }
    }
  }

  return { valid: true }
}

// Current week and status
export async function getCurrentWeek(): Promise<number> {
  // Season started on August 30, 2025 (Friday) - Week 1
  // Each week resets on Friday
  const seasonStartDate = new Date('2025-08-30') // Week 1 start
  const now = new Date()
  
  // Calculate the number of days since season start
  const daysSinceStart = Math.floor((now.getTime() - seasonStartDate.getTime()) / (1000 * 60 * 60 * 24))
  
  // Calculate which week we're in (7 days per week, starting from Week 1)
  const weekNumber = Math.floor(daysSinceStart / 7) + 1
  
  // Cap at Week 10 (maximum)
  return Math.min(weekNumber, 10)
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
  const allScores = await db.getWeeklyScores()
  
  // Clear existing season totals
  const existingTotals = await getSeasonTotals()
  for (const total of existingTotals) {
    await db.deleteSeasonTotal(total.id)
  }
  
  for (const player of allPlayers) {
    // Get all teams for this player
    const playerTeams = await getTeamsByPlayerId(player.id)
    const contestantIds = playerTeams.map(team => team.contestantId)
    
    if (contestantIds.length === 0) continue
    
    // Group scores by week and contestant
    const weeklyTotals: Record<number, Record<number, number>> = {}
    let runningTotal = 0
    
    // Process each week
    for (let week = 1; week <= 10; week++) {
      const weekScores = allScores.filter(score => 
        score.week === week && contestantIds.includes(score.contestantId)
      )
      
      if (weekScores.length > 0) {
        weeklyTotals[week] = {}
        
        for (const contestantId of contestantIds) {
          const contestantWeekScores = weekScores.filter(score => score.contestantId === contestantId)
          const contestantWeekPoints = contestantWeekScores.reduce((sum, score) => sum + score.points, 0)
          
          if (contestantWeekPoints > 0) {
            runningTotal += contestantWeekPoints
            weeklyTotals[week][contestantId] = contestantWeekPoints
            
            // Create season total entry
            await createSeasonTotal({
              playerId: player.id,
              week,
              contestantId,
              points: contestantWeekPoints,
              runningTotal
            })
          }
        }
      }
    }
  }
}

// Leaderboard
export async function getLeaderboard() {
  const seasonTotals = await getSeasonTotals()
  // Map to the expected leaderboard format with totalPoints field
  return seasonTotals.map(total => ({
    ...total,
    totalPoints: total.runningTotal
  }))
}

// Leaderboard as of a specific week
export async function getLeaderboardAsOfWeek(week: number) {
  const allPlayers = await getPlayers()
  const allScores = await db.getWeeklyScores()
  
  // Filter scores up to the specified week
  const scoresUpToWeek = allScores.filter(score => score.week <= week)
  
  const leaderboard = []
  
  for (const player of allPlayers) {
    // Get all teams for this player
    const playerTeams = await getTeamsByPlayerId(player.id)
    const contestantIds = playerTeams.map(team => team.contestantId)
    
    if (contestantIds.length === 0) continue
    
    // Calculate total points for this player up to the specified week
    const playerScores = scoresUpToWeek.filter(score => 
      contestantIds.includes(score.contestantId)
    )
    const totalPoints = playerScores.reduce((sum, score) => sum + score.points, 0)
    
    // Only include players with points
    if (totalPoints > 0) {
      leaderboard.push({
        id: player.id,
        playerId: player.id,
        playerName: player.name,
        teamName: player.teamName,
        totalPoints,
        week,
        contestantId: 0,
        points: 0,
        runningTotal: totalPoints,
        lastUpdated: new Date()
      })
    }
  }
  
  // Sort by total points descending
  return leaderboard.sort((a, b) => b.totalPoints - a.totalPoints)
}

// Player weekly breakdown
export async function getPlayerWeeklyBreakdown(playerId: number) {
  const playerTeams = await getTeamsByPlayerId(playerId)
  const contestantIds = playerTeams.map(team => team.contestantId)
  
  if (contestantIds.length === 0) return []
  
  const allScores = await db.getWeeklyScores()
  const playerScores = allScores.filter(score => contestantIds.includes(score.contestantId))
  
  // Add contestant names
  const contestants = await db.getContestants()
  return playerScores.map(score => {
    const contestant = contestants.find(c => c.id === score.contestantId)
    return {
      week: score.week,
      contestantName: contestant?.name || 'Unknown',
      category: score.category,
      points: score.points
    }
  })
}

// Alias for consistency
export const getWeeklyScoresByWeek = getWeeklyScores

// Additional functions needed by the UI
export async function getAllPlayers() {
  return await getPlayers()
}

export async function getAllContestants() {
  return await getContestants()
}

export async function getAllTeams() {
  const players = await getPlayers()
  const contestants = await getContestants()
  const allTeams = []
  
  // Get teams for each player
  for (const player of players) {
    const playerTeams = await db.getTeamsByPlayerId(player.id)
    for (const team of playerTeams) {
      const contestant = contestants.find(c => c.id === team.contestantId)
      allTeams.push({
        id: team.id,
        playerId: team.playerId,
        contestantId: team.contestantId,
        playerName: player.name,
        teamName: player.teamName,
        contestantName: contestant?.name || 'Unknown',
        eliminatedWeek: contestant?.eliminatedWeek || null,
        createdAt: team.createdAt
      })
    }
  }
  
  return allTeams
}

export async function deleteTeam(id: number) {
  // Note: This is a simplified implementation
  // In a real app, you'd need to track team IDs properly
  return true
}