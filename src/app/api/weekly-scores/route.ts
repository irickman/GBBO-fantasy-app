import { NextResponse } from 'next/server'
import { getWeeklyScoresByWeek, getCurrentWeek } from '@/lib/db/queries'

export async function GET() {
  try {
    const currentWeek = await getCurrentWeek()
    const allWeeklyScores = []
    
    // Get scores for all weeks from 2 to current week
    for (let week = 2; week <= currentWeek; week++) {
      const scores = await getWeeklyScoresByWeek(week)
      if (scores.length > 0) {
        allWeeklyScores.push({
          week,
          scores
        })
      }
    }
    
    return NextResponse.json({ weeklyScores: allWeeklyScores })
  } catch (error) {
    console.error('Weekly scores API error:', error)
    return NextResponse.json({ error: 'Failed to fetch weekly scores' }, { status: 500 })
  }
}
