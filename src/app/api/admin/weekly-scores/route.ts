import { NextResponse } from 'next/server'
import { 
  createWeeklyScore, 
  updateWeeklyScore, 
  deleteWeeklyScore,
  getWeeklyScores,
  getWeeklyScoreById
} from '@/lib/db/queries'

// GET /api/admin/weekly-scores - Get weekly scores (optionally filtered by week)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const week = searchParams.get('week')
    const id = searchParams.get('id')
    
    if (id) {
      // Get specific weekly score
      const scoreId = parseInt(id)
      const score = await getWeeklyScoreById(scoreId)
      
      if (!score) {
        return NextResponse.json(
          { success: false, error: 'Weekly score not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        score 
      })
    } else if (week) {
      // Get scores for specific week
      const weekNum = parseInt(week)
      const scores = await getWeeklyScores(weekNum)
      return NextResponse.json({ 
        success: true, 
        scores,
        week: weekNum
      })
    } else {
      // Get all weekly scores
      const scores = await getWeeklyScores()
      return NextResponse.json({ 
        success: true, 
        scores 
      })
    }
  } catch (error) {
    console.error('Get weekly scores error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch weekly scores' },
      { status: 500 }
    )
  }
}

// POST /api/admin/weekly-scores - Create a new weekly score
export async function POST(req: Request) {
  try {
    const { week, contestantId, category, points } = await req.json()
    
    if (!week || !contestantId || !category || points === undefined) {
      return NextResponse.json(
        { success: false, error: 'Week, contestant ID, category, and points are required' },
        { status: 400 }
      )
    }

    const score = await createWeeklyScore(week, contestantId, category, points)
    return NextResponse.json({ 
      success: true, 
      score 
    })
  } catch (error) {
    console.error('Create weekly score error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create weekly score' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/weekly-scores - Update a weekly score
export async function PUT(req: Request) {
  try {
    const { id, week, contestantId, category, points } = await req.json()
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Score ID is required' },
        { status: 400 }
      )
    }

    if (week === undefined || !contestantId || !category || points === undefined) {
      return NextResponse.json(
        { success: false, error: 'Week, contestant ID, category, and points are required' },
        { status: 400 }
      )
    }

    const score = await updateWeeklyScore(id, week, contestantId, category, points)
    if (!score) {
      return NextResponse.json(
        { success: false, error: 'Weekly score not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      score 
    })
  } catch (error) {
    console.error('Update weekly score error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update weekly score' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/weekly-scores - Delete a weekly score
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Score ID is required' },
        { status: 400 }
      )
    }

    const scoreId = parseInt(id)
    const deleted = await deleteWeeklyScore(scoreId)
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Weekly score not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Weekly score deleted successfully' 
    })
  } catch (error) {
    console.error('Delete weekly score error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete weekly score' },
      { status: 500 }
    )
  }
}
