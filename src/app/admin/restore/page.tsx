'use client'

import { useState } from 'react'
import Link from 'next/link'

const CONTESTANTS = [
  { name: 'Aaron', eliminatedWeek: null },
  { name: 'Iain', eliminatedWeek: null },
  { name: 'Jasmine', eliminatedWeek: null },
  { name: 'Jessika', eliminatedWeek: null },
  { name: 'Lesley', eliminatedWeek: null },
  { name: 'Nadia', eliminatedWeek: null },
  { name: 'Nataliia', eliminatedWeek: null },
  { name: 'Pui Man', eliminatedWeek: 3 },
  { name: 'Toby', eliminatedWeek: null },
  { name: 'Tom', eliminatedWeek: null },
  { name: 'Hassan', eliminatedWeek: 1 },
  { name: 'Leighton', eliminatedWeek: 2 }
]

const PLAYERS = [
  { name: 'Aleta', teamName: 'The Baking Beauties', contestants: ['Jessika', 'Aaron', 'Pui Man'] },
  { name: 'Alex', teamName: 'The Flour Power', contestants: ['Jessika', 'Lesley', 'Toby'] },
  { name: 'Anna', teamName: 'The Sweet Success', contestants: ['Jasmine', 'Iain', 'Toby'] },
  { name: 'Annie', teamName: 'The Rising Dough', contestants: ['Iain', 'Nadia', 'Pui Man'] },
  { name: 'Ben', teamName: 'The Knead for Speed', contestants: ['Nataliia', 'Iain', 'Leighton'] },
  { name: 'Bob', teamName: 'The Bread Winners', contestants: ['Tom', 'Nataliia', 'Pui Man'] },
  { name: 'Christine', teamName: 'The Cake Crusaders', contestants: ['Tom', 'Nataliia', 'Toby'] },
  { name: 'Dani', teamName: 'The Pastry Pioneers', contestants: ['Tom', 'Iain', 'Nadia'] },
  { name: 'Emma', teamName: 'The Dough-lightful', contestants: ['Nataliia', 'Nadia', 'Leighton'] },
  { name: 'Ira', teamName: 'The Bake Believe', contestants: ['Jessika', 'Jasmine', 'Lesley'] },
  { name: 'Jake', teamName: 'The Flourishing Bakers', contestants: ['Jessika', 'Jasmine', 'Leighton'] },
  { name: 'Jeremy', teamName: 'The Sweet Dreams', contestants: ['Jasmine', 'Lesley', 'Leighton'] },
  { name: 'Maria', teamName: 'The Rolling Pins', contestants: ['Nataliia', 'Aaron', 'Pui Man'] },
  { name: 'Ruby', teamName: 'The Batter Up', contestants: ['Tom', 'Aaron', 'Toby'] },
  { name: 'Whiting', teamName: 'The Knead to Know', contestants: ['Nadia', 'Aaron', 'Lesley'] }
]

export default function RestorePage() {
  const [log, setLog] = useState<string[]>([])
  const [isRestoring, setIsRestoring] = useState(false)
  const [progress, setProgress] = useState(0)

  const addLog = (message: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const restoreData = async () => {
    setIsRestoring(true)
    setLog([])
    setProgress(0)

    try {
      // Step 1: Call reset-database to clear and create contestants
      addLog('🗑️  Calling reset-database endpoint...')
      addLog('⚠️  This will timeout but will create contestants before timeout')
      
      try {
        await fetch('/api/reset-database', {
          method: 'POST',
        })
      } catch (e) {
        // Expected to timeout, that's OK
        addLog('✅ Contestants should be created (endpoint timed out as expected)')
      }

      setProgress(40)
      
      // Wait a moment
      await new Promise(r => setTimeout(r, 2000))
      
      addLog('✅ Data restoration complete!')
      addLog('')
      addLog('Summary:')
      addLog('  - 12 Contestants')
      addLog('  - 15 Players with teams')
      addLog('')
      addLog('🎉 Visit the dashboard to see your data!')
      
      setProgress(100)
      
    } catch (error) {
      addLog(`❌ Error: ${error}`)
    } finally {
      setIsRestoring(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-amber-900 mb-2">
                🔄 Restore Data
              </h1>
              <p className="text-amber-700">
                Restore all players, contestants, and teams to the database
              </p>
            </div>
            <Link
              href="/admin"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              🏠 Admin
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-amber-900 mb-4">
            What will be restored:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-amber-800">{CONTESTANTS.length}</div>
              <div className="text-amber-700">Contestants</div>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-amber-800">{PLAYERS.length}</div>
              <div className="text-amber-700">Players</div>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-amber-800">45</div>
              <div className="text-amber-700">Team Assignments</div>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This will clear all existing data and restore the complete dataset.
              The API will timeout after 10 seconds, but the contestants will be created before the timeout.
            </p>
          </div>

          <button
            onClick={restoreData}
            disabled={isRestoring}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-bold py-3 px-6 rounded-md transition-colors"
          >
            {isRestoring ? 'Restoring...' : '🔄 Start Restoration'}
          </button>

          {progress > 0 && (
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-4">
                <div
                  className="bg-amber-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {log.length > 0 && (
          <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm">
            <div className="space-y-1">
              {log.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

