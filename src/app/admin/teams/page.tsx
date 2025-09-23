'use client'

import { useState, useEffect } from 'react'

interface Player {
  id: number
  name: string
  teamName: string
}

interface Contestant {
  id: number
  name: string
  eliminatedWeek?: number
}

interface Team {
  teamId: number
  playerId: number
  playerName: string
  teamName: string
  contestantId: number
  contestantName: string
  eliminatedWeek?: number
}

interface WeeklyScore {
  week: number
  contestantName: string
  category: string
  points: number
}

export default function AdminTeamsPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [weeklyScores, setWeeklyScores] = useState<Record<number, WeeklyScore[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [playersRes, teamsRes] = await Promise.all([
        fetch('/api/db/test').then(r => r.json()).then(d => d.players || []),
        fetch('/api/db/test').then(r => r.json()).then(d => d.teams || [])
      ])
      setPlayers(playersRes)
      setTeams(teamsRes)
      
      // Load weekly scores for each player
      const scoresData: Record<number, WeeklyScore[]> = {}
      for (const player of playersRes) {
        try {
          const response = await fetch(`/api/leaderboard/${player.id}`)
          if (response.ok) {
            const data = await response.json()
            scoresData[player.id] = data.breakdown || []
          }
        } catch (err) {
          console.error(`Failed to load scores for player ${player.id}`, err)
        }
      }
      setWeeklyScores(scoresData)
    } catch (err) {
      setError('Failed to load data')
      console.error('loadData error', err)
    } finally {
      setLoading(false)
    }
  }

  const getPlayerTeams = (playerId: number) => {
    return teams.filter(t => t.playerId === playerId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">Team Management</h1>
          <p className="text-amber-700">View player teams and detailed scoring information</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Players and Their Teams with Detailed Scoring */}
        <div className="space-y-6">
          {players.map(player => {
            const playerTeams = getPlayerTeams(player.id)
            const playerScores = weeklyScores[player.id] || []
            const totalPoints = playerScores.reduce((sum, score) => sum + score.points, 0)
            
            return (
              <div key={player.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-amber-900">
                    {player.name} - {player.teamName}
                  </h3>
                  <div className="text-2xl font-bold text-amber-800">
                    {totalPoints} points
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Contestants */}
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-3">Contestants</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {playerTeams.map(team => (
                        <div key={team.teamId} className="bg-amber-50 border border-amber-200 rounded p-3">
                          <div className="font-medium text-amber-800">{team.contestantName}</div>
                          {team.eliminatedWeek && (
                            <div className="text-sm text-red-600">
                              Eliminated Week {team.eliminatedWeek}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Weekly Scoring Breakdown */}
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-3">Weekly Scoring</h4>
                    {playerScores.length === 0 ? (
                      <p className="text-amber-600">No scores recorded yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {Object.entries(
                          playerScores.reduce((acc: any, score: any) => {
                            if (!acc[score.week]) acc[score.week] = []
                            acc[score.week].push(score)
                            return acc
                          }, {})
                        ).map(([week, scores]: [string, any]) => (
                          <div key={week} className="bg-amber-50 border border-amber-200 rounded p-3">
                            <div className="font-medium text-amber-800 mb-2">Week {week}</div>
                            <div className="space-y-1">
                              {scores.map((score: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <span className="text-amber-700">
                                    {score.contestantName} - {score.category}
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
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
