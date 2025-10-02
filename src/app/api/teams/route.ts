import { NextResponse } from 'next/server'
import { getPlayers, getContestants, getCurrentWeek } from '@/lib/db/queries'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const asOfWeekParam = searchParams.get('asOfWeek')
    
    let asOfWeek: number | null = null
    if (asOfWeekParam) {
      const parsedWeek = parseInt(asOfWeekParam, 10)
      const currentWeek = await getCurrentWeek()
      if (parsedWeek > 0 && parsedWeek <= currentWeek) {
        asOfWeek = parsedWeek
      }
    }
    
    const players = await getPlayers()
    const contestants = await getContestants()
    const allTeams = []
    
    // Get teams for each player
    for (const player of players) {
      const playerTeams = await db.getTeamsByPlayerId(player.id)
      for (const team of playerTeams) {
        const contestant = contestants.find(c => c.id === team.contestantId)
        
        // Adjust elimination status based on asOfWeek
        let eliminatedWeek = contestant?.eliminatedWeek || null
        if (asOfWeek !== null && eliminatedWeek !== null && eliminatedWeek > asOfWeek) {
          // This elimination hasn't happened yet in the selected week
          eliminatedWeek = null
        }
        
        allTeams.push({
          teamId: team.id,
          playerId: team.playerId,
          playerName: player.name,
          teamName: player.teamName,
          contestantId: team.contestantId,
          contestantName: contestant?.name || 'Unknown',
          eliminatedWeek
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

