'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { authGuard } from '@/lib/auth'
import { redirect } from 'next/navigation'

interface LeaderboardEntry {
  playerId: number
  playerName: string
  teamName: string
  totalPoints: number
}

interface WeeklyBreakdown {
  week: number
  contestantName: string
  category: string
  points: number
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null)
  const [weeklyBreakdown, setWeeklyBreakdown] = useState<WeeklyBreakdown[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load data
  useEffect(() => {
    loadLeaderboard()
  }, [])

  useEffect(() => {
    if (selectedPlayer) {
      loadWeeklyBreakdown(selectedPlayer)
    }
  }, [selectedPlayer])

  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/leaderboard')
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data.leaderboard || [])
      } else {
        setError('Failed to load leaderboard')
      }
    } catch (err) {
      setError('Failed to load leaderboard')
      console.error('loadLeaderboard error', err)
    } finally {
      setLoading(false)
    }
  }

  const loadWeeklyBreakdown = async (playerId: number) => {
    try {
      const response = await fetch(`/api/leaderboard/${playerId}`)
      if (response.ok) {
        const data = await response.json()
        setWeeklyBreakdown(data.breakdown || [])
      }
    } catch (err) {
      console.error('loadWeeklyBreakdown error', err)
    }
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-amber-900 mb-2">🏆 Leaderboard</h1>
              <p className="text-amber-700">Current standings and weekly breakdowns</p>
            </div>
            <Link
              href="/dashboard"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              🏠 Home
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Leaderboard */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-amber-900 mb-4">Current Standings</h2>
            
            {leaderboard.length === 0 ? (
              <p className="text-amber-600">No scores recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div 
                    key={entry.playerId} 
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedPlayer === entry.playerId
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-amber-200 hover:border-amber-300'
                    }`}
                    onClick={() => setSelectedPlayer(entry.playerId)}
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
                      <div className="text-2xl font-bold text-amber-800">
                        {entry.totalPoints}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weekly Breakdown */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-amber-900 mb-4">
              {selectedPlayer ? 'Weekly Breakdown' : 'Select a Player'}
            </h2>
            
            {!selectedPlayer ? (
              <p className="text-amber-600">Click on a player to see their weekly breakdown.</p>
            ) : weeklyBreakdown.length === 0 ? (
              <p className="text-amber-600">No scores recorded for this player yet.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(
                  weeklyBreakdown.reduce((acc, score) => {
                    if (!acc[score.week]) acc[score.week] = []
                    acc[score.week].push(score)
                    return acc
                  }, {} as Record<number, WeeklyBreakdown[]>)
                ).map(([week, scores]) => (
                  <div key={week} className="border border-amber-200 rounded-lg p-3">
                    <h3 className="font-semibold text-amber-900 mb-2">Week {week}</h3>
                    <div className="space-y-1">
                      {scores.map((score, index) => (
                        <div key={index} className="flex justify-between text-sm">
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
    </div>
  )
}
