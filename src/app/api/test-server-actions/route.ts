import { NextResponse } from 'next/server'
import { getAllPlayersAction, getAllContestantsAction } from '@/app/admin/teams/actions'

export async function GET() {
  try {
    console.log('🧪 Testing server actions...')
    
    const playersRes = await getAllPlayersAction()
    const contestantsRes = await getAllContestantsAction()
    
    console.log('📊 Server action results:')
    console.log(`   - Players action: ok=${playersRes.ok}, players=${playersRes.ok ? playersRes.players?.length : 'error'}`)
    console.log(`   - Contestants action: ok=${contestantsRes.ok}, contestants=${contestantsRes.ok ? contestantsRes.contestants?.length : 'error'}`)
    
    return NextResponse.json({
      success: true,
      data: {
        players: {
          ok: playersRes.ok,
          count: playersRes.ok ? playersRes.players?.length : 0,
          error: playersRes.ok ? null : playersRes.error
        },
        contestants: {
          ok: contestantsRes.ok,
          count: contestantsRes.ok ? contestantsRes.contestants?.length : 0,
          error: contestantsRes.ok ? null : contestantsRes.error
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Server action test error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
