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
        try {
          console.log('Calling getLeaderboardAsOfWeek for week:', asOfWeek)
          leaderboard = await getLeaderboardAsOfWeek(asOfWeek)
          console.log('Historical leaderboard returned:', leaderboard.length, 'players')
          
          // If we get fewer than 15 players, something is wrong
          if (leaderboard.length < 15) {
            console.log('WARNING: Historical leaderboard has only', leaderboard.length, 'players, expected 15')
            // Let's return a simple test to confirm the API path is working
            leaderboard = [
              { id: 999, playerId: 999, playerName: 'HISTORICAL_TEST', teamName: 'Test Team', totalPoints: 0, week: asOfWeek, contestantId: 0, points: 0, runningTotal: 0, lastUpdated: new Date() }
            ]
          }
        } catch (error) {
          console.error('Error in getLeaderboardAsOfWeek, falling back to current:', error)
          leaderboard = await getLeaderboard()
        }
      } else {
        console.log('Invalid week, using current leaderboard')
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

