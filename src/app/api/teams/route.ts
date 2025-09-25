import { NextResponse } from 'next/server'
import { getPlayers, getContestants } from '@/lib/db/queries'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const players = await getPlayers()
    const contestants = await getContestants()
    const allTeams = []
    
    // Get teams for each player
    for (const player of players) {
      const playerTeams = await db.getTeamsByPlayerId(player.id)
      for (const team of playerTeams) {
        const contestant = contestants.find(c => c.id === team.contestantId)
        allTeams.push({
          teamId: team.id,
          playerId: team.playerId,
          playerName: player.name,
          teamName: player.teamName,
          contestantId: team.contestantId,
          contestantName: contestant?.name || 'Unknown',
          eliminatedWeek: contestant?.eliminatedWeek || null
        })
      }
    }
    
    // Sort by player name, then contestant name
    allTeams.sort((a, b) => {
      if (a.playerName !== b.playerName) {
        return a.playerName.localeCompare(b.playerName)
      }
      return a.contestantName.localeCompare(b.contestantName)
    })
    
    return NextResponse.json({ teams: allTeams })
  } catch (error) {
    console.error('Teams API error:', error)
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
  }
}

