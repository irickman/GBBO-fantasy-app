'use server'

import { revalidatePath } from 'next/cache'
import { 
  getSeasonTotals,
  getSeasonTotalByPlayerId,
  updateSeasonTotal,
  calculateSeasonTotals,
  createSeasonTotal
} from '@/lib/db/queries'

export async function getAllSeasonTotalsAction() {
  try {
    const totals = await getSeasonTotals()
    return { ok: true, totals }
  } catch (error) {
    console.error('getAllSeasonTotalsAction error', error)
    return { ok: false, error: 'Failed to fetch season totals' }
  }
}

export async function getSeasonTotalsByPlayerAction(playerId: number) {
  try {
    const totals = await getSeasonTotalByPlayerId(playerId)
    return { ok: true, totals }
  } catch (error) {
    console.error('getSeasonTotalsByPlayerAction error', error)
    return { ok: false, error: 'Failed to fetch player season totals' }
  }
}

export async function updateSeasonTotalAction(formData: FormData) {
  const id = parseInt((formData.get('id') || '').toString())
  const points = parseFloat((formData.get('points') || '').toString())
  const runningTotal = parseFloat((formData.get('runningTotal') || '').toString())
  
  if (!id || isNaN(points)) {
    return { ok: false, error: 'Season total ID and points are required' }
  }

  try {
    const updates: { points?: number; runningTotal?: number } = { points }
    if (!isNaN(runningTotal)) {
      updates.runningTotal = runningTotal
    }

    const total = await updateSeasonTotal(id, updates)
    if (!total) {
      return { ok: false, error: 'Season total not found' }
    }

    revalidatePath('/dashboard')
    revalidatePath('/leaderboard')
    return { ok: true, total }
  } catch (error) {
    console.error('updateSeasonTotalAction error', error)
    return { ok: false, error: 'Failed to update season total' }
  }
}

export async function createSeasonTotalAction(formData: FormData) {
  const playerId = parseInt((formData.get('playerId') || '').toString())
  const week = parseInt((formData.get('week') || '').toString())
  const contestantId = parseInt((formData.get('contestantId') || '').toString())
  const points = parseFloat((formData.get('points') || '').toString())
  const runningTotal = parseFloat((formData.get('runningTotal') || '').toString())
  
  if (!playerId || !week || !contestantId || isNaN(points) || isNaN(runningTotal)) {
    return { ok: false, error: 'Player ID, week, contestant ID, points, and running total are required' }
  }

  try {
    const total = await createSeasonTotal({
      playerId,
      week,
      contestantId,
      points,
      runningTotal
    })

    revalidatePath('/dashboard')
    revalidatePath('/leaderboard')
    return { ok: true, total }
  } catch (error) {
    console.error('createSeasonTotalAction error', error)
    return { ok: false, error: 'Failed to create season total' }
  }
}

export async function recalculateSeasonTotalsAction() {
  try {
    const totals = await calculateSeasonTotals()
    
    revalidatePath('/dashboard')
    revalidatePath('/leaderboard')
    revalidatePath('/admin/scoring')
    return { ok: true, totals }
  } catch (error) {
    console.error('recalculateSeasonTotalsAction error', error)
    return { ok: false, error: 'Failed to recalculate season totals' }
  }
}
