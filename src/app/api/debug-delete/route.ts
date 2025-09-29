import { NextResponse } from 'next/server'
import { db } from '@/lib/db/index'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { contestantId } = body
    
    if (!contestantId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Contestant ID is required' 
      }, { status: 400 })
    }
    
    console.log('=== DEBUG DELETE CONTESTANT ===')
    console.log('Contestant ID to delete:', contestantId)
    console.log('BLOB_READ_WRITE_TOKEN exists:', !!process.env.BLOB_READ_WRITE_TOKEN)
    
    // Get contestants before deletion
    const contestantsBefore = await db.getContestants()
    console.log('Contestants before deletion:', contestantsBefore.length)
    console.log('Contestants before:', contestantsBefore.map(c => ({ id: c.id, name: c.name })))
    
    // Check if contestant exists
    const contestantToDelete = contestantsBefore.find(c => c.id === contestantId)
    console.log('Contestant to delete found:', !!contestantToDelete)
    if (contestantToDelete) {
      console.log('Contestant details:', contestantToDelete)
    }
    
    // Attempt deletion
    console.log('Attempting deletion...')
    const deleteResult = await db.deleteContestant(contestantId)
    console.log('Delete result:', deleteResult)
    
    // Get contestants after deletion
    const contestantsAfter = await db.getContestants()
    console.log('Contestants after deletion:', contestantsAfter.length)
    console.log('Contestants after:', contestantsAfter.map(c => ({ id: c.id, name: c.name })))
    
    const success = contestantsAfter.length < contestantsBefore.length
    
    return NextResponse.json({
      success,
      message: success ? 'Contestant deleted successfully' : 'Contestant deletion failed',
      contestantId,
      contestantToDelete,
      deleteResult,
      contestantsBefore: contestantsBefore.length,
      contestantsAfter: contestantsAfter.length,
      contestantsBeforeList: contestantsBefore.map(c => ({ id: c.id, name: c.name })),
      contestantsAfterList: contestantsAfter.map(c => ({ id: c.id, name: c.name }))
    })
    
  } catch (error) {
    console.error('=== DEBUG DELETE ERROR ===', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
