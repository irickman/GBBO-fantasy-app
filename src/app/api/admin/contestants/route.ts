import { NextResponse } from 'next/server'
import { 
  getAllContestants, 
  createContestant, 
  updateContestant, 
  deleteContestant 
} from '@/lib/db/queries'

// GET /api/admin/contestants - Get all contestants
export async function GET() {
  try {
    const contestants = await getAllContestants()
    return NextResponse.json({ 
      success: true, 
      contestants 
    })
  } catch (error) {
    console.error('Get contestants error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contestants' },
      { status: 500 }
    )
  }
}

// POST /api/admin/contestants - Create a new contestant
export async function POST(req: Request) {
  try {
    const { name, eliminatedWeek } = await req.json()
    
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      )
    }

    const contestant = await createContestant(name, eliminatedWeek || null)
    return NextResponse.json({ 
      success: true, 
      contestant 
    })
  } catch (error) {
    console.error('Create contestant error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create contestant' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/contestants - Update a contestant
export async function PUT(req: Request) {
  try {
    const { id, name, eliminatedWeek } = await req.json()
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Contestant ID is required' },
        { status: 400 }
      )
    }

    const contestant = await updateContestant(id, { name, eliminatedWeek })
    if (!contestant) {
      return NextResponse.json(
        { success: false, error: 'Contestant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      contestant 
    })
  } catch (error) {
    console.error('Update contestant error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update contestant' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/contestants - Delete a contestant
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Contestant ID is required' },
        { status: 400 }
      )
    }

    const contestantId = parseInt(id)
    const deleted = await deleteContestant(contestantId)
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Contestant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Contestant deleted successfully' 
    })
  } catch (error) {
    console.error('Delete contestant error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete contestant' },
      { status: 500 }
    )
  }
}
