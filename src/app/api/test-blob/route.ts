import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Test if we can read from blob storage
    const contestants = await db.getContestants()
    const players = await db.getPlayers()
    
    return NextResponse.json({ 
      success: true,
      contestants: contestants.length,
      players: players.length,
      data: {
        contestants: contestants.slice(0, 3), // First 3 contestants
        players: players.slice(0, 3) // First 3 players
      }
    })
  } catch (error) {
    console.error('Blob storage test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
