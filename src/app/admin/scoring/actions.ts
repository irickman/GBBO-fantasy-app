'use server'

import { revalidatePath } from 'next/cache'
import { addWeeklyScore, getWeeklyScores, validateWeeklyScoring, getAllContestants } from '@/lib/db/queries'
import { SCORING_CATEGORIES } from '@/lib/db/schema'

export async function addScoreAction(formData: FormData) {
  const week = parseInt((formData.get('week') || '').toString())
  const contestantId = parseInt((formData.get('contestantId') || '').toString())
  const category = (formData.get('category') || '').toString() as keyof typeof SCORING_CATEGORIES

  if (!week || !contestantId || !category || !SCORING_CATEGORIES[category]) {
    return { ok: false, error: 'Invalid week, contestant, or category' }
  }

  try {
    // Validate that this category hasn't been scored for this week yet
    const canScore = await validateWeeklyScoring(week, category)
    if (!canScore) {
      return { ok: false, error: `Category "${category}" already has a winner for week ${week}` }
    }

    await addWeeklyScore(week, contestantId, category)
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
