// app/leaderboard-simple/page.tsx
import { getCurrentWeek } from '@/lib/leaderboard';

export default async function LeaderboardSimplePage() {
  const { index, week } = await getCurrentWeek();

  // If "scores" already represent totals for that week, just sort.
  const rows = [...week.scores].sort((a, b) => b.points - a.points);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">GBBO Leaderboard</h1>
      <p className="text-sm text-gray-500 mt-1">
        Season {index.currentSeasonId}, Week {index.currentWeek}
      </p>

      <div className="mt-4 overflow-x-auto">
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
                <td className="py-2 pr-6">{i + 1}</td>
                <td className="py-2 pr-6">{r.teamId}</td>
                <td className="py-2 pr-6">{r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
