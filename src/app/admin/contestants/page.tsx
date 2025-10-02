'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  getAllContestantsAction, 
  createContestantAction, 
  updateContestantAction, 
  deleteContestantAction 
} from './actions'

interface Contestant {
  id: number
  name: string
  eliminatedWeek?: number | null
}

export default function AdminContestantsPage() {
  const searchParams = useSearchParams()
  const weekParam = searchParams.get('week')
  const selectedWeek = weekParam ? parseInt(weekParam, 10) : null
  
  const [contestants, setContestants] = useState<Contestant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingContestant, setEditingContestant] = useState<Contestant | null>(null)
  const [newContestantName, setNewContestantName] = useState('')
  const [eliminatedWeek, setEliminatedWeek] = useState<number | ''>('')

  // Load data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const result = await getAllContestantsAction()
      
      if (result.ok && result.contestants) {
        let contestantsList = result.contestants
        
        // Adjust elimination status if viewing historical week
        if (selectedWeek !== null) {
          contestantsList = contestantsList.map(contestant => ({
            ...contestant,
            eliminatedWeek: 
              contestant.eliminatedWeek && contestant.eliminatedWeek > selectedWeek
                ? null
                : contestant.eliminatedWeek
          }))
        }
        
        setContestants(contestantsList)
      } else {
        setError(result.error || 'Failed to load contestants')
      }
    } catch (err) {
      setError('Failed to load contestants')
      console.error('loadData error', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddContestant = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContestantName.trim()) {
      setError('Contestant name is required')
      return
    }

    const formData = new FormData()
    formData.append('name', newContestantName)
    if (eliminatedWeek !== '') {
      formData.append('eliminatedWeek', eliminatedWeek.toString())
    }

    const result = await createContestantAction(formData)
    if (result.ok) {
      setSuccess('Contestant added successfully!')
      setNewContestantName('')
      setEliminatedWeek('')
      setShowAddForm(false)
      await loadData()
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.error || 'Failed to add contestant')
    }
  }

  const handleEditContestant = (contestant: Contestant) => {
    setEditingContestant(contestant)
    setNewContestantName(contestant.name)
    setEliminatedWeek(contestant.eliminatedWeek || '')
  }

  const handleUpdateContestant = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingContestant || !newContestantName.trim()) {
      setError('Contestant name is required')
      return
    }

    const formData = new FormData()
    formData.append('id', editingContestant.id.toString())
    formData.append('name', newContestantName)
    if (eliminatedWeek !== '') {
      formData.append('eliminatedWeek', eliminatedWeek.toString())
    }

    const result = await updateContestantAction(formData)
    if (result.ok) {
      setSuccess('Contestant updated successfully!')
      setEditingContestant(null)
      setNewContestantName('')
      setEliminatedWeek('')
      await loadData()
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.error || 'Failed to update contestant')
    }
  }

  const handleDeleteContestant = async (contestantId: number) => {
    if (!confirm('Are you sure you want to delete this contestant? This will also remove them from all teams.')) {
      return
    }

    const formData = new FormData()
    formData.append('id', contestantId.toString())

    const result = await deleteContestantAction(formData)
    if (result.ok) {
      setSuccess('Contestant deleted successfully!')
      await loadData()
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.error || 'Failed to delete contestant')
    }
  }

  const handleCancel = () => {
    setEditingContestant(null)
    setShowAddForm(false)
    setNewContestantName('')
    setEliminatedWeek('')
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
              <h1 className="text-4xl font-bold text-amber-900 mb-2">Contestant Management</h1>
              <p className="text-amber-700">Manage GBBO contestants and their elimination status</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
              >
                ➕ Add Contestant
              </button>
              <Link
                href="/admin/teams"
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
              >
                👥 Teams
              </Link>
              <Link
                href="/dashboard"
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
              >
                🏠 Home
              </Link>
            </div>
          </div>
        </div>

        {selectedWeek !== null && (
          <div className="bg-blue-100 border border-blue-400 text-blue-800 px-4 py-3 rounded mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📅</span>
              <span className="font-semibold">Historical View: Week {selectedWeek}</span>
              <span className="text-sm">— Elimination status shown as of this week</span>
            </div>
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1 rounded-md transition-colors text-sm"
            >
              View Current
            </Link>
          </div>
        )}

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

        {/* Add/Edit Form */}
        {(showAddForm || editingContestant) && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-amber-900 mb-4">
              {editingContestant ? 'Edit Contestant' : 'Add New Contestant'}
            </h2>
            <form onSubmit={editingContestant ? handleUpdateContestant : handleAddContestant} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-2">
                    Contestant Name
                  </label>
                  <input
                    type="text"
                    value={newContestantName}
                    onChange={(e) => setNewContestantName(e.target.value)}
                    className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter contestant name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-2">
                    Eliminated Week (optional)
                  </label>
                  <select
                    value={eliminatedWeek}
                    onChange={(e) => setEliminatedWeek(e.target.value === '' ? '' : parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Still in competition</option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Week {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                >
                  {editingContestant ? 'Update Contestant' : 'Add Contestant'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Contestants List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-amber-900 mb-4">Contestants ({contestants.length})</h2>
          {contestants.length === 0 ? (
            <div className="text-center py-8 text-amber-600">
              No contestants found. Add some contestants to get started.
              <div className="mt-2 text-sm text-gray-500">
                Debug: contestants.length = {contestants.length}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contestants.map(contestant => (
                <div key={contestant.id} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-amber-900 text-lg">{contestant.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditContestant(contestant)}
                        className="text-amber-600 hover:text-amber-800 text-sm"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteContestant(contestant.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-amber-700">
                    {contestant.eliminatedWeek ? (
                      <span className="text-red-600 font-medium">
                        Eliminated Week {contestant.eliminatedWeek}
                      </span>
                    ) : (
                      <span className="text-green-600 font-medium">Still in competition</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
