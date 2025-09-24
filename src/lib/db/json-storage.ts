// Temporary JSON-based storage for Vercel deployment
// This will be replaced with proper Postgres once database is set up

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

// In-memory storage (will be lost on server restart)
let players: Player[] = []
let contestants: Contestant[] = []
let teams: Team[] = []
let weeklyScores: WeeklyScore[] = []
let seasonTotals: SeasonTotal[] = []

let nextId = 1

export const jsonDb = {
  // Players
  async createPlayer(data: Omit<Player, 'id' | 'createdAt'>) {
    const player = { ...data, id: nextId++, createdAt: new Date() }
    players.push(player)
    return player
  },

  async getPlayers() {
    return players
  },

  async getPlayerById(id: number) {
    return players.find(p => p.id === id)
  },

  async updatePlayer(id: number, data: Partial<Omit<Player, 'id' | 'createdAt'>>) {
    const index = players.findIndex(p => p.id === id)
    if (index !== -1) {
      players[index] = { ...players[index], ...data }
      return players[index]
    }
    return null
  },

  async deletePlayer(id: number) {
    const index = players.findIndex(p => p.id === id)
    if (index !== -1) {
      players.splice(index, 1)
      // Also delete associated teams and season totals
      teams = teams.filter(t => t.playerId !== id)
      seasonTotals = seasonTotals.filter(st => st.playerId !== id)
      return true
    }
    return false
  },

  // Contestants
  async createContestant(data: Omit<Contestant, 'id' | 'createdAt'>) {
    const contestant = { ...data, id: nextId++, createdAt: new Date() }
    contestants.push(contestant)
    return contestant
  },

  async getContestants() {
    return contestants
  },

  async getContestantById(id: number) {
    return contestants.find(c => c.id === id)
  },

  async updateContestant(id: number, data: Partial<Omit<Contestant, 'id' | 'createdAt'>>) {
    const index = contestants.findIndex(c => c.id === id)
    if (index !== -1) {
      contestants[index] = { ...contestants[index], ...data }
      return contestants[index]
    }
    return null
  },

  async deleteContestant(id: number) {
    const index = contestants.findIndex(c => c.id === id)
    if (index !== -1) {
      contestants.splice(index, 1)
      // Also delete associated teams and weekly scores
      teams = teams.filter(t => t.contestantId !== id)
      weeklyScores = weeklyScores.filter(ws => ws.contestantId !== id)
      return true
    }
    return false
  },

  // Teams
  async createTeam(data: Omit<Team, 'id' | 'createdAt'>) {
    const team = { ...data, id: nextId++, createdAt: new Date() }
    teams.push(team)
    return team
  },

  async getTeams() {
    return teams
  },

  async getTeamsByPlayerId(playerId: number) {
    return teams.filter(t => t.playerId === playerId)
  },

  async updateTeam(id: number, data: Partial<Omit<Team, 'id' | 'createdAt'>>) {
    const index = teams.findIndex(t => t.id === id)
    if (index !== -1) {
      teams[index] = { ...teams[index], ...data }
      return teams[index]
    }
    return null
  },

  async deleteTeam(id: number) {
    const index = teams.findIndex(t => t.id === id)
    if (index !== -1) {
      teams.splice(index, 1)
      return true
    }
    return false
  },

  // Weekly Scores
  async createWeeklyScore(data: Omit<WeeklyScore, 'id' | 'createdAt'>) {
    const score = { ...data, id: nextId++, createdAt: new Date() }
    weeklyScores.push(score)
    return score
  },

  async getWeeklyScores(week?: number) {
    if (week) {
      return weeklyScores.filter(ws => ws.week === week)
    }
    return weeklyScores
  },

  async getWeeklyScoreById(id: number) {
    return weeklyScores.find(ws => ws.id === id)
  },

  async updateWeeklyScore(id: number, data: Partial<Omit<WeeklyScore, 'id' | 'createdAt'>>) {
    const index = weeklyScores.findIndex(ws => ws.id === id)
    if (index !== -1) {
      weeklyScores[index] = { ...weeklyScores[index], ...data }
      return weeklyScores[index]
    }
    return null
  },

  async deleteWeeklyScore(id: number) {
    const index = weeklyScores.findIndex(ws => ws.id === id)
    if (index !== -1) {
      weeklyScores.splice(index, 1)
      return true
    }
    return false
  },

  // Season Totals
  async createSeasonTotal(data: Omit<SeasonTotal, 'id' | 'lastUpdated'>) {
    const total = { ...data, id: nextId++, lastUpdated: new Date() }
    seasonTotals.push(total)
    return total
  },

  async getSeasonTotals() {
    return seasonTotals
  },

  async getSeasonTotalByPlayerId(playerId: number) {
    return seasonTotals.find(st => st.playerId === playerId)
  },

  async updateSeasonTotal(playerId: number, data: Partial<Omit<SeasonTotal, 'id' | 'lastUpdated'>>) {
    const index = seasonTotals.findIndex(st => st.playerId === playerId)
    if (index !== -1) {
      seasonTotals[index] = { ...seasonTotals[index], ...data, lastUpdated: new Date() }
      return seasonTotals[index]
    }
    return null
  },

  // Utility functions
  async clearAllData() {
    players = []
    contestants = []
    teams = []
    weeklyScores = []
    seasonTotals = []
    nextId = 1
  },

  async seedDefaultData() {
    if (contestants.length === 0) {
      const defaultContestants = [
        'Tom', 'Jessika', 'Jasmine', 'Nataliia', 'Lesley', 'Iain', 
        'Toby', 'Aaron', 'Pui Man', 'Nadia', 'Leighton', 'Hassan'
      ]
      
      for (const name of defaultContestants) {
        await this.createContestant({ name, eliminatedWeek: null })
      }
    }
  }
}

export type { Player, Contestant, Team, WeeklyScore, SeasonTotal }
