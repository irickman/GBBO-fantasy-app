import { NextResponse } from 'next/server'
import { getAllContestants } from '@/lib/db/queries'

export async function GET() {
  try {
    console.log('=== DEBUG CONTESTANTS API ===')
    
    const contestants = await getAllContestants()
    console.log('Contestants from database:', contestants.length)
    console.log('Contestants data:', contestants.map(c => ({ id: c.id, name: c.name, eliminatedWeek: c.eliminatedWeek })))
    
    return NextResponse.json({
      success: true,
      contestants,
      count: contestants.length,
      sample: contestants.slice(0, 3)
    })
    
  } catch (error) {
    console.error('=== DEBUG CONTESTANTS ERROR ===', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
