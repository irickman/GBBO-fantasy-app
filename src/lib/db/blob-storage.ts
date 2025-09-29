// Vercel Blob storage implementation for persistent data
import { put, del, list, head } from '@vercel/blob'

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

interface DatabaseData {
  players: Player[]
  contestants: Contestant[]
  teams: Team[]
  weeklyScores: WeeklyScore[]
  seasonTotals: SeasonTotal[]
  nextId: number
}

// Default empty database
const defaultData: DatabaseData = {
  players: [],
  contestants: [],
  teams: [],
  weeklyScores: [],
  seasonTotals: [],
  nextId: 1
}

// Helper function to get data from blob storage
async function getData(): Promise<DatabaseData> {
  try {
    console.log('Fetching data from blob storage...')
    const { blobs } = await list({ prefix: 'database/' })
    console.log('Found blobs:', blobs.map(b => b.pathname))
    const dataBlob = blobs.find(blob => blob.pathname === 'database/data.json')
    
    if (!dataBlob) {
      console.log('No data blob found, returning default data')
      return defaultData
    }
    
    console.log('Found data blob:', dataBlob.pathname)
    
    const response = await fetch(dataBlob.url)
    if (!response.ok) {
      return defaultData
    }
    
    const data = await response.json()
    
    // Convert date strings back to Date objects
    if (data.players) {
      data.players = data.players.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt)
      }))
    }
    if (data.contestants) {
      data.contestants = data.contestants.map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt)
      }))
    }
    if (data.teams) {
      data.teams = data.teams.map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt)
      }))
    }
    if (data.weeklyScores) {
      data.weeklyScores = data.weeklyScores.map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt)
      }))
    }
    if (data.seasonTotals) {
      data.seasonTotals = data.seasonTotals.map((s: any) => ({
        ...s,
        lastUpdated: new Date(s.lastUpdated)
      }))
    }
    
    return data
  } catch (error) {
    console.error('Error fetching data from blob storage:', error)
    return defaultData
  }
}

// Helper function to save data to blob storage
async function saveData(data: DatabaseData): Promise<void> {
  try {
    console.log('Saving data to blob storage:', {
      players: data.players.length,
      contestants: data.contestants.length,
      teams: data.teams.length,
      weeklyScores: data.weeklyScores.length,
      seasonTotals: data.seasonTotals.length,
      nextId: data.nextId
    })
    
    const result = await put('database/data.json', JSON.stringify(data, null, 2), {
      access: 'public',
      addRandomSuffix: false
    })
    
    console.log('Data saved to blob storage successfully:', result.url)
  } catch (error) {
    console.error('Error saving data to blob storage:', error)
    throw error
  }
}

