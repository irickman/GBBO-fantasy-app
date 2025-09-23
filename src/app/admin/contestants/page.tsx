import { authGuard } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getAllContestants } from '@/lib/db/queries'
import { createContestantAction } from './actions'

export default async function AdminContestantsPage() {
  const isAuthenticated = await authGuard()
  if (!isAuthenticated) redirect('/login')

  const contestants = await getAllContestants()

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-amber-800 mb-6">Manage Contestants</h1>

          <form action={createContestantAction} className="flex gap-3 mb-8">
            <input
              type="text"
              name="name"
              placeholder="New contestant name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              required
            />
            <button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              Add
            </button>
          </form>

          <ul className="divide-y divide-gray-200">
            {contestants.map((c) => (
              <li key={c.id} className="py-3 flex items-center justify-between">
                <span className="text-amber-800 font-medium">{c.name}</span>
                {c.eliminatedWeek != null && (
                  <span className="text-sm text-amber-600">Eliminated week {c.eliminatedWeek}</span>
                )}
              </li>
            ))}
            {contestants.length === 0 && (
              <li className="py-6 text-amber-600">No contestants yet. Add the first one above.</li>
            )}
          </ul>
        </div>
      </div>
    </main>
  )
}
