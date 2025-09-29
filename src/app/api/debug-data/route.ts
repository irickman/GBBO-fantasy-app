import { NextResponse } from 'next/server'
import { blobDb } from '@/lib/db/blob-storage'

export async function GET() {
  try {
    console.log('🔍 Debugging data from blob storage...')
    
    const players = await blobDb.getPlayers()
    const contestants = await blobDb.getContestants()
    
    return NextResponse.json({
      success: true,
      data: {
        players: players.length,
        contestants: contestants.length,
        firstPlayer: players[0] || null,
        firstContestant: contestants[0] || null,
        allPlayers: players.map(p => ({ id: p.id, name: p.name, teamName: p.teamName })),
        allContestants: contestants.map(c => ({ id: c.id, name: c.name, eliminatedWeek: c.eliminatedWeek }))
      }
    })
    
  } catch (error) {
    console.error('❌ Error debugging data:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
