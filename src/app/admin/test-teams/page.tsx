'use client'

import { useState, useEffect } from 'react'
import { getAllPlayersAction, getAllContestantsAction } from '../teams/actions'

export default function TestTeamsPage() {
  const [players, setPlayers] = useState<any[]>([])
  const [contestants, setContestants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('=== TEST PAGE LOAD DATA START ===')
        setLoading(true)
        
        const [playersRes, contestantsRes] = await Promise.all([
          getAllPlayersAction(),
          getAllContestantsAction()
        ])
        
        console.log('Players response:', playersRes)
        console.log('Contestants response:', contestantsRes)
        
        if (playersRes.ok && playersRes.players) {
          setPlayers(playersRes.players)
        } else {
          setError('Players failed: ' + (playersRes.error || 'Unknown error'))
        }
        
        if (contestantsRes.ok && contestantsRes.contestants) {
          setContestants(contestantsRes.contestants)
        } else {
          setError('Contestants failed: ' + (contestantsRes.error || 'Unknown error'))
        }
        
      } catch (err) {
        console.error('Test page error:', err)
        setError('Failed to load data: ' + (err instanceof Error ? err.message : 'Unknown error'))
      } finally {
        setLoading(false)
        console.log('=== TEST PAGE LOAD DATA END ===')
      }
    }
    
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">Loading test data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-amber-900 mb-8">Test Teams Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-amber-800 mb-4">
              Players ({players.length})
            </h2>
            <div className="space-y-2">
              {players.map(player => (
                <div key={player.id} className="bg-amber-50 border border-amber-200 rounded p-3">
                  <div className="font-medium text-amber-800">{player.name}</div>
                  <div className="text-sm text-amber-600">{player.teamName}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-amber-800 mb-4">
              Contestants ({contestants.length})
            </h2>
            <div className="space-y-2">
              {contestants.map(contestant => (
                <div key={contestant.id} className="bg-amber-50 border border-amber-200 rounded p-3">
                  <div className="font-medium text-amber-800">{contestant.name}</div>
                  {contestant.eliminatedWeek && (
                    <div className="text-sm text-red-600">
                      Eliminated Week {contestant.eliminatedWeek}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
