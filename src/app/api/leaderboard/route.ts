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
        
        // TEMPORARY: Force return all 15 players for testing
        if (leaderboard.length < 15) {
          console.log('Historical leaderboard has fewer than 15 players, this is the bug!')
          // For now, let's return a test response to confirm the API is working
          leaderboard = [
            { id: 1, playerId: 1, playerName: 'TEST_PLAYER_1', teamName: 'Test Team 1', totalPoints: 0, week: asOfWeek, contestantId: 0, points: 0, runningTotal: 0, lastUpdated: new Date() },
            { id: 2, playerId: 2, playerName: 'TEST_PLAYER_2', teamName: 'Test Team 2', totalPoints: 0, week: asOfWeek, contestantId: 0, points: 0, runningTotal: 0, lastUpdated: new Date() }
          ]
        }
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

