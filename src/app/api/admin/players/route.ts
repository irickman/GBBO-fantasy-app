import { NextResponse } from 'next/server'
import { 
  getAllPlayers, 
  createPlayer, 
  updatePlayer, 
  deletePlayer 
} from '@/lib/db/queries'

// GET /api/admin/players - Get all players
export async function GET() {
  try {
    const players = await getAllPlayers()
    return NextResponse.json({ 
      success: true, 
      players 
    })
  } catch (error) {
    console.error('Get players error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch players' },
      { status: 500 }
    )
  }
}

// POST /api/admin/players - Create a new player
export async function POST(req: Request) {
  try {
    const { name, teamName } = await req.json()
    
    if (!name || !teamName) {
      return NextResponse.json(
        { success: false, error: 'Name and team name are required' },
        { status: 400 }
      )
    }

    const player = await createPlayer(name, teamName)
    return NextResponse.json({ 
      success: true, 
      player 
    })
  } catch (error) {
    console.error('Create player error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create player' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/players - Update a player
export async function PUT(req: Request) {
  try {
    const { id, name, teamName } = await req.json()
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Player ID is required' },
        { status: 400 }
      )
    }

    const player = await updatePlayer(id, { name, teamName })
    if (!player) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      player 
    })
  } catch (error) {
    console.error('Update player error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update player' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/players - Delete a player
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Player ID is required' },
        { status: 400 }
      )
    }

    const playerId = parseInt(id)
    const deleted = await deletePlayer(playerId)
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Player deleted successfully' 
    })
  } catch (error) {
    console.error('Delete player error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete player' },
      { status: 500 }
    )
  }
}
