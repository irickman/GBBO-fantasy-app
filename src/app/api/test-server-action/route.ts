import { NextResponse } from 'next/server'
import { getAllContestantsAction } from '@/app/admin/contestants/actions'

export async function GET() {
  try {
    console.log('=== TESTING SERVER ACTION ===')
    
    // Create a mock FormData to test the server action
    const mockFormData = new FormData()
    const result = await getAllContestantsAction()
    
    console.log('Server action result:', result)
    
    return NextResponse.json({
      success: true,
      result,
      message: 'Server action test completed'
    })
    
  } catch (error) {
    console.error('=== SERVER ACTION TEST ERROR ===', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
