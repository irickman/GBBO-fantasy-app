import { NextResponse } from 'next/server'
import { 
  getSeasonTotals,
  getSeasonTotalByPlayerId,
  updateSeasonTotal,
  calculateSeasonTotals
} from '@/lib/db/queries'

// GET /api/admin/season-totals - Get season totals (optionally filtered by player)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const playerId = searchParams.get('playerId')
    
    if (playerId) {
      // Get season total for specific player
      const playerIdNum = parseInt(playerId)
      const total = await getSeasonTotalByPlayerId(playerIdNum)
      
      if (!total) {
        return NextResponse.json(
          { success: false, error: 'Season total not found for player' },
          { status: 404 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        total 
      })
    } else {
      // Get all season totals
      const totals = await getSeasonTotals()
      return NextResponse.json({ 
        success: true, 
        totals 
      })
    }
  } catch (error) {
    console.error('Get season totals error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch season totals' },
      { status: 500 }
    )
  }
}

// POST /api/admin/season-totals - Calculate and update season totals
export async function POST(req: Request) {
  try {
    const { playerId, week } = await req.json()
    
    if (playerId !== undefined && week !== undefined) {
      // Calculate totals for specific player and week
      const totals = await calculateSeasonTotals()
      return NextResponse.json({ 
        success: true, 
        message: 'Season totals calculated successfully',
        totals 
      })
    } else {
      // Calculate all season totals
      const totals = await calculateSeasonTotals()
      return NextResponse.json({ 
        success: true, 
        message: 'All season totals calculated successfully',
        totals 
      })
    }
  } catch (error) {
    console.error('Calculate season totals error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to calculate season totals' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/season-totals - Update season total for a player
export async function PUT(req: Request) {
  try {
    const { playerId, totalPoints } = await req.json()
    
    if (!playerId || totalPoints === undefined) {
      return NextResponse.json(
        { success: false, error: 'Player ID and total points are required' },
        { status: 400 }
      )
    }

    const total = await updateSeasonTotal(playerId, { totalPoints })
    if (!total) {
      return NextResponse.json(
        { success: false, error: 'Season total not found for player' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      total 
    })
  } catch (error) {
    console.error('Update season total error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update season total' },
      { status: 500 }
    )
  }
}
