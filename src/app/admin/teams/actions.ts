'use server'

import { revalidatePath } from 'next/cache'
import { createPlayer, getAllPlayers, getAllContestants, getAllTeams, getTeamsByPlayerId, deletePlayer, createTeam, deleteTeam } from '@/lib/db/queries'

export async function createPlayerAction(formData: FormData) {
  const name = (formData.get('name') || '').toString().trim()
  const teamName = (formData.get('teamName') || '').toString().trim()
  if (!name || !teamName) {
    return { ok: false, error: 'Name and team name are required' }
  }

  try {
    await createPlayer(name, teamName)
    revalidatePath('/admin/teams')
    return { ok: true }
  } catch (error) {
    console.error('createPlayerAction error', error)
    return { ok: false, error: 'Failed to create player' }
  }
}

export async function updatePlayerTeamAction(formData: FormData) {
  const playerId = parseInt((formData.get('playerId') || '').toString())
  const contestantIds = (formData.get('contestantIds') || '').toString()

  if (!playerId || !contestantIds) {
    return { ok: false, error: 'Player ID and contestant IDs are required' }
  }

  try {
    const selectedContestantIds = JSON.parse(contestantIds)
    
    if (selectedContestantIds.length !== 3) {
      return { ok: false, error: 'Exactly 3 contestants must be selected' }
    }

    // Delete existing team assignments for this player
    const existingTeams = await getTeamsByPlayerId(playerId)
    for (const team of existingTeams) {
      await deleteTeam(team.id)
    }

    // Create new team assignments
    for (const contestantId of selectedContestantIds) {
      await createTeam(playerId, contestantId)
    }

    revalidatePath('/admin/teams')
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
    const playerTeams = await getTeamsByPlayerId(playerId)
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
    
    return { ok: true, teams: teamsWithNames }
  } catch (error) {
    console.error('getPlayerTeamsAction error', error)
    return { ok: false, error: 'Failed to fetch player teams' }
  }
}

export async function deletePlayerAction(formData: FormData) {
  const playerId = parseInt((formData.get('playerId') || '').toString())
  
  if (!playerId) {
    return { ok: false, error: 'Player ID is required' }
  }

  try {
    await deletePlayer(playerId)
    revalidatePath('/admin/teams')
    revalidatePath('/dashboard')
    return { ok: true }
  } catch (error) {
    console.error('deletePlayerAction error', error)
    return { ok: false, error: 'Failed to delete player' }
  }
}