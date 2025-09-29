import { NextResponse } from 'next/server'
import { getAllPlayersAction, getAllContestantsAction } from '../../admin/teams/actions'

export async function GET() {
  try {
    console.log('🔍 Testing UI data loading...')
    
    const playersRes = await getAllPlayersAction()
    const contestantsRes = await getAllContestantsAction()
    
    return NextResponse.json({
      success: true,
      players: {
        ok: playersRes.ok,
        error: playersRes.error,
        count: playersRes.players?.length || 0,
        firstPlayer: playersRes.players?.[0] || null
      },
      contestants: {
        ok: contestantsRes.ok,
        error: contestantsRes.error,
        count: contestantsRes.contestants?.length || 0,
        firstContestant: contestantsRes.contestants?.[0] || null
      }
    })
    
  } catch (error) {
    console.error('❌ Error testing UI data:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
