'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { createPlayer, getAllPlayers, getAllContestants, getAllTeams, getTeamsByPlayerId, deletePlayer, createTeam, deleteTeam, updatePlayer } from '@/lib/db/queries'

export async function createPlayerAction(formData: FormData) {
  const name = (formData.get('name') || '').toString().trim()
  const teamName = (formData.get('teamName') || '').toString().trim()
  if (!name || !teamName) {
    return { ok: false, error: 'Name and team name are required' }
  }

  try {
    const player = await createPlayer(name, teamName)
    revalidatePath('/admin/teams')
    revalidatePath('/dashboard')
    revalidateTag('players')
    revalidateTag('teams')
    return { ok: true, player }
  } catch (error) {
    console.error('createPlayerAction error', error)
    return { ok: false, error: 'Failed to create player' }
  }
}

export async function updatePlayerAction(formData: FormData) {
  const id = parseInt((formData.get('id') || '').toString())
  const name = (formData.get('name') || '').toString().trim()
  const teamName = (formData.get('teamName') || '').toString().trim()
  
  if (!id || !name || !teamName) {
    return { ok: false, error: 'Player ID, name and team name are required' }
  }

  try {
    const player = await updatePlayer(id, { name, teamName })
    if (!player) {
      return { ok: false, error: 'Player not found' }
    }
    revalidatePath('/admin/teams')
    revalidatePath('/dashboard')
    revalidateTag('players')
    return { ok: true, player }
  } catch (error) {
    console.error('updatePlayerAction error', error)
    return { ok: false, error: 'Failed to update player' }
  }
}

export async function updatePlayerTeamAction(formData: FormData) {
  const playerId = parseInt((formData.get('playerId') || '').toString())
  const contestantIds = (formData.get('contestantIds') || '').toString()

  console.log('=== UPDATE PLAYER TEAM ACTION ===')
  console.log('Player ID:', playerId)
  console.log('Contestant IDs:', contestantIds)

  if (!playerId || !contestantIds) {
    return { ok: false, error: 'Player ID and contestant IDs are required' }
  }

  try {
    const selectedContestantIds = JSON.parse(contestantIds)
    console.log('Parsed contestant IDs:', selectedContestantIds)
    
    if (selectedContestantIds.length !== 3) {
      return { ok: false, error: 'Exactly 3 contestants must be selected' }
    }

    // Delete existing team assignments for this player
    const existingTeams = await getTeamsByPlayerId(playerId)
    console.log('Existing teams to delete:', existingTeams)
    for (const team of existingTeams) {
      console.log('Deleting team:', team.id)
      await deleteTeam(team.id)
    }

    // Create new team assignments
    for (const contestantId of selectedContestantIds) {
      console.log('Creating team for contestant:', contestantId)
      await createTeam(playerId, contestantId)
    }

    console.log('Team update completed, revalidating paths...')
    revalidatePath('/admin/teams')
    revalidatePath('/dashboard')
    revalidateTag('teams')
    return { ok: true }
  } catch (error) {
    console.error('updatePlayerTeamAction error', error)
    return { ok: false, error: 'Failed to update player team' }
  }
}

export async function assignContestantsAction(formData: FormData) {
  const playerId = parseInt((formData.get('playerId') || '').toString())
  const contestantIds = (formData.get('contestantIds') || '').toString().split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))

  if (!playerId || contestantIds.length !== 3) {
    return { ok: false, error: 'Must select exactly 3 contestants' }
  }

  try {
    // First, remove existing assignments for this player
    const existingTeams = await getTeamsByPlayerId(playerId)
    for (const team of existingTeams) {
      await deleteTeam(team.id)
    }
    
    // Assign the 3 contestants
    for (const contestantId of contestantIds) {
      await createTeam(playerId, contestantId)
    }
    
    revalidatePath('/admin/teams')
    revalidatePath('/dashboard')
    revalidateTag('teams')
    return { ok: true }
  } catch (error) {
    console.error('assignContestantsAction error', error)
    return { ok: false, error: 'Failed to assign contestants' }
  }
}

