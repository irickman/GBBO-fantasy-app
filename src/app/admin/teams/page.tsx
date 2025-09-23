'use client'

import { useState, useEffect } from 'react'
import { createPlayerAction, assignContestantsAction } from './actions'

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

export default function AdminTeamsPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [contestants, setContestants] = useState<Contestant[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedContestants, setSelectedContestants] = useState<number[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null)

  // Load data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [playersRes, contestantsRes, teamsRes] = await Promise.all([
        fetch('/api/db/test').then(r => r.json()).then(d => d.players || []),
        fetch('/api/db/test').then(r => r.json()).then(d => d.contestants || []),
        fetch('/api/db/test').then(r => r.json()).then(d => d.teams || [])
      ])
      setPlayers(playersRes)
      setContestants(contestantsRes)
      setTeams(teamsRes)
    } catch (err) {
      setError('Failed to load data')
      console.error('loadData error', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlayer = async (formData: FormData) => {
    const result = await createPlayerAction(formData)
    if (result.ok) {
      await loadData()
      setError('')
    } else {
      setError(result.error || 'Failed to create player')
    }
  }

  const handleAssignContestants = async () => {
    if (selectedPlayer && selectedContestants.length === 3) {
      const formData = new FormData()
      formData.append('playerId', selectedPlayer.toString())
      formData.append('contestantIds', selectedContestants.join(','))
      
      const result = await assignContestantsAction(formData)
      if (result.ok) {
        await loadData()
        setSelectedContestants([])
        setSelectedPlayer(null)
        setError('')
      } else {
        setError(result.error || 'Failed to assign contestants')
      }
    }
  }

  const toggleContestant = (contestantId: number) => {
    setSelectedContestants(prev => {
      if (prev.includes(contestantId)) {
        return prev.filter(id => id !== contestantId)
      } else if (prev.length < 3) {
        return [...prev, contestantId]
      }
      return prev
    })
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
          <p className="text-amber-700">Create players and assign exactly 3 contestants to each</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Player Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-amber-900 mb-4">Create Player</h2>
            <form action={handleCreatePlayer} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-amber-700 mb-1">
                  Player Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter player name"
                />
              </div>
              <div>
                <label htmlFor="teamName" className="block text-sm font-medium text-amber-700 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  id="teamName"
                  name="teamName"
                  required
                  className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter team name"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                Create Player
              </button>
            </form>
          </div>

          {/* Assign Contestants */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-amber-900 mb-4">Assign Contestants</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-amber-700 mb-2">
                  Select Player
                </label>
                <select
                  value={selectedPlayer || ''}
                  onChange={(e) => setSelectedPlayer(parseInt(e.target.value) || null)}
                  className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Choose a player...</option>
                  {players.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name} ({player.teamName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-700 mb-2">
                  Select 3 Contestants ({selectedContestants.length}/3)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-amber-300 rounded-md p-2">
                  {contestants.map(contestant => (
                    <label key={contestant.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedContestants.includes(contestant.id)}
                        onChange={() => toggleContestant(contestant.id)}
                        disabled={!selectedContestants.includes(contestant.id) && selectedContestants.length >= 3}
                        className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-sm text-amber-700">{contestant.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAssignContestants}
                disabled={!selectedPlayer || selectedContestants.length !== 3}
                className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Assign Contestants
              </button>
            </div>
          </div>
        </div>

        {/* Players and Their Teams */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-amber-900 mb-4">Players & Teams</h2>
          <div className="space-y-6">
            {players.map(player => {
              const playerTeams = getPlayerTeams(player.id)
              return (
                <div key={player.id} className="border border-amber-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-amber-900">
                      {player.name} - {player.teamName}
                    </h3>
                    <span className="text-sm text-amber-600">
                      {playerTeams.length}/3 contestants
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {playerTeams.map(team => (
                      <div key={team.teamId} className="bg-amber-50 border border-amber-200 rounded p-2">
                        <div className="text-sm font-medium text-amber-800">{team.contestantName}</div>
                        {team.eliminatedWeek && (
                          <div className="text-xs text-red-600">
                            Eliminated Week {team.eliminatedWeek}
                          </div>
                        )}
                      </div>
                    ))}
                    {playerTeams.length < 3 && (
                      <div className="bg-gray-50 border border-gray-200 rounded p-2 flex items-center justify-center">
                        <span className="text-sm text-gray-500">Empty slot</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
