import { NextResponse } from 'next/server'
import { db } from '@/lib/db/index'

export async function POST() {
  try {
    console.log('Testing contestant creation...')
    
    // Create a single contestant
    const contestant = await db.createContestant('Test Contestant', null)
    console.log('Created contestant:', contestant)

    // Try to retrieve contestants
    const contestants = await db.getContestants()
    console.log('Retrieved contestants:', contestants.length)

    return NextResponse.json({ 
      success: true, 
      message: 'Test contestant created successfully',
      contestant,
      totalContestants: contestants.length
    })
  } catch (error) {
    console.error('Test contestant error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
