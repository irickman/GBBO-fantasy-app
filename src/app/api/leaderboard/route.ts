import { NextResponse } from 'next/server'
import { getLeaderboard, getLeaderboardAsOfWeek, getCurrentWeek } from '@/lib/db/queries'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const asOfWeekParam = searchParams.get('asOfWeek')
    
    let leaderboard
    if (asOfWeekParam) {
      const asOfWeek = parseInt(asOfWeekParam, 10)
      const currentWeek = await getCurrentWeek()
      
      console.log('Historical view requested:', { asOfWeek, currentWeek })
      
      // Validate week is within range
      if (asOfWeek > 0 && asOfWeek <= currentWeek) {
        console.log('Calling getLeaderboardAsOfWeek for week:', asOfWeek)
        leaderboard = await getLeaderboardAsOfWeek(asOfWeek)
        console.log('Historical leaderboard returned:', leaderboard.length, 'players')
      } else {
        console.log('Invalid week, using current leaderboard')
        // Invalid week, use current
        leaderboard = await getLeaderboard()
      }
    } else {
      leaderboard = await getLeaderboard()
    }
    
    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error('Leaderboard API error', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}

