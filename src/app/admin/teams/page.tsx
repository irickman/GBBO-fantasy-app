'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createPlayerAction, updatePlayerTeamAction, getAllPlayersAction, getAllContestantsAction, getPlayerTeamsAction, deletePlayerAction } from './actions'

interface Player {
  id: number
  name: string
  teamName: string
}

interface Contestant {
  id: number
  name: string
  eliminatedWeek?: number | null
}

interface Team {
  teamId: number
  contestantId: number
  contestantName: string
  eliminatedWeek?: number | null
}

export default function AdminTeamsPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [contestants, setContestants] = useState<Contestant[]>([])
  const [playerTeams, setPlayerTeams] = useState<Record<number, Team[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form states
  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<number | null>(null)
  const [newPlayerName, setNewPlayerName] = useState('')
  const [newPlayerTeamName, setNewPlayerTeamName] = useState('')
  const [selectedContestants, setSelectedContestants] = useState<Record<number, number[]>>({})

  // Load data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      console.log('=== UI LOAD DATA START ===')
      
      const [playersRes, contestantsRes] = await Promise.all([
        getAllPlayersAction(),
        getAllContestantsAction()
      ])
      
      console.log('Players response:', playersRes)
      console.log('Contestants response:', contestantsRes)
      
      if (playersRes.ok && playersRes.players) {
        console.log('Setting players:', playersRes.players.length)
        setPlayers(playersRes.players)
        
        // Load teams for each player
        const teamsData: Record<number, Team[]> = {}
        for (const player of playersRes.players) {
          console.log('Loading teams for player:', player.name, player.id)
          const teamsRes = await getPlayerTeamsAction(player.id)
          console.log('Teams response for', player.name, ':', teamsRes)
          if (teamsRes.ok && teamsRes.teams) {
            teamsData[player.id] = teamsRes.teams
          }
        }
        console.log('Setting player teams:', teamsData)
        setPlayerTeams(teamsData)
      } else {
        console.error('Players response not ok:', playersRes)
      }
      
      if (contestantsRes.ok && contestantsRes.contestants) {
        console.log('Setting contestants:', contestantsRes.contestants.length)
        setContestants(contestantsRes.contestants)
      } else {
        console.error('Contestants response not ok:', contestantsRes)
      }
    } catch (err) {
      console.error('loadData error', err)
      setError('Failed to load data: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      console.log('=== UI LOAD DATA END ===')
      setLoading(false)
    }
  }

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPlayerName.trim() || !newPlayerTeamName.trim()) {
      setError('Name and team name are required')
      return
    }

    const formData = new FormData()
    formData.append('name', newPlayerName)
    formData.append('teamName', newPlayerTeamName)

    const result = await createPlayerAction(formData)
    if (result.ok) {
      setSuccess('Player added successfully!')
      setNewPlayerName('')
      setNewPlayerTeamName('')
      setShowAddPlayer(false)
      await loadData()
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.error || 'Failed to add player')
    }
  }

  const handleEditTeam = (playerId: number) => {
    setEditingPlayer(playerId)
    // Pre-populate with current contestants
    const currentTeams = playerTeams[playerId] || []
    setSelectedContestants(prev => ({
      ...prev,
      [playerId]: currentTeams.map(team => team.contestantId)
    }))
  }

  const handleSaveTeam = async (playerId: number) => {
    console.log('=== UI HANDLE SAVE TEAM ===')
    console.log('Player ID:', playerId)
    
    const contestantIds = selectedContestants[playerId] || []
    console.log('Selected contestant IDs:', contestantIds)
    console.log('Contestant IDs length:', contestantIds.length)
    
    if (contestantIds.length !== 3) {
      console.log('Error: Must select exactly 3 contestants')
      setError('Must select exactly 3 contestants')
      return
    }

    const formData = new FormData()
    formData.append('playerId', playerId.toString())
    formData.append('contestantIds', JSON.stringify(contestantIds))
    
    console.log('FormData entries:', Object.fromEntries(formData.entries()))

    console.log('Calling updatePlayerTeamAction...')
    const result = await updatePlayerTeamAction(formData)
    console.log('Server action result:', result)
    
    if (result.ok) {
      console.log('Team updated successfully, reloading data...')
      setSuccess('Team updated successfully!')
      setEditingPlayer(null)
      await loadData()
      setTimeout(() => setSuccess(''), 3000)
    } else {
      console.log('Team update failed:', result.error)
      setError(result.error || 'Failed to update team')
    }
  }

  const handleCancelEdit = () => {
    setEditingPlayer(null)
    setSelectedContestants({})
  }

  const handleDeletePlayer = async (playerId: number) => {
    if (!confirm('Are you sure you want to delete this player? This will also remove all their team assignments and scores.')) {
      return
    }

    const formData = new FormData()
    formData.append('playerId', playerId.toString())

    const result = await deletePlayerAction(formData)
    if (result.ok) {
      setSuccess('Player deleted successfully!')
      await loadData()
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.error || 'Failed to delete player')
    }
  }

  const handleContestantToggle = (playerId: number, contestantId: number) => {
    setSelectedContestants(prev => {
      const current = prev[playerId] || []
      if (current.includes(contestantId)) {
        return {
          ...prev,
          [playerId]: current.filter(id => id !== contestantId)
        }
      } else if (current.length < 3) {
        return {
          ...prev,
          [playerId]: [...current, contestantId]
        }
      }
      return prev
    })
  }

  const getAvailableContestants = (playerId: number) => {
    // Return all contestants - no filtering needed
    return contestants
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
              <h1 className="text-4xl font-bold text-amber-900 mb-2">Team Management</h1>
              <p className="text-amber-700">Manage players and their team assignments</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <button
                onClick={() => setShowAddPlayer(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 sm:px-4 rounded-md transition-colors text-sm sm:text-base"
              >
                ➕ Add Player
              </button>
              <Link
                href="/admin/contestants"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 sm:px-4 rounded-md transition-colors text-sm sm:text-base"
              >
                👥 Contestants
              </Link>
              <Link
                href="/dashboard"
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-3 sm:px-4 rounded-md transition-colors text-sm sm:text-base"
              >
                🏠 Home
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
            <button onClick={() => setError('')} className="ml-2 text-red-800">×</button>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
            <button onClick={() => setSuccess('')} className="ml-2 text-green-800">×</button>
          </div>
        )}

        {/* Add Player Form */}
        {showAddPlayer && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-amber-900 mb-4">Add New Player</h2>
            <form onSubmit={handleAddPlayer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-2">
                    Player Name
                  </label>
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter player name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-2">
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={newPlayerTeamName}
                    onChange={(e) => setNewPlayerTeamName(e.target.value)}
                    className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter team name"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                >
                  Add Player
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPlayer(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Players and Their Teams */}
        <div className="space-y-6">
          {players.map(player => {
            const teams = playerTeams[player.id] || []
            const isEditing = editingPlayer === player.id
            const selected = selectedContestants[player.id] || []
            const availableContestants = getAvailableContestants(player.id)

            return (
              <div key={player.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                  <h3 className="text-lg sm:text-xl font-semibold text-amber-900">
                    {player.name} - {player.teamName}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSaveTeam(player.id)}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 sm:px-4 rounded-md transition-colors text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-3 sm:px-4 rounded-md transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditTeam(player.id)}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-3 sm:px-4 rounded-md transition-colors text-sm"
                        >
                          Edit Team
                        </button>
                        <button
                          onClick={() => handleDeletePlayer(player.id)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 sm:px-4 rounded-md transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-3">
                      Select 3 Contestants ({selected.length}/3)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[1, 2, 3].map(slot => (
                        <div key={slot} className="space-y-2">
                          <label className="block text-sm font-medium text-amber-700">
                            Contestant {slot}
                          </label>
                          <select
                            value={selected[slot - 1] || ''}
                            onChange={(e) => {
                              const contestantId = parseInt(e.target.value)
                              if (contestantId) {
                                const newSelected = [...selected]
                                newSelected[slot - 1] = contestantId
                                setSelectedContestants(prev => ({
                                  ...prev,
                                  [player.id]: newSelected
                                }))
                              }
                            }}
                            className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          >
                            <option value="">Select contestant...</option>
                            {availableContestants.map(contestant => {
                              const isAlreadySelected = selected.includes(contestant.id) && selected.indexOf(contestant.id) !== slot - 1
                              return (
                                <option 
                                  key={contestant.id} 
                                  value={contestant.id}
                                  disabled={isAlreadySelected}
                                >
                                  {contestant.name} {contestant.eliminatedWeek ? `(Eliminated W${contestant.eliminatedWeek})` : ''}
                                </option>
                              )
                            })}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-3">Contestants</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {teams.length > 0 ? (
                        teams.map(team => (
                          <div key={team.teamId} className="bg-amber-50 border border-amber-200 rounded p-3">
                            <div className="font-medium text-amber-800">{team.contestantName}</div>
                            {team.eliminatedWeek && (
                              <div className="text-sm text-red-600">
                                Eliminated Week {team.eliminatedWeek}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-amber-600">No contestants assigned</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}