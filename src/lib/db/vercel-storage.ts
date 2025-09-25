// Vercel-compatible storage using in-memory with seeding
// This will work with Vercel's serverless environment

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

// In-memory storage (will be lost on server restart, but can be seeded)
let players: Player[] = []
let contestants: Contestant[] = []
let teams: Team[] = []
let weeklyScores: WeeklyScore[] = []
let seasonTotals: SeasonTotal[] = []

let nextId = 1

export const vercelDb = {
  // Players
  async createPlayer(name: string, teamName: string): Promise<Player> {
    const player: Player = {
      id: nextId++,
      name,
      teamName,
      createdAt: new Date()
    }
    players.push(player)
    return player
  },

  async getPlayers(): Promise<Player[]> {
    return players
  },

  async getPlayerById(id: number): Promise<Player | null> {
    return players.find(p => p.id === id) || null
  },

  async updatePlayer(id: number, updates: Partial<Player>): Promise<Player | null> {
    const index = players.findIndex(p => p.id === id)
    if (index === -1) return null
    
    players[index] = { ...players[index], ...updates }
    return players[index]
  },

  async deletePlayer(id: number): Promise<boolean> {
    const initialLength = players.length
    players = players.filter(p => p.id !== id)
    teams = teams.filter(t => t.playerId !== id)
    seasonTotals = seasonTotals.filter(s => s.playerId !== id)
    return players.length < initialLength
  },

  // Contestants
  async createContestant(name: string, eliminatedWeek: number | null = null): Promise<Contestant> {
    const contestant: Contestant = {
      id: nextId++,
      name,
      eliminatedWeek,
      createdAt: new Date()
    }
    contestants.push(contestant)
    return contestant
  },

  async getContestants(): Promise<Contestant[]> {
    return contestants
  },

  async getContestantById(id: number): Promise<Contestant | null> {
    return contestants.find(c => c.id === id) || null
  },

  async updateContestant(id: number, updates: Partial<Contestant>): Promise<Contestant | null> {
    const index = contestants.findIndex(c => c.id === id)
    if (index === -1) return null
    
    contestants[index] = { ...contestants[index], ...updates }
    return contestants[index]
  },

  async deleteContestant(id: number): Promise<boolean> {
    const initialLength = contestants.length
    contestants = contestants.filter(c => c.id !== id)
    teams = teams.filter(t => t.contestantId !== id)
    weeklyScores = weeklyScores.filter(w => w.contestantId !== id)
    return contestants.length < initialLength
  },

  // Teams
  async createTeam(playerId: number, contestantId: number): Promise<Team> {
    const team: Team = {
      id: nextId++,
      playerId,
      contestantId,
      createdAt: new Date()
    }
    teams.push(team)
    return team
  },

  async getTeamsByPlayerId(playerId: number): Promise<Team[]> {
    return teams.filter(t => t.playerId === playerId)
  },

  async updatePlayerTeam(playerId: number, contestantIds: number[]): Promise<void> {
    // Remove existing teams for this player
    teams = teams.filter(t => t.playerId !== playerId)
    
    // Add new teams
    for (const contestantId of contestantIds) {
      const team: Team = {
        id: nextId++,
        playerId,
        contestantId,
        createdAt: new Date()
      }
      teams.push(team)
    }
  },

  // Weekly Scores
  async createWeeklyScore(week: number, contestantId: number, category: string, points: number): Promise<WeeklyScore> {
    const score: WeeklyScore = {
      id: nextId++,
      week,
      contestantId,
      category,
      points,
      createdAt: new Date()
    }
    weeklyScores.push(score)
    return score
  },

  async getWeeklyScores(week?: number): Promise<WeeklyScore[]> {
    if (week !== undefined) {
      return weeklyScores.filter(s => s.week === week)
    }
    return weeklyScores
  },

  async getWeeklyScoreById(id: number): Promise<WeeklyScore | null> {
    return weeklyScores.find(s => s.id === id) || null
  },

  async updateWeeklyScore(id: number, week: number, contestantId: number, category: string, points: number): Promise<WeeklyScore | null> {
    const index = weeklyScores.findIndex(s => s.id === id)
    if (index === -1) return null
    
    weeklyScores[index] = {
      ...weeklyScores[index],
      week,
      contestantId,
      category,
      points
    }
    return weeklyScores[index]
  },

  async deleteWeeklyScore(id: number): Promise<boolean> {
    const initialLength = weeklyScores.length
    weeklyScores = weeklyScores.filter(s => s.id !== id)
    return weeklyScores.length < initialLength
  },

  // Season Totals
  async createSeasonTotal(data: { playerId: number; totalPoints: number }): Promise<SeasonTotal> {
    const total: SeasonTotal = {
      id: nextId++,
      playerId: data.playerId,
      totalPoints: data.totalPoints,
      lastUpdated: new Date()
    }
    seasonTotals.push(total)
    return total
  },

  async getSeasonTotals(): Promise<SeasonTotal[]> {
    return seasonTotals
  },

  async getSeasonTotalByPlayerId(playerId: number): Promise<SeasonTotal | null> {
    return seasonTotals.find(s => s.playerId === playerId) || null
  },

  async updateSeasonTotal(playerId: number, updates: { totalPoints: number }): Promise<SeasonTotal | null> {
    const index = seasonTotals.findIndex(s => s.playerId === playerId)
    if (index === -1) return null
    
    seasonTotals[index] = {
      ...seasonTotals[index],
      ...updates,
      lastUpdated: new Date()
    }
    return seasonTotals[index]
  },

  // Seed default data
  async seedDefaultData(): Promise<void> {
    // Only seed if no contestants exist
    if (contestants.length === 0) {
      const defaultContestants = [
        'Tom', 'Jessika', 'Jasmine', 'Nataliia', 'Lesley', 'Iain', 
        'Toby', 'Aaron', 'Pui Man', 'Nadia', 'Leighton', 'Hassan'
      ]
      
      for (const name of defaultContestants) {
        contestants.push({
          id: nextId++,
          name,
          eliminatedWeek: null,
          createdAt: new Date()
        })
      }
    }
  },

  // Clear all data
  async clearAllData(): Promise<void> {
    players = []
    contestants = []
    teams = []
    weeklyScores = []
    seasonTotals = []
    nextId = 1
  }
}