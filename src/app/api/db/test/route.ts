import { NextResponse } from 'next/server'
import { getAllPlayers, getAllContestants, getAllTeams } from '@/lib/db/queries'

export async function GET() {
  try {
    const [players, contestants, teams] = await Promise.all([
      getAllPlayers(),
      getAllContestants(),
      getAllTeams()
    ])

    return NextResponse.json({
      success: true,
      data: {
        players: players.length,
        contestants: contestants.length,
        teams: teams.length,
        sampleData: {
          players: players.slice(0, 3),
          contestants: contestants.slice(0, 3),
          teams: teams.slice(0, 3)
        }
      }
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to test database' },
      { status: 500 }
    )
  }
}
