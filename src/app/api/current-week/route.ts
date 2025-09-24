import { NextResponse } from 'next/server'
import { getCurrentWeek, getWeekStatus } from '@/lib/db/queries'

export async function GET() {
  try {
    const currentWeek = await getCurrentWeek()
    const weekStatus = await getWeekStatus(currentWeek)
    
    return NextResponse.json({ 
      currentWeek,
      weekStatus,
      message: `Current week: ${currentWeek}`
    })
  } catch (error) {
    console.error('Current week API error', error)
    return NextResponse.json({ error: 'Failed to get current week' }, { status: 500 })
  }
}
