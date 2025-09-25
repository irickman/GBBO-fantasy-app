// Vercel-compatible persistent storage using file system
// This will work with Vercel's serverless environment

import { promises as fs } from 'fs'
import path from 'path'

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
  totalPoints: number
  lastUpdated: Date
}

interface DatabaseData {
  players: Player[]
  contestants: Contestant[]
  teams: Team[]
  weeklyScores: WeeklyScore[]
  seasonTotals: SeasonTotal[]
  nextId: number
}

const DATA_FILE = path.join(process.cwd(), 'data', 'database.json')

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE)
  try {
    await fs.mkdir(dataDir, { recursive: true })
  } catch (error) {
    // Directory might already exist
  }
}

// Load data from file
async function loadData(): Promise<DatabaseData> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // File doesn't exist or is corrupted, return default data
    return {
      players: [],
      contestants: [],
      teams: [],
      weeklyScores: [],
      seasonTotals: [],
      nextId: 1
    }
  }
}

// Save data to file
async function saveData(data: DatabaseData): Promise<void> {
  await ensureDataDir()
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2))
}

// Convert date strings back to Date objects
function parseDates(data: any): DatabaseData {
  return {
    ...data,
    players: data.players.map((p: any) => ({ ...p, createdAt: new Date(p.createdAt) })),
    contestants: data.contestants.map((c: any) => ({ ...c, createdAt: new Date(c.createdAt) })),
    teams: data.teams.map((t: any) => ({ ...t, createdAt: new Date(t.createdAt) })),
    weeklyScores: data.weeklyScores.map((w: any) => ({ ...w, createdAt: new Date(w.createdAt) })),
    seasonTotals: data.seasonTotals.map((s: any) => ({ ...s, lastUpdated: new Date(s.lastUpdated) }))
  }
}

