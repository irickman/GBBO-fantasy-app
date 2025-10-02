import { NextResponse } from 'next/server'
import { getLeaderboardAsOfWeek } from '@/lib/db/queries'

export async function GET() {
  try {
    console.log('Testing getLeaderboardAsOfWeek with week 1')
    const result = await getLeaderboardAsOfWeek(1)
    console.log('Result length:', result.length)
    console.log('First few players:', result.slice(0, 3).map(p => p.playerName))
    
    return NextResponse.json({ 
      success: true, 
      count: result.length,
      players: result.map(p => p.playerName)
    })
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
