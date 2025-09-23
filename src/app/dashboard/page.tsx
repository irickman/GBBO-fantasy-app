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

export default function DashboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [week3Scores, setWeek3Scores] = useState<WeeklyScore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedPlayer, setExpandedPlayer] = useState<number | null>(null)
  const [playerDetails, setPlayerDetails] = useState<Record<number, any>>({})

  // Load data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [leaderboardRes, week3Res] = await Promise.all([
        fetch('/api/leaderboard').then(r => r.json()),
        fetch('/api/weekly-scores/3').then(r => r.json())
      ])
      
      if (leaderboardRes.leaderboard) {
        setLeaderboard(leaderboardRes.leaderboard)
      }
      
      if (week3Res.scores) {
        setWeek3Scores(week3Res.scores)
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
          <h1 className="text-4xl font-bold text-amber-800 mb-2">
            🧁 GBBO Fantasy League
          </h1>
          <p className="text-amber-600">Week 3 Complete • Week 4 Next (September 26th)</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                            index === 0 ? 'bg-yellow-500' : 
                            index === 1 ? 'bg-gray-400' : 
                            index === 2 ? 'bg-amber-600' : 'bg-amber-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-amber-900">{entry.playerName}</div>
                            <div className="text-sm text-amber-600">{entry.teamName}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-2xl font-bold text-amber-800">
                            {entry.totalPoints}
                          </div>
                          <div className="text-amber-600">
                            {expandedPlayer === entry.playerId ? '▼' : '▶'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {expandedPlayer === entry.playerId && (
                      <div className="border-t border-amber-200 bg-amber-50 p-4">
                        <h4 className="font-semibold text-amber-900 mb-3">Contestants & Weekly Breakdown</h4>
                        {playerDetails[entry.playerId] ? (
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

          {/* Week 3 Scores */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-amber-900 mb-4">📊 Week 3 Results</h2>
            
            {week3Scores.length === 0 ? (
              <p className="text-amber-600">No scores recorded for Week 3 yet.</p>
            ) : (
              <div className="space-y-3">
                {week3Scores.map(score => (
                  <div key={score.id} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-amber-900">{score.contestantName}</div>
                        <div className="text-sm text-amber-600">{formatCategoryName(score.category)}</div>
                      </div>
                      <div className="text-lg font-bold text-amber-800">
                        {score.points} pts
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-amber-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/scoring"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-md transition-colors text-center"
            >
              Enter Week 4 Scores
            </Link>
            <Link
              href="/admin/teams"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-md transition-colors text-center"
            >
              Manage Teams
            </Link>
            <Link
              href="/leaderboard"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-md transition-colors text-center"
            >
              History Leaderboard
            </Link>
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
