'use server'

import { revalidatePath } from 'next/cache'
import { createPlayer, assignContestantToPlayer, getAllPlayers, getAllContestants, getAllTeams, getPlayerTeams } from '@/lib/db/queries'
import { db } from '@/lib/db'
import { teams } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

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

    // Check if any contestant is already assigned to another player
    for (const contestantId of selectedContestantIds) {
      const existingAssignment = await db.select()
        .from(teams)
        .where(eq(teams.contestantId, contestantId))
      
      if (existingAssignment.length > 0 && existingAssignment[0].playerId !== playerId) {
        return { ok: false, error: `Contestant is already assigned to another player` }
      }
    }

    // Delete existing team assignments for this player
    await db.delete(teams).where(eq(teams.playerId, playerId))

    // Insert new team assignments
    const teamAssignments = selectedContestantIds.map((contestantId: number) => ({
      playerId,
      contestantId
    }))

    await db.insert(teams).values(teamAssignments)

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
    await db.delete(teams).where(eq(teams.playerId, playerId))
    
    // Assign the 3 contestants
    for (const contestantId of contestantIds) {
      await assignContestantToPlayer(playerId, contestantId)
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
    const playerTeams = await getPlayerTeams(playerId)
    return { ok: true, teams: playerTeams }
  } catch (error) {
    console.error('getPlayerTeamsAction error', error)
    return { ok: false, error: 'Failed to fetch player teams' }
  }
}
