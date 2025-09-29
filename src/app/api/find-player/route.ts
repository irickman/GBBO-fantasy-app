import { NextResponse } from 'next/server'
import { getAllPlayers } from '@/lib/db/queries'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const playerName = searchParams.get('name')
    
    console.log('=== FIND PLAYER ===')
    console.log('Searching for player:', playerName)
    
    const players = await getAllPlayers()
    console.log('All players:', players.length)
    console.log('Player names:', players.map(p => p.name))
    
    let result = null
    if (playerName) {
      result = players.find(p => p.name.toLowerCase().includes(playerName.toLowerCase()))
      console.log('Found player:', result)
    }
    
    return NextResponse.json({
      success: true,
      searchName: playerName,
      allPlayers: players.map(p => ({ id: p.id, name: p.name, teamName: p.teamName })),
      foundPlayer: result,
      totalPlayers: players.length
    })
    
  } catch (error) {
    console.error('=== FIND PLAYER ERROR ===', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
