'use server'

import { revalidatePath } from 'next/cache'
import { addWeeklyScore, getWeeklyScores, validateWeeklyScoring, getAllContestants, updateWeeklyScore, deleteWeeklyScore, getWeeklyScoreById, validateContestantElimination, calculateSeasonTotals, getAllPlayers } from '@/lib/db/queries'
import { SCORING_CATEGORIES } from '@/lib/db'

export async function addScoreAction(formData: FormData) {
  const week = parseInt((formData.get('week') || '').toString())
  const contestantId = parseInt((formData.get('contestantId') || '').toString())
  const category = (formData.get('category') || '').toString() as keyof typeof SCORING_CATEGORIES

  if (!week || !contestantId || !category || !SCORING_CATEGORIES[category]) {
    return { ok: false, error: 'Invalid week, contestant, or category' }
  }

  try {
    // Validate that this category hasn't been scored for this week yet
    const canScore = await validateWeeklyScoring(week, contestantId, category)
    if (!canScore) {
      return { ok: false, error: `Category "${category}" already has a winner for week ${week}` }
    }

    // Validate that contestant is not eliminated before this week
    const canScoreContestant = await validateContestantElimination(contestantId, week)
    if (!canScoreContestant) {
      return { ok: false, error: 'Contestant is eliminated and cannot be scored for this week' }
    }

    const points = SCORING_CATEGORIES[category]
    await addWeeklyScore(week, contestantId, category, points)
    
    // Recalculate season totals for all players
    const players = await getAllPlayers()
    for (const player of players) {
      await calculateSeasonTotals(player.id)
    }
    
    revalidatePath('/admin/scoring')
    revalidatePath('/dashboard')
    return { ok: true }
  } catch (error) {
    console.error('addScoreAction error', error)
    return { ok: false, error: 'Failed to add score' }
  }
}

export async function getWeeklyScoresAction(week: number) {
  try {
    const scores = await getWeeklyScores(week)
    return { ok: true, scores }
  } catch (error) {
    console.error('getWeeklyScoresAction error', error)
    return { ok: false, error: 'Failed to get weekly scores' }
  }
}

export async function getContestantsAction() {
  try {
    const contestants = await getAllContestants()
    return { ok: true, contestants }
  } catch (error) {
    console.error('getContestantsAction error', error)
    return { ok: false, error: 'Failed to get contestants' }
  }
}

export async function updateScoreAction(formData: FormData) {
  const scoreId = parseInt((formData.get('scoreId') || '').toString())
  const contestantId = parseInt((formData.get('contestantId') || '').toString())
  const category = (formData.get('category') || '').toString() as keyof typeof SCORING_CATEGORIES

  if (!scoreId || !contestantId || !category || !SCORING_CATEGORIES[category]) {
    return { ok: false, error: 'Invalid score ID, contestant, or category' }
  }

  try {
    // Get the existing score to check the week
    const existingScore = await getWeeklyScoreById(scoreId)
    if (!existingScore) {
      return { ok: false, error: 'Score not found' }
    }

    const week = existingScore.week

    // Validate that this category hasn't been scored for this week by another contestant
    const canScore = await validateWeeklyScoring(week, contestantId, category)
    if (!canScore) {
      // Check if the existing score is the same contestant
      const currentScores = await getWeeklyScores(week)
      const existingCategoryScore = currentScores.find(s => s.category === category)
      if (existingCategoryScore && existingCategoryScore.contestantId !== contestantId) {
        return { ok: false, error: `Category "${category}" already has a winner for week ${week}` }
      }
    }

    // Validate that contestant is not eliminated before this week
    const canScoreContestant = await validateContestantElimination(contestantId, week)
    if (!canScoreContestant) {
      return { ok: false, error: 'Contestant is eliminated and cannot be scored for this week' }
    }

    const points = SCORING_CATEGORIES[category]
    await updateWeeklyScore(scoreId, week, contestantId, category, points)
    
    // Recalculate season totals for all players
    const players = await getAllPlayers()
    for (const player of players) {
      await calculateSeasonTotals(player.id)
    }
    
    revalidatePath('/admin/scoring')
    revalidatePath('/dashboard')
    return { ok: true }
  } catch (error) {
    console.error('updateScoreAction error', error)
    return { ok: false, error: 'Failed to update score' }
  }
}

export async function deleteScoreAction(formData: FormData) {
  const scoreId = parseInt((formData.get('scoreId') || '').toString())
  
  if (!scoreId) {
    return { ok: false, error: 'Score ID is required' }
  }

  try {
    await deleteWeeklyScore(scoreId)
    
    // Recalculate season totals for all players
    const players = await getAllPlayers()
    for (const player of players) {
      await calculateSeasonTotals(player.id)
    }
    
    revalidatePath('/admin/scoring')
    revalidatePath('/dashboard')
    return { ok: true }
  } catch (error) {
    console.error('deleteScoreAction error', error)
    return { ok: false, error: 'Failed to delete score' }
  }
}

