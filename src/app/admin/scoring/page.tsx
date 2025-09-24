'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { addScoreAction, getWeeklyScoresAction, getContestantsAction, updateScoreAction, deleteScoreAction } from './actions'
import { SCORING_CATEGORIES } from '@/lib/db/schema'

// Separate categories into Every Week and Optional
const EVERY_WEEK_CATEGORIES = ['star_baker', 'technical_win', 'last_technical']
const OPTIONAL_CATEGORIES = Object.keys(SCORING_CATEGORIES).filter(
  cat => !EVERY_WEEK_CATEGORIES.includes(cat)
)

// Format category names for display
const formatCategoryName = (category: string) => {
  return category
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

interface Contestant {
  id: number
  name: string
  eliminatedWeek?: number
}

interface WeeklyScore {
  id: number
  week: number
  contestantId: number
  contestantName: string
  category: string
  points: number
}

export default function AdminScoringPage() {
  const [contestants, setContestants] = useState<Contestant[]>([])
  const [weeklyScores, setWeeklyScores] = useState<WeeklyScore[]>([])
  const [currentWeek, setCurrentWeek] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form state for Every Week categories
  const [everyWeekScores, setEveryWeekScores] = useState<Record<string, number>>({})
  
  // Form state for Optional categories
  const [optionalScores, setOptionalScores] = useState<Record<string, number[]>>({})
  
  // Editing state
  const [editingScore, setEditingScore] = useState<WeeklyScore | null>(null)
  const [editContestantId, setEditContestantId] = useState<number | ''>('')
  const [editCategory, setEditCategory] = useState<string>('')

  // Load data
  useEffect(() => {
    loadData()
  }, [currentWeek])

  const loadData = async () => {
    try {
      setLoading(true)
      const [contestantsRes, scoresRes] = await Promise.all([
        getContestantsAction(),
        getWeeklyScoresAction(currentWeek)
      ])
      
      if (contestantsRes.ok) {
        setContestants(contestantsRes.contestants || [])
      }
      
      if (scoresRes.ok) {
        setWeeklyScores(scoresRes.scores || [])
      }
    } catch (err) {
      setError('Failed to load data')
      console.error('loadData error', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveScores = async () => {
    try {
      setError('')
      setSuccess('')
      
      // Save Every Week categories
      for (const [category, contestantId] of Object.entries(everyWeekScores)) {
        if (contestantId) {
          const formData = new FormData()
          formData.append('week', currentWeek.toString())
          formData.append('category', category)
          formData.append('contestantId', contestantId.toString())
          
          const result = await addScoreAction(formData)
          if (!result.ok) {
            setError(result.error || 'Failed to save scores')
            return
          }
        }
      }
      
      // Save Optional categories
      for (const [category, contestantIds] of Object.entries(optionalScores)) {
        for (const contestantId of contestantIds) {
          const formData = new FormData()
          formData.append('week', currentWeek.toString())
          formData.append('category', category)
          formData.append('contestantId', contestantId.toString())
          
          const result = await addScoreAction(formData)
          if (!result.ok) {
            setError(result.error || 'Failed to save scores')
            return
          }
        }
      }
      
      setSuccess('Scores saved successfully!')
      await loadData()
      // Clear form
      setEveryWeekScores({})
      setOptionalScores({})
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to save scores')
      console.error('handleSaveScores error', err)
    }
  }

  const getScoredCategories = () => {
    return weeklyScores.map(score => score.category)
  }

  const getContestantName = (contestantId: number) => {
    const contestant = contestants.find(c => c.id === contestantId)
    return contestant?.name || 'Unknown'
  }

  const getCategoryPoints = (category: string) => {
    return SCORING_CATEGORIES[category as keyof typeof SCORING_CATEGORIES] || 0
  }

  const handleEditScore = (score: WeeklyScore) => {
    setEditingScore(score)
    setEditContestantId(score.contestantId)
    setEditCategory(score.category)
  }

  const handleUpdateScore = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingScore || !editContestantId || !editCategory) {
      setError('Please fill in all fields')
      return
    }

    const formData = new FormData()
    formData.append('scoreId', editingScore.id.toString())
    formData.append('contestantId', editContestantId.toString())
    formData.append('category', editCategory)

    const result = await updateScoreAction(formData)
    if (result.ok) {
      setSuccess('Score updated successfully!')
      setEditingScore(null)
      setEditContestantId('')
      setEditCategory('')
      await loadData()
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.error || 'Failed to update score')
    }
  }

  const handleDeleteScore = async (scoreId: number) => {
    if (!confirm('Are you sure you want to delete this score?')) {
      return
    }

    const formData = new FormData()
    formData.append('scoreId', scoreId.toString())

    const result = await deleteScoreAction(formData)
    if (result.ok) {
      setSuccess('Score deleted successfully!')
      await loadData()
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.error || 'Failed to delete score')
    }
  }

  const handleCancelEdit = () => {
    setEditingScore(null)
    setEditContestantId('')
    setEditCategory('')
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
              <h1 className="text-4xl font-bold text-amber-900 mb-2">Weekly Scoring</h1>
              <p className="text-amber-700">Enter scores for each category and week</p>
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

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {/* Week Selector */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-amber-900 mb-4">Select Week</h2>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(week => (
              <button
                key={week}
                onClick={() => setCurrentWeek(week)}
                className={`px-2 sm:px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                  currentWeek === week
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                }`}
              >
                W{week}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {/* Every Week Categories */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-amber-900 mb-4">Every Week Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {EVERY_WEEK_CATEGORIES.map(category => (
                <div key={category} className="border border-amber-200 rounded-lg p-4">
                  <h3 className="font-semibold text-amber-800 mb-2">
                    {formatCategoryName(category)} ({SCORING_CATEGORIES[category as keyof typeof SCORING_CATEGORIES]} points)
                  </h3>
                  <select
                    value={everyWeekScores[category] || ''}
                    onChange={(e) => setEveryWeekScores(prev => ({
                      ...prev,
                      [category]: parseInt(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select contestant...</option>
                    {contestants.map(contestant => (
                      <option key={contestant.id} value={contestant.id}>
                        {contestant.name} {contestant.eliminatedWeek ? `(Eliminated Week ${contestant.eliminatedWeek})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Categories */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-amber-900 mb-4">Optional Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {OPTIONAL_CATEGORIES.map(category => (
                <div key={category} className="border border-amber-200 rounded-lg p-4">
                  <h3 className="font-semibold text-amber-800 mb-2">
                    {formatCategoryName(category)} ({SCORING_CATEGORIES[category as keyof typeof SCORING_CATEGORIES]} points each)
                  </h3>
                  <div className="space-y-2">
                    <select
                      multiple
                      value={optionalScores[category] || []}
                      onChange={(e) => {
                        const selectedIds = Array.from(e.target.selectedOptions, option => parseInt(option.value))
                        setOptionalScores(prev => ({
                          ...prev,
                          [category]: selectedIds
                        }))
                      }}
                      className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      size={4}
                    >
                      {contestants.map(contestant => (
                        <option key={contestant.id} value={contestant.id}>
                          {contestant.name} {contestant.eliminatedWeek ? `(Eliminated Week ${contestant.eliminatedWeek})` : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-amber-600">Hold Ctrl/Cmd to select multiple contestants</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <button
              onClick={handleSaveScores}
              className="w-full bg-amber-600 text-white py-3 px-6 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-lg font-semibold"
            >
              Save Week {currentWeek} Scores
            </button>
          </div>
        </div>

          {/* Current Week Scores */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-amber-900 mb-4">
              Week {currentWeek} Scores
            </h2>
            
            {weeklyScores.length === 0 ? (
              <p className="text-amber-600">No scores entered for this week yet.</p>
            ) : (
              <div className="space-y-3">
                {weeklyScores.map(score => (
                  <div key={score.id} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-amber-900">{score.contestantName}</div>
                        <div className="text-sm text-amber-600">{formatCategoryName(score.category)}</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-lg font-bold text-amber-800">
                          {score.points} pts
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditScore(score)}
                            className="text-amber-600 hover:text-amber-800 text-sm px-2 py-1 rounded"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteScore(score.id)}
                            className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        {/* Edit Score Modal */}
        {editingScore && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-semibold text-amber-900 mb-4">Edit Score</h3>
              <form onSubmit={handleUpdateScore} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-2">
                    Contestant
                  </label>
                  <select
                    value={editContestantId}
                    onChange={(e) => setEditContestantId(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    <option value="">Select contestant...</option>
                    {contestants.map(contestant => (
                      <option key={contestant.id} value={contestant.id}>
                        {contestant.name} {contestant.eliminatedWeek ? `(Eliminated Week ${contestant.eliminatedWeek})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-2">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    <option value="">Select category...</option>
                    {Object.keys(SCORING_CATEGORIES).map(category => (
                      <option key={category} value={category}>
                        {formatCategoryName(category)} ({SCORING_CATEGORIES[category as keyof typeof SCORING_CATEGORIES]} pts)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                  >
                    Update Score
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Quick Contestant Elimination */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-amber-900 mb-4">Quick Contestant Elimination</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contestants.map(contestant => (
              <div key={contestant.id} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-amber-900">{contestant.name}</div>
                    <div className="text-sm text-amber-600">
                      {contestant.eliminatedWeek ? `Eliminated Week ${contestant.eliminatedWeek}` : 'Still in competition'}
                    </div>
                  </div>
                  <Link
                    href="/admin/contestants"
                    className="text-amber-600 hover:text-amber-800 text-sm px-2 py-1 rounded border border-amber-300 hover:bg-amber-100"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link
              href="/admin/contestants"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              Manage All Contestants
            </Link>
          </div>
        </div>

        {/* Scoring Categories Reference */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-amber-900 mb-4">Scoring Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(SCORING_CATEGORIES).map(([category, points]) => (
              <div key={category} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="font-medium text-amber-900">{formatCategoryName(category)}</div>
                <div className="text-sm text-amber-600">{points} points</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