export async function getAllPlayersAction() {
  try {
    const playersData = await getAllPlayers()
    return { ok: true, players: playersData }
  } catch (error) {
    console.error('getAllPlayersAction error', error)
    return { ok: false, error: 'Failed to fetch players' }
  }
}

export async function getAllContestantsAction() {
  try {
    const contestantsData = await getAllContestants()
    return { ok: true, contestants: contestantsData }
  } catch (error) {
    console.error('getAllContestantsAction error', error)
    return { ok: false, error: 'Failed to fetch contestants' }
  }
}

export async function getPlayerTeamsAction(playerId: number) {
  try {
    console.log('=== GET PLAYER TEAMS ACTION ===')
    console.log('Player ID:', playerId)
    
    const playerTeams = await getTeamsByPlayerId(playerId)
    console.log('Raw player teams:', playerTeams)
    
    const contestants = await getAllContestants()
    
    // Add contestant names to teams
    const teamsWithNames = playerTeams.map(team => {
      const contestant = contestants.find(c => c.id === team.contestantId)
      return {
        ...team,
        teamId: team.id,
        contestantName: contestant?.name || 'Unknown'
      }
    })
    
    console.log('Teams with names:', teamsWithNames)
    console.log('Number of teams found:', teamsWithNames.length)
    
    return { ok: true, teams: teamsWithNames }
  } catch (error) {
    console.error('getPlayerTeamsAction error', error)
    return { ok: false, error: 'Failed to fetch player teams' }
  }
}

export async function createTeamAction(formData: FormData) {
  const playerId = parseInt((formData.get('playerId') || '').toString())
  const contestantId = parseInt((formData.get('contestantId') || '').toString())
  
  if (!playerId || !contestantId) {
    return { ok: false, error: 'Player ID and Contestant ID are required' }
  }

  try {
    const team = await createTeam(playerId, contestantId)
    revalidatePath('/admin/teams')
    revalidatePath('/dashboard')
    revalidateTag('teams')
    return { ok: true, team }
  } catch (error) {
    console.error('createTeamAction error', error)
    return { ok: false, error: 'Failed to create team assignment' }
  }
}

export async function deleteTeamAction(formData: FormData) {
  const teamId = parseInt((formData.get('teamId') || '').toString())
  
  if (!teamId) {
    return { ok: false, error: 'Team ID is required' }
  }

  try {
    const result = await deleteTeam(teamId)
    revalidatePath('/admin/teams')
    revalidatePath('/dashboard')
    revalidateTag('teams')
    return { ok: true, result }
  } catch (error) {
    console.error('deleteTeamAction error', error)
    return { ok: false, error: 'Failed to delete team assignment' }
  }
}

export async function deletePlayerAction(formData: FormData) {
  const playerId = parseInt((formData.get('playerId') || '').toString())
  
  console.log('=== DELETE PLAYER ACTION ===')
  console.log('Player ID to delete:', playerId)
  console.log('Form data:', Object.fromEntries(formData.entries()))
  
  if (!playerId) {
    console.log('No player ID provided')
    return { ok: false, error: 'Player ID is required' }
  }

  try {
    console.log('Attempting to delete player with ID:', playerId)
    const result = await deletePlayer(playerId)
    console.log('Delete player result:', result)
    
    if (result) {
      console.log('Player deleted successfully, revalidating paths...')
      revalidatePath('/admin/teams')
      revalidatePath('/dashboard')
      revalidateTag('players')
      revalidateTag('teams')
      return { ok: true }
    } else {
      console.log('Player not found or deletion failed')
      return { ok: false, error: 'Player not found or deletion failed' }
    }
  } catch (error) {
    console.error('deletePlayerAction error', error)
    return { ok: false, error: 'Failed to delete player' }
  }
}