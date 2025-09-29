import { NextResponse } from 'next/server'
import { updatePlayerTeamAction } from '@/app/admin/teams/actions'

export async function POST(req: Request) {
  try {
    const { playerId, contestantIds } = await req.json()
    
    console.log('=== DEBUG TEAM ASSIGNMENT ===')
    console.log('Player ID:', playerId)
    console.log('Contestant IDs:', contestantIds)
    
    // Create FormData exactly like the UI does
    const formData = new FormData()
    formData.append('playerId', playerId.toString())
    formData.append('contestantIds', JSON.stringify(contestantIds))
    
    console.log('FormData entries:', Object.fromEntries(formData.entries()))
    
    // Call the server action
    const result = await updatePlayerTeamAction(formData)
    
    console.log('Server action result:', result)
    
    return NextResponse.json({
      success: true,
      playerId,
      contestantIds,
      result
    })
  } catch (error) {
    console.error('Debug team assignment error:', error)
    return NextResponse.json({ 
      error: 'Debug team assignment failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
