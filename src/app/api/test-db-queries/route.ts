import { NextResponse } from 'next/server'
import { getAllPlayers, getAllContestants, getAllTeams } from '@/lib/db/queries'

export async function GET() {
  try {
    console.log('🧪 Testing database queries...')
    
    const players = await getAllPlayers()
    const contestants = await getAllContestants()
    const teams = await getAllTeams()
    
    console.log('📊 Database query results:')
    console.log(`   - Players: ${players.length}`)
    console.log(`   - Contestants: ${contestants.length}`)
    console.log(`   - Teams: ${teams.length}`)
    
    return NextResponse.json({
      success: true,
      data: {
        players: players.length,
        contestants: contestants.length,
        teams: teams.length,
        samplePlayers: players.slice(0, 3).map(p => ({ id: p.id, name: p.name, teamName: p.teamName })),
        sampleContestants: contestants.slice(0, 3).map(c => ({ id: c.id, name: c.name })),
        sampleTeams: teams.slice(0, 3).map(t => ({ id: t.id, playerId: t.playerId, contestantId: t.contestantId }))
      }
    })
    
  } catch (error) {
    console.error('❌ Database query error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
