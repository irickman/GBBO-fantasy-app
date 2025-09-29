import { NextResponse } from 'next/server'
import { getAllPlayers, getTeamsByPlayerId, getAllContestants } from '@/lib/db/queries'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const playerId = searchParams.get('playerId')
    const playerName = searchParams.get('name')
    
    console.log('=== PLAYER TEAMS ===')
    console.log('Player ID:', playerId)
    console.log('Player Name:', playerName)
    
    let targetPlayer = null
    let targetPlayerId = null
    
    if (playerId) {
      targetPlayerId = parseInt(playerId)
    } else if (playerName) {
      const players = await getAllPlayers()
      const foundPlayer = players.find(p => p.name.toLowerCase().includes(playerName.toLowerCase()))
      if (foundPlayer) {
        targetPlayer = foundPlayer
        targetPlayerId = foundPlayer.id
      }
    }
    
    if (!targetPlayerId) {
      return NextResponse.json({
        success: false,
        error: 'Player not found',
        allPlayers: await getAllPlayers().then(players => players.map(p => ({ id: p.id, name: p.name, teamName: p.teamName })))
      }, { status: 404 })
    }
    
    console.log('Target Player ID:', targetPlayerId)
    
    // Get player info if we searched by name
    if (!targetPlayer) {
      const players = await getAllPlayers()
      targetPlayer = players.find(p => p.id === targetPlayerId)
    }
    
    // Get teams for this player
    const teams = await getTeamsByPlayerId(targetPlayerId)
    console.log('Teams for player:', teams.length)
    console.log('Team details:', teams)
    
    // Get contestant names
    const contestants = await getAllContestants()
    const teamsWithNames = teams.map(team => {
      const contestant = contestants.find(c => c.id === team.contestantId)
      return {
        ...team,
        contestantName: contestant?.name || 'Unknown',
        contestantEliminatedWeek: contestant?.eliminatedWeek || null
      }
    })
    
    return NextResponse.json({
      success: true,
      player: targetPlayer,
      playerId: targetPlayerId,
      teams: teamsWithNames,
      teamCount: teamsWithNames.length
    })
    
  } catch (error) {
    console.error('=== PLAYER TEAMS ERROR ===', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
