// Prisma database implementation
import { PrismaClient } from '@prisma/client'

// Global prisma client to prevent multiple instances in development
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Type definitions matching blob-storage interface
interface Player {
  id: number
  name: string
  teamName: string
  createdAt: Date
}

interface Contestant {
  id: number
  name: string
  eliminatedWeek: number | null
  createdAt: Date
}

interface Team {
  id: number
  playerId: number
  contestantId: number
  createdAt: Date
}

interface WeeklyScore {
  id: number
  week: number
  contestantId: number
  category: string
  points: number
  createdAt: Date
}

interface SeasonTotal {
  id: number
  playerId: number
  week: number
  contestantId: number
  points: number
  runningTotal: number
  lastUpdated: Date
}

export const prismaDb = {
  // Players
  async createPlayer(name: string, teamName: string): Promise<Player> {
    const player = await prisma.player.create({
      data: { name, teamName }
    })
    return player
  },

  async getPlayers(): Promise<Player[]> {
    return await prisma.player.findMany({
      orderBy: { createdAt: 'asc' }
    })
  },

  async getPlayerById(id: number): Promise<Player | null> {
    return await prisma.player.findUnique({
      where: { id }
    })
  },

  async updatePlayer(id: number, updates: Partial<Player>): Promise<Player | null> {
    try {
      return await prisma.player.update({
        where: { id },
        data: updates
      })
    } catch {
      return null
    }
  },

  async deletePlayer(id: number): Promise<boolean> {
    try {
      await prisma.player.delete({
        where: { id }
      })
      return true
    } catch {
      return false
    }
  },

  // Contestants
  async createContestant(name: string, eliminatedWeek: number | null = null): Promise<Contestant> {
    const contestant = await prisma.contestant.create({
      data: { name, eliminatedWeek }
    })
    return contestant
  },

  async getContestants(): Promise<Contestant[]> {
    return await prisma.contestant.findMany({
      orderBy: { createdAt: 'asc' }
    })
  },

  async getContestantById(id: number): Promise<Contestant | null> {
    return await prisma.contestant.findUnique({
      where: { id }
    })
  },

  async updateContestant(id: number, updates: Partial<Contestant>): Promise<Contestant | null> {
    try {
      return await prisma.contestant.update({
        where: { id },
        data: updates
      })
    } catch {
      return null
    }
  },

  async deleteContestant(id: number): Promise<boolean> {
    try {
      await prisma.contestant.delete({
        where: { id }
      })
      return true
    } catch {
      return false
    }
  },

  // Teams
  async createTeam(playerId: number, contestantId: number): Promise<Team> {
    const team = await prisma.team.create({
      data: { 
        playerId, 
        contestantId,
        isActive: true
      }
    })
    return {
      id: team.id,
      playerId: team.playerId,
      contestantId: team.contestantId,
      createdAt: team.createdAt
    }
  },

  async getTeamsByPlayerId(playerId: number): Promise<Team[]> {
    const teams = await prisma.team.findMany({
      where: { playerId, isActive: true },
      orderBy: { createdAt: 'asc' }
    })
    return teams.map(team => ({
      id: team.id,
      playerId: team.playerId,
      contestantId: team.contestantId,
      createdAt: team.createdAt
    }))
  },

  async updatePlayerTeam(playerId: number, contestantIds: number[]): Promise<void> {
    // Mark all existing teams as inactive
    await prisma.team.updateMany({
      where: { playerId },
      data: { isActive: false }
    })
    
    // Create new teams
    for (const contestantId of contestantIds) {
      await prisma.team.create({
        data: { 
          playerId, 
          contestantId,
          isActive: true
        }
      })
    }
  },

  // Weekly Scores
  async createWeeklyScore(week: number, contestantId: number, category: string, points: number): Promise<WeeklyScore> {
    const score = await prisma.weeklyScore.create({
      data: { week, contestantId, category, points }
    })
    return score
  },

  async getWeeklyScores(week?: number): Promise<WeeklyScore[]> {
    if (week !== undefined) {
      return await prisma.weeklyScore.findMany({
        where: { week },
        orderBy: { createdAt: 'asc' }
      })
    }
    return await prisma.weeklyScore.findMany({
      orderBy: [{ week: 'asc' }, { createdAt: 'asc' }]
    })
  },

  async getWeeklyScoreById(id: number): Promise<WeeklyScore | null> {
    return await prisma.weeklyScore.findUnique({
      where: { id }
    })
  },

  async updateWeeklyScore(id: number, week: number, contestantId: number, category: string, points: number): Promise<WeeklyScore | null> {
    try {
      return await prisma.weeklyScore.update({
        where: { id },
        data: { week, contestantId, category, points }
      })
    } catch {
      return null
    }
  },

  async deleteWeeklyScore(id: number): Promise<boolean> {
    try {
      await prisma.weeklyScore.delete({
        where: { id }
      })
      return true
    } catch {
      return false
    }
  },

  // Season Totals
  async createSeasonTotal(data: { playerId: number; week: number; contestantId: number; points: number; runningTotal: number }): Promise<SeasonTotal> {
    // Note: Prisma schema has SeasonTotal.playerId as unique, but the blob storage allows multiple entries per player
    // We need to adjust this - for now, we'll use a workaround by storing in a different way
    // The schema needs to be updated to allow multiple season totals per player (one per week/contestant)
    
    // For now, let's just store the latest total per player
    const existing = await prisma.seasonTotal.findUnique({
      where: { playerId: data.playerId }
    })

    if (existing) {
      const updated = await prisma.seasonTotal.update({
        where: { playerId: data.playerId },
        data: { totalPoints: data.runningTotal }
      })
      return {
        id: updated.id,
        playerId: updated.playerId,
        week: data.week,
        contestantId: data.contestantId,
        points: data.points,
        runningTotal: updated.totalPoints,
        lastUpdated: updated.lastUpdated
      }
    }

    const total = await prisma.seasonTotal.create({
      data: {
        playerId: data.playerId,
        totalPoints: data.runningTotal
      }
    })
    
    return {
      id: total.id,
      playerId: total.playerId,
      week: data.week,
      contestantId: data.contestantId,
      points: data.points,
      runningTotal: total.totalPoints,
      lastUpdated: total.lastUpdated
    }
  },

  async getSeasonTotals(): Promise<SeasonTotal[]> {
    const totals = await prisma.seasonTotal.findMany({
      orderBy: { totalPoints: 'desc' }
    })
    // Map to match the expected interface
    return totals.map(total => ({
      id: total.id,
      playerId: total.playerId,
      week: 0, // Not stored in current schema
      contestantId: 0, // Not stored in current schema
      points: 0, // Not stored in current schema
      runningTotal: total.totalPoints,
      lastUpdated: total.lastUpdated
    }))
  },

  async getSeasonTotalByPlayerId(playerId: number): Promise<SeasonTotal[]> {
    const total = await prisma.seasonTotal.findUnique({
      where: { playerId }
    })
    if (!total) return []
    return [{
      id: total.id,
      playerId: total.playerId,
      week: 0,
      contestantId: 0,
      points: 0,
      runningTotal: total.totalPoints,
      lastUpdated: total.lastUpdated
    }]
  },

  async updateSeasonTotal(id: number, updates: { points?: number; runningTotal?: number }): Promise<SeasonTotal | null> {
    try {
      const updated = await prisma.seasonTotal.update({
        where: { id },
        data: { 
          totalPoints: updates.runningTotal ?? updates.points ?? 0
        }
      })
      return {
        id: updated.id,
        playerId: updated.playerId,
        week: 0,
        contestantId: 0,
        points: 0,
        runningTotal: updated.totalPoints,
        lastUpdated: updated.lastUpdated
      }
    } catch {
      return null
    }
  },

  async deleteSeasonTotal(id: number): Promise<boolean> {
    try {
      await prisma.seasonTotal.delete({
        where: { id }
      })
      return true
    } catch {
      return false
    }
  },

  // Seed default data
  async seedDefaultData(): Promise<void> {
    const existingContestants = await prisma.contestant.count()
    if (existingContestants === 0) {
      const defaultContestants = [
        'Tom', 'Jessika', 'Jasmine', 'Nataliia', 'Lesley', 'Iain', 
        'Toby', 'Aaron', 'Pui Man', 'Nadia', 'Leighton', 'Hassan'
      ]
      
      for (const name of defaultContestants) {
        await prisma.contestant.create({
          data: { name, eliminatedWeek: null }
        })
      }
    }
  },

  // Clear all data
  async clearAllData(): Promise<void> {
    await prisma.seasonTotal.deleteMany()
    await prisma.weeklyScore.deleteMany()
    await prisma.team.deleteMany()
    await prisma.contestant.deleteMany()
    await prisma.player.deleteMany()
  }
}