export const blobDb = {
  // Players
  async createPlayer(name: string, teamName: string): Promise<Player> {
    const data = await getData()
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
    const data = await getData()
    return data.players
  },

  async getPlayerById(id: number): Promise<Player | null> {
    const data = await getData()
    return data.players.find(p => p.id === id) || null
  },

  async updatePlayer(id: number, updates: Partial<Player>): Promise<Player | null> {
    const data = await getData()
    const index = data.players.findIndex(p => p.id === id)
    if (index === -1) return null
    
    data.players[index] = { ...data.players[index], ...updates }
    await saveData(data)
    return data.players[index]
  },

  async deletePlayer(id: number): Promise<boolean> {
    const data = await getData()
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
    const data = await getData()
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
    console.log('=== BLOB DB GET CONTESTANTS ===')
    const data = await getData()
    console.log('Data from blob storage:', {
      contestants: data.contestants.length,
      players: data.players.length,
      teams: data.teams.length,
      nextId: data.nextId
    })
    console.log('Contestants list:', data.contestants.map(c => ({ id: c.id, name: c.name, eliminatedWeek: c.eliminatedWeek })))
    return data.contestants
  },

  async getContestantById(id: number): Promise<Contestant | null> {
    const data = await getData()
    return data.contestants.find(c => c.id === id) || null
  },

  async updateContestant(id: number, updates: Partial<Contestant>): Promise<Contestant | null> {
    const data = await getData()
    const index = data.contestants.findIndex(c => c.id === id)
    if (index === -1) return null
    
    data.contestants[index] = { ...data.contestants[index], ...updates }
    await saveData(data)
    return data.contestants[index]
  },

  async deleteContestant(id: number): Promise<boolean> {
    console.log('=== BLOB DB DELETE CONTESTANT ===')
    console.log('Delete contestant ID:', id)
    
    const data = await getData()
    console.log('Current contestants:', data.contestants.length)
    console.log('Current contestants list:', data.contestants.map(c => ({ id: c.id, name: c.name })))
    
    const initialLength = data.contestants.length
    const contestantToDelete = data.contestants.find(c => c.id === id)
    console.log('Contestant to delete found:', !!contestantToDelete)
    if (contestantToDelete) {
      console.log('Contestant details:', contestantToDelete)
    }
    
    data.contestants = data.contestants.filter(c => c.id !== id)
    data.teams = data.teams.filter(t => t.contestantId !== id)
    data.weeklyScores = data.weeklyScores.filter(w => w.contestantId !== id)
    
    console.log('After filtering - contestants:', data.contestants.length)
    console.log('After filtering - teams:', data.teams.length)
    console.log('After filtering - weekly scores:', data.weeklyScores.length)
    
    if (data.contestants.length < initialLength) {
      console.log('Contestant was found and removed, saving data...')
      await saveData(data)
      console.log('Data saved successfully')
      return true
    }
    console.log('No contestant was removed')
    return false
  },

  // Teams
  async createTeam(playerId: number, contestantId: number): Promise<Team> {
    const data = await getData()
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
    const data = await getData()
    return data.teams.filter(t => t.playerId === playerId)
  },

  async updatePlayerTeam(playerId: number, contestantIds: number[]): Promise<void> {
    const data = await getData()
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
    const data = await getData()
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
    const data = await getData()
    if (week !== undefined) {
      return data.weeklyScores.filter(s => s.week === week)
    }
    return data.weeklyScores
  },

  async getWeeklyScoreById(id: number): Promise<WeeklyScore | null> {
    const data = await getData()
    return data.weeklyScores.find(s => s.id === id) || null
  },

  async updateWeeklyScore(id: number, week: number, contestantId: number, category: string, points: number): Promise<WeeklyScore | null> {
    const data = await getData()
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
    const data = await getData()
    const initialLength = data.weeklyScores.length
    data.weeklyScores = data.weeklyScores.filter(s => s.id !== id)
    
    if (data.weeklyScores.length < initialLength) {
      await saveData(data)
      return true
    }
    return false
  },

  // Season Totals
  async createSeasonTotal(data: { playerId: number; week: number; contestantId: number; points: number; runningTotal: number }): Promise<SeasonTotal> {
    const dbData = await getData()
    const total: SeasonTotal = {
      id: dbData.nextId++,
      playerId: data.playerId,
      week: data.week,
      contestantId: data.contestantId,
      points: data.points,
      runningTotal: data.runningTotal,
      lastUpdated: new Date()
    }
    dbData.seasonTotals.push(total)
    await saveData(dbData)
    return total
  },

  async getSeasonTotals(): Promise<SeasonTotal[]> {
    const data = await getData()
    return data.seasonTotals
  },

  async getSeasonTotalByPlayerId(playerId: number): Promise<SeasonTotal[]> {
    const data = await getData()
    return data.seasonTotals.filter(s => s.playerId === playerId)
  },

  async updateSeasonTotal(id: number, updates: { points?: number; runningTotal?: number }): Promise<SeasonTotal | null> {
    const data = await getData()
    const index = data.seasonTotals.findIndex(s => s.id === id)
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
    const data = await getData()
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
    await saveData(defaultData)
  }
}
