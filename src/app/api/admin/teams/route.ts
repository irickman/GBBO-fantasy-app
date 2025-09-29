import { NextResponse } from 'next/server'
import { 
  createTeam, 
  deleteTeam, 
  updatePlayerTeam,
  getTeamsByPlayerId,
  getAllTeams 
} from '@/lib/db/queries'

// GET /api/admin/teams - Get all teams or teams for a specific player
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const playerId = searchParams.get('playerId')
    
    if (playerId) {
      // Get teams for specific player
      const playerIdNum = parseInt(playerId)
      const teams = await getTeamsByPlayerId(playerIdNum)
      return NextResponse.json({ 
        success: true, 
        teams 
      })
    } else {
      // Get all teams
      const teams = await getAllTeams()
      return NextResponse.json({ 
        success: true, 
        teams 
      })
    }
  } catch (error) {
    console.error('Get teams error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch teams' },
      { status: 500 }
    )
  }
}

// POST /api/admin/teams - Create a team assignment
export async function POST(req: Request) {
  try {
    const { playerId, contestantId } = await req.json()
    
    if (!playerId || !contestantId) {
      return NextResponse.json(
        { success: false, error: 'Player ID and Contestant ID are required' },
        { status: 400 }
      )
    }

    const team = await createTeam(playerId, contestantId)
    return NextResponse.json({ 
      success: true, 
      team 
    })
  } catch (error) {
    console.error('Create team error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create team assignment' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/teams - Update player's team (replace all contestants)
export async function PUT(req: Request) {
  try {
    const { playerId, contestantIds } = await req.json()
    
    if (!playerId || !contestantIds || !Array.isArray(contestantIds)) {
      return NextResponse.json(
        { success: false, error: 'Player ID and contestant IDs array are required' },
        { status: 400 }
      )
    }

    if (contestantIds.length !== 3) {
      return NextResponse.json(
        { success: false, error: 'Exactly 3 contestants must be provided' },
        { status: 400 }
      )
    }

    const updated = await updatePlayerTeam(playerId, contestantIds)
    return NextResponse.json({ 
      success: true, 
      message: 'Player team updated successfully',
      updated 
    })
  } catch (error) {
    console.error('Update team error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update player team' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/teams - Delete a team assignment
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const teamId = searchParams.get('teamId')
    const playerId = searchParams.get('playerId')
    
    if (teamId) {
      // Delete specific team assignment
      const teamIdNum = parseInt(teamId)
      const deleted = await deleteTeam(teamIdNum)
      
      if (!deleted) {
        return NextResponse.json(
          { success: false, error: 'Team assignment not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Team assignment deleted successfully' 
      })
    } else if (playerId) {
      // Delete all team assignments for a player
      const playerIdNum = parseInt(playerId)
      const teams = await getTeamsByPlayerId(playerIdNum)
      
      for (const team of teams) {
        await deleteTeam(team.id)
      }

      return NextResponse.json({ 
        success: true, 
        message: 'All team assignments deleted for player' 
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Team ID or Player ID is required' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Delete team error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete team assignment' },
      { status: 500 }
    )
  }
}
