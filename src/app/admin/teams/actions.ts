'use server'

import { revalidatePath } from 'next/cache'
import { createPlayer, assignContestantToPlayer, getAllPlayers, getAllContestants, getAllTeams } from '@/lib/db/queries'

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

export async function assignContestantsAction(formData: FormData) {
  const playerId = parseInt((formData.get('playerId') || '').toString())
  const contestantIds = (formData.get('contestantIds') || '').toString().split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))

  if (!playerId || contestantIds.length !== 3) {
    return { ok: false, error: 'Must select exactly 3 contestants' }
  }

  try {
    // First, remove existing assignments for this player
    const existingTeams = await getAllTeams()
    const playerTeams = existingTeams.filter(t => t.playerId === playerId)
    
    // Clear existing assignments (we'll need to add a delete function)
    // For now, we'll just add new ones and handle cleanup later
    
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
