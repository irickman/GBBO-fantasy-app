// app/leaderboard/page.tsx
import { getCurrentWeek } from '@/lib/leaderboard';
import Link from 'next/link';

export default async function LeaderboardPage() {
  const { index, week } = await getCurrentWeek();

  // If "scores" already represent totals for that week, just sort.
  const rows = [...week.scores].sort((a, b) => b.points - a.points);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-amber-900 mb-2">🏆 Leaderboard</h1>
              <p className="text-amber-700">
                Season {index.currentSeasonId}, Week {index.currentWeek}
              </p>
            </div>
            <Link
              href="/dashboard"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              🏠 Home
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-amber-900 mb-4">Current Standings</h2>
          
          {rows.length === 0 ? (
            <p className="text-amber-600">No scores recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[360px] text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-6">Rank</th>
                    <th className="py-2 pr-6">Team</th>
                    <th className="py-2 pr-6">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.teamId} className="border-b">
                      <td className="py-2 pr-6">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                          i === 0 ? 'bg-yellow-500' : 
                          i === 1 ? 'bg-gray-400' : 
                          i === 2 ? 'bg-amber-600' : 'bg-amber-500'
                        }`}>
                          {i + 1}
                        </div>
                      </td>
                      <td className="py-2 pr-6 font-semibold text-amber-900">{r.teamId}</td>
                      <td className="py-2 pr-6 text-2xl font-bold text-amber-800">{r.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
