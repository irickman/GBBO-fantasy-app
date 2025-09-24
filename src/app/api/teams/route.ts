import { NextResponse } from 'next/server'
import { getAllTeams, getAllPlayers, getAllContestants } from '@/lib/db/queries'

export async function GET() {
  try {
    const teams = await getAllTeams()
    const players = await getAllPlayers()
    const contestants = await getAllContestants()
    
    // Add player and contestant names to teams
    const teamsWithNames = teams.map(team => {
      const player = players.find(p => p.id === team.playerId)
      const contestant = contestants.find(c => c.id === team.contestantId)
      return {
        teamId: team.id,
        playerId: team.playerId,
        playerName: player?.name || 'Unknown',
        teamName: player?.teamName || 'Unknown',
        contestantId: team.contestantId,
        contestantName: contestant?.name || 'Unknown',
        eliminatedWeek: contestant?.eliminatedWeek || null
      }
    })
    
    return NextResponse.json({ teams: teamsWithNames })
  } catch (error) {
    console.error('Teams API error:', error)
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
  }
}