export const vercelDb = {
  // Players
  async createPlayer(name: string, teamName: string): Promise<Player> {
    const data = await loadData()
    const player: Player = {
      id: data.nextId++,
      name,
      teamName,
      createdAt: new Date()
    }
    data.players.push(player)
    await saveData(data)
    return player
  },

  async getPlayers(): Promise<Player[]> {
    const data = await loadData()
    return data.players
  },

  async getPlayerById(id: number): Promise<Player | null> {
    const data = await loadData()
    return data.players.find(p => p.id === id) || null
  },

  async updatePlayer(id: number, updates: Partial<Player>): Promise<Player | null> {
    const data = await loadData()
    const index = data.players.findIndex(p => p.id === id)
    if (index === -1) return null
    
    data.players[index] = { ...data.players[index], ...updates }
    await saveData(data)
    return data.players[index]
  },

  async deletePlayer(id: number): Promise<boolean> {
    const data = await loadData()
    const initialLength = data.players.length
    data.players = data.players.filter(p => p.id !== id)
    data.teams = data.teams.filter(t => t.playerId !== id)
    data.seasonTotals = data.seasonTotals.filter(s => s.playerId !== id)
    
    if (data.players.length < initialLength) {
      await saveData(data)
      return true
    }
    return false
  },

  // Contestants
  async createContestant(name: string, eliminatedWeek: number | null = null): Promise<Contestant> {
    const data = await loadData()
    const contestant: Contestant = {
      id: data.nextId++,
      name,
      eliminatedWeek,
      createdAt: new Date()
    }
    data.contestants.push(contestant)
    await saveData(data)
    return contestant
  },

  async getContestants(): Promise<Contestant[]> {
    const data = await loadData()
    return data.contestants
  },

  async getContestantById(id: number): Promise<Contestant | null> {
    const data = await loadData()
    return data.contestants.find(c => c.id === id) || null
  },

  async updateContestant(id: number, updates: Partial<Contestant>): Promise<Contestant | null> {
    const data = await loadData()
    const index = data.contestants.findIndex(c => c.id === id)
    if (index === -1) return null
    
    data.contestants[index] = { ...data.contestants[index], ...updates }
    await saveData(data)
    return data.contestants[index]
  },

  async deleteContestant(id: number): Promise<boolean> {
    const data = await loadData()
    const initialLength = data.contestants.length
    data.contestants = data.contestants.filter(c => c.id !== id)
    data.teams = data.teams.filter(t => t.contestantId !== id)
    data.weeklyScores = data.weeklyScores.filter(w => w.contestantId !== id)
    
    if (data.contestants.length < initialLength) {
      await saveData(data)
      return true
    }
    return false
  },

  // Teams
  async createTeam(playerId: number, contestantId: number): Promise<Team> {
    const data = await loadData()
    const team: Team = {
      id: data.nextId++,
      playerId,
      contestantId,
      createdAt: new Date()
    }
    data.teams.push(team)
    await saveData(data)
    return team
  },

  async getTeamsByPlayerId(playerId: number): Promise<Team[]> {
    const data = await loadData()
    return data.teams.filter(t => t.playerId === playerId)
  },

  async updatePlayerTeam(playerId: number, contestantIds: number[]): Promise<void> {
    const data = await loadData()
    // Remove existing teams for this player
    data.teams = data.teams.filter(t => t.playerId !== playerId)
    
    // Add new teams
    for (const contestantId of contestantIds) {
      const team: Team = {
        id: data.nextId++,
        playerId,
        contestantId,
        createdAt: new Date()
      }
      data.teams.push(team)
    }
    
    await saveData(data)
  },

  // Weekly Scores
  async createWeeklyScore(week: number, contestantId: number, category: string, points: number): Promise<WeeklyScore> {
    const data = await loadData()
    const score: WeeklyScore = {
      id: data.nextId++,
      week,
      contestantId,
      category,
      points,
      createdAt: new Date()
    }
    data.weeklyScores.push(score)
    await saveData(data)
    return score
  },

  async getWeeklyScores(week?: number): Promise<WeeklyScore[]> {
    const data = await loadData()
    if (week !== undefined) {
      return data.weeklyScores.filter(s => s.week === week)
    }
    return data.weeklyScores
  },

  async getWeeklyScoreById(id: number): Promise<WeeklyScore | null> {
    const data = await loadData()
    return data.weeklyScores.find(s => s.id === id) || null
  },

  async updateWeeklyScore(id: number, week: number, contestantId: number, category: string, points: number): Promise<WeeklyScore | null> {
    const data = await loadData()
    const index = data.weeklyScores.findIndex(s => s.id === id)
    if (index === -1) return null
    
    data.weeklyScores[index] = {
      ...data.weeklyScores[index],
      week,
      contestantId,
      category,
      points
    }
    await saveData(data)
    return data.weeklyScores[index]
  },

  async deleteWeeklyScore(id: number): Promise<boolean> {
    const data = await loadData()
    const initialLength = data.weeklyScores.length
    data.weeklyScores = data.weeklyScores.filter(s => s.id !== id)
    
    if (data.weeklyScores.length < initialLength) {
      await saveData(data)
      return true
    }
    return false
  },

  // Season Totals
  async createSeasonTotal(data: { playerId: number; totalPoints: number }): Promise<SeasonTotal> {
    const dbData = await loadData()
    const total: SeasonTotal = {
      id: dbData.nextId++,
      playerId: data.playerId,
      totalPoints: data.totalPoints,
      lastUpdated: new Date()
    }
    dbData.seasonTotals.push(total)
    await saveData(dbData)
    return total
  },

  async getSeasonTotals(): Promise<SeasonTotal[]> {
    const data = await loadData()
    return data.seasonTotals
  },

  async getSeasonTotalByPlayerId(playerId: number): Promise<SeasonTotal | null> {
    const data = await loadData()
    return data.seasonTotals.find(s => s.playerId === playerId) || null
  },

  async updateSeasonTotal(playerId: number, updates: { totalPoints: number }): Promise<SeasonTotal | null> {
    const data = await loadData()
    const index = data.seasonTotals.findIndex(s => s.playerId === playerId)
    if (index === -1) return null
    
    data.seasonTotals[index] = {
      ...data.seasonTotals[index],
      ...updates,
      lastUpdated: new Date()
    }
    await saveData(data)
    return data.seasonTotals[index]
  },

  // Seed default data
  async seedDefaultData(): Promise<void> {
    const data = await loadData()
    
    // Only seed if no contestants exist
    if (data.contestants.length === 0) {
      const defaultContestants = [
        'Tom', 'Jessika', 'Jasmine', 'Nataliia', 'Lesley', 'Iain', 
        'Toby', 'Aaron', 'Pui Man', 'Nadia', 'Leighton', 'Hassan'
      ]
      
      for (const name of defaultContestants) {
        data.contestants.push({
          id: data.nextId++,
          name,
          eliminatedWeek: null,
          createdAt: new Date()
        })
      }
      
      await saveData(data)
    }
  },

  // Clear all data
  async clearAllData(): Promise<void> {
    const data: DatabaseData = {
      players: [],
      contestants: [],
      teams: [],
      weeklyScores: [],
      seasonTotals: [],
      nextId: 1
    }
    await saveData(data)
  }
}
