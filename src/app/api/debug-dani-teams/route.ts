import { NextResponse } from 'next/server'
import { getPlayerTeamsAction } from '@/app/admin/teams/actions'

export async function GET() {
  try {
    // Find Dani's player ID first
    const { db } = await import('@/lib/db')
    const players = await db.getPlayers()
    const dani = players.find(p => p.name === 'Dani')
    
    if (!dani) {
      return NextResponse.json({ error: 'Dani not found' }, { status: 404 })
    }

    // Get Dani's teams using the server action
    const result = await getPlayerTeamsAction(dani.id)
    
    return NextResponse.json({
      playerId: dani.id,
      playerName: dani.name,
      teamsResult: result,
      rawTeams: await db.getTeamsByPlayerId(dani.id)
    })
  } catch (error) {
    console.error('Debug Dani teams error:', error)
    return NextResponse.json({ error: 'Failed to debug Dani teams' }, { status: 500 })
  }
}
