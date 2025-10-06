'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Format category names for display
const formatCategoryName = (category: string) => {
  return category
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

interface LeaderboardEntry {
  playerId: number
  playerName: string
  teamName: string
  totalPoints: number
}

interface WeeklyScore {
  id: number
  week: number
  contestantId: number
  contestantName: string
  category: string
  points: number
}

interface WeeklyScoreData {
  week: number
  scores: WeeklyScore[]
}

interface Team {
  teamId: number
  playerId: number
  playerName: string
  teamName: string
  contestantId: number
  contestantName: string
  eliminatedWeek?: number | null
}

export default function DashboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [week3Scores, setWeek3Scores] = useState<WeeklyScore[]>([])
  const [allWeeklyScores, setAllWeeklyScores] = useState<WeeklyScoreData[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedPlayer, setExpandedPlayer] = useState<number | null>(null)
  const [playerDetails, setPlayerDetails] = useState<Record<number, any>>({})
  const [showAdminMenu, setShowAdminMenu] = useState(false)
  const [currentWeek, setCurrentWeek] = useState(2)
  const [selectedWeek, setSelectedWeek] = useState(2)
  const [weekStatus, setWeekStatus] = useState<any>(null)
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set())

  // Load data initially
  useEffect(() => {
    loadData()
  }, [])
  
  // Reload data when selected week changes
  useEffect(() => {
    if (currentWeek > 0) {
      loadData(selectedWeek)
    }
  }, [selectedWeek])

  // Close admin menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAdminMenu && !(event.target as Element).closest('.admin-menu')) {
        setShowAdminMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAdminMenu])

  const loadData = async (asOfWeek?: number) => {
    try {
      setLoading(true)
      const weekParam = asOfWeek ? `?asOfWeek=${asOfWeek}` : ''
      
      const [leaderboardRes, currentWeekRes, teamsRes, weeklyScoresRes] = await Promise.all([
        fetch(`/api/leaderboard${weekParam}`).then(r => r.json()),
        fetch('/api/current-week').then(r => r.json()),
        fetch(`/api/teams${weekParam}`).then(r => r.json()),
        fetch('/api/weekly-scores').then(r => r.json())
      ])
      
      if (leaderboardRes.leaderboard) {
        setLeaderboard(leaderboardRes.leaderboard)
      }
      
      if (currentWeekRes.currentWeek) {
        const currentWeekNum = currentWeekRes.currentWeek
        setCurrentWeek(currentWeekNum)
        setWeekStatus(currentWeekRes.weekStatus)
        
        // Initialize selectedWeek to currentWeek on first load
        if (!asOfWeek) {
          setSelectedWeek(currentWeekNum)
        }
        
        // Load scores for the selected week
        const targetWeek = asOfWeek || currentWeekNum
        const weekScoresRes = await fetch(`/api/weekly-scores/${targetWeek}`).then(r => r.json())
        if (weekScoresRes.scores) {
          setWeek3Scores(weekScoresRes.scores)
        }
      }
      
      if (teamsRes.teams) {
        setTeams(teamsRes.teams)
      }
      
      if (weeklyScoresRes.weeklyScores) {
        setAllWeeklyScores(weeklyScoresRes.weeklyScores)
      }
    } catch (err) {
      setError('Failed to load data')
      console.error('loadData error', err)
    } finally {
      setLoading(false)
    }
  }

  const loadPlayerDetails = async (playerId: number) => {
    if (playerDetails[playerId]) return
    
    try {
      const response = await fetch(`/api/leaderboard/${playerId}`)
      if (response.ok) {
        const data = await response.json()
        setPlayerDetails(prev => ({
          ...prev,
          [playerId]: data.breakdown || []
        }))
      }
    } catch (err) {
      console.error('loadPlayerDetails error', err)
    }
  }

  const togglePlayerExpansion = async (playerId: number) => {
    if (expandedPlayer === playerId) {
      setExpandedPlayer(null)
    } else {
      setExpandedPlayer(playerId)
      await loadPlayerDetails(playerId)
    }
  }

  const getPlayerContestants = (playerId: number) => {
    return teams
      .filter(team => team.playerId === playerId)
      .map(team => ({
        id: team.contestantId,
        name: team.contestantName,
        eliminatedWeek: team.eliminatedWeek
      }))
  }

  const getPlayerWeeklyPoints = (playerId: number, week: number) => {
    const playerContestants = getPlayerContestants(playerId).map(c => c.id)
    const weekData = allWeeklyScores.find(w => w.week === week)
    
    if (!weekData) return 0
    
    return weekData.scores
      .filter(score => playerContestants.includes(score.contestantId))
      .reduce((total, score) => total + score.points, 0)
  }

  const getPlayerName = (playerId: number) => {
    const player = leaderboard.find(p => p.playerId === playerId)
    return player ? player.playerName : `Player ${playerId}`
  }

  const toggleWeekExpansion = (week: number) => {
    setExpandedWeeks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(week)) {
        newSet.delete(week)
      } else {
        newSet.add(week)
      }
      return newSet
    })
  }

  const getAllWeeks = () => {
    const weeks = []
    // Only show weeks up to the selected week
    for (let week = 2; week <= selectedWeek; week++) {
      weeks.push(week)
    }
    return weeks.sort((a, b) => b - a) // Most recent first
  }

  const hasScoresForWeek = (week: number) => {
    return allWeeklyScores.some(w => w.week === week)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-amber-800 mb-2">
                🧁 GBBO Fantasy League
              </h1>
              <p className="text-amber-600">
                {weekStatus?.hasScores ? `Week ${currentWeek - 1} Complete` : 'No scores yet'} • 
                Week {currentWeek} {weekStatus?.hasScores ? 'Next' : 'Current'}
              </p>
            </div>
            <div className="relative admin-menu">
              <button
                onClick={() => setShowAdminMenu(!showAdminMenu)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
              >
                ⚙️ Admin
              </button>
              {showAdminMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-amber-200 z-10">
                  <div className="py-1">
                    <Link
                      href="/admin/scoring"
                      className="block px-4 py-2 text-sm text-amber-700 hover:bg-amber-50"
                      onClick={() => setShowAdminMenu(false)}
                    >
                      Enter Week {currentWeek} Scores
                    </Link>
                    <Link
                      href="/admin/teams"
                      className="block px-4 py-2 text-sm text-amber-700 hover:bg-amber-50"
                      onClick={() => setShowAdminMenu(false)}
                    >
                      Manage Teams
                    </Link>
                    <Link
                      href={`/admin/contestants?week=${selectedWeek}`}
                      className="block px-4 py-2 text-sm text-amber-700 hover:bg-amber-50"
                      onClick={() => setShowAdminMenu(false)}
                    >
                      Manage Contestants
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Week Selector */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="flex items-center gap-3 bg-white rounded-lg shadow-md p-4 border-2 border-amber-200">
              <label htmlFor="week-selector" className="text-amber-900 font-semibold">
                View Week:
              </label>
              <select
                id="week-selector"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(parseInt(e.target.value, 10))}
                className="bg-amber-50 border-2 border-amber-300 text-amber-900 font-semibold rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                {Array.from({ length: currentWeek }, (_, i) => i + 1).map((week) => (
                  <option key={week} value={week}>
                    Week {week}{week === currentWeek ? ' (Current)' : ''}
                  </option>
                ))}
              </select>
              {selectedWeek < currentWeek && (
                <>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-300">
                    📅 Historical View
                  </span>
                  <button
                    onClick={() => setSelectedWeek(currentWeek)}
                    className="text-sm bg-amber-600 hover:bg-amber-700 text-white font-medium px-3 py-1 rounded-md transition-colors"
                  >
                    Jump to Current
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 h-full min-h-[600px]">
          {/* Current Leaderboard */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-amber-900 mb-4">🏆 Current Standings</h2>
            
            {leaderboard.length === 0 ? (
              <p className="text-amber-600">No scores recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div key={entry.playerId} className="rounded-lg border-2 border-amber-200 overflow-hidden">
                    <div 
                      className="p-4 cursor-pointer hover:bg-amber-50 transition-colors"
                      onClick={() => togglePlayerExpansion(entry.playerId)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                          <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-white text-xs sm:text-sm ${
                            index === 0 ? 'bg-yellow-500' : 
                            index === 1 ? 'bg-gray-400' : 
                            index === 2 ? 'bg-amber-600' : 'bg-amber-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-amber-900 text-sm sm:text-base truncate">{entry.playerName}</div>
                            <div className="text-xs sm:text-sm text-amber-600 truncate">{entry.teamName}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <div className="text-lg sm:text-2xl font-bold text-amber-800">
                            {entry.totalPoints}
                          </div>
                          <div className="text-amber-600 text-sm sm:text-base">
                            {expandedPlayer === entry.playerId ? '▼' : '▶'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {expandedPlayer === entry.playerId && (
                      <div className="border-t border-amber-200 bg-amber-50 p-4">
                        <h4 className="font-semibold text-amber-900 mb-3">Team Details</h4>
                        {playerDetails[entry.playerId] ? (
                          <div className="space-y-4">
                            {/* Contestants Section */}
                            <div>
                              <h5 className="font-medium text-amber-800 mb-2">Contestants</h5>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                {teams.length > 0 ? (
                                  getPlayerContestants(entry.playerId).length > 0 ? (
                                    getPlayerContestants(entry.playerId).map(contestant => (
                                      <div key={contestant.id} className="bg-white border border-amber-200 rounded p-2">
                                        <div className="font-medium text-amber-800">{contestant.name}</div>
                                        {contestant.eliminatedWeek && (
                                          <div className="text-xs text-red-600">
                                            Eliminated Week {contestant.eliminatedWeek}
                                          </div>
                                        )}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-amber-600">No contestants found for this player</div>
                                  )
                                ) : (
                                  <div className="text-amber-600">Loading teams data...</div>
                                )}
                              </div>
                            </div>
                            
                            {/* Weekly Breakdown Section */}
                            <div>
                              <h5 className="font-medium text-amber-800 mb-2">Weekly Breakdown</h5>
                              <div className="space-y-2">
                                {Object.entries(
                                  playerDetails[entry.playerId].reduce((acc: any, score: any) => {
                                    if (!acc[score.week]) acc[score.week] = []
                                    acc[score.week].push(score)
                                    return acc
                                  }, {})
                                ).map(([week, scores]: [string, any]) => (
                                  <div key={week} className="bg-white rounded p-2">
                                    <div className="font-medium text-amber-800 mb-1">Week {week}</div>
                                    <div className="space-y-1">
                                      {scores.map((score: any, idx: number) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                          <span className="text-amber-700">
                                            {score.contestantName} - {formatCategoryName(score.category)}
                                          </span>
                                          <span className="font-medium text-amber-800">
                                            {score.points} pts
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-amber-600">Loading details...</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weekly Scoreboard */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col h-full">
            <h2 className="text-2xl font-semibold text-amber-900 mb-4 flex-shrink-0">📊 Weekly Scoreboard</h2>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {getAllWeeks().map(week => {
                const isExpanded = expandedWeeks.has(week)
                const hasScores = hasScoresForWeek(week)
                const isCurrentWeek = week === currentWeek
                
                return (
                  <div key={week} className="border border-amber-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleWeekExpansion(week)}
                      className="w-full p-4 bg-amber-50 hover:bg-amber-100 transition-colors text-left"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                            isCurrentWeek ? 'bg-green-500' : 'bg-amber-500'
                          }`}>
                            {week}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-amber-900">
                              Week {week}
                              {isCurrentWeek && <span className="text-sm text-green-600 ml-2">(Current)</span>}
                            </h3>
                            <p className="text-sm text-amber-600">
                              {hasScores ? 'Click to view results' : 'Coming soon'}
                            </p>
                          </div>
                        </div>
                        <div className="text-amber-600">
                          {isExpanded ? '▼' : '▶'}
                        </div>
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="p-4 bg-white border-t border-amber-200">
                        {hasScores ? (
                          <div className="space-y-2">
                            {leaderboard
                              .map(player => ({
                                playerId: player.playerId,
                                playerName: player.playerName,
                                teamName: player.teamName,
                                points: getPlayerWeeklyPoints(player.playerId, week)
                              }))
                              .sort((a, b) => b.points - a.points)
                              .map((player, index) => (
                                <div key={player.playerId} className="flex justify-between items-center bg-amber-50 rounded p-3">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                                      index === 0 ? 'bg-yellow-500' : 
                                      index === 1 ? 'bg-gray-400' : 
                                      index === 2 ? 'bg-amber-600' : 'bg-amber-500'
                                    }`}>
                                      {index + 1}
                                    </div>
                                    <div>
                                      <div className="font-medium text-amber-900 text-sm">{player.playerName}</div>
                                      <div className="text-xs text-amber-600">{player.teamName}</div>
                                    </div>
                                  </div>
                                  <div className="text-lg font-bold text-amber-800">
                                    {player.points} pts
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-amber-600">
                            <div className="text-4xl mb-2">⏳</div>
                            <p className="text-lg font-medium">Scores coming soon</p>
                            <p className="text-sm">Check back after the episode airs!</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>


        {/* Logout */}
        <div className="mt-8 text-center">
          <form action="/api/auth/logout" method="post">
            <button 
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              Leave the Tent
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
