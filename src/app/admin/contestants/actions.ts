'use server'

import { revalidatePath } from 'next/cache'
import { 
  createContestant, 
  getAllContestants, 
  updateContestant,
  deleteContestant 
} from '@/lib/db/queries'

export async function createContestantAction(formData: FormData) {
  const name = (formData.get('name') || '').toString().trim()
  const eliminatedWeek = formData.get('eliminatedWeek')?.toString()
  
  if (!name) {
    return { ok: false, error: 'Contestant name is required' }
  }

  try {
    const contestant = await createContestant(
      name, 
      eliminatedWeek ? parseInt(eliminatedWeek) : undefined
    )
    revalidatePath('/admin/contestants')
    revalidatePath('/admin/teams')
    return { ok: true, contestant }
  } catch (error) {
    console.error('createContestantAction error', error)
    return { ok: false, error: 'Failed to create contestant' }
  }
}

export async function updateContestantAction(formData: FormData) {
  const id = parseInt((formData.get('id') || '').toString())
  const name = (formData.get('name') || '').toString().trim()
  const eliminatedWeek = formData.get('eliminatedWeek')?.toString()
  
  if (!id || !name) {
    return { ok: false, error: 'Contestant ID and name are required' }
  }

  try {
    // Update the contestant name and elimination status
    const contestant = await updateContestant(id, {
      name,
      eliminatedWeek: eliminatedWeek ? parseInt(eliminatedWeek) : null
    })
    
    revalidatePath('/admin/contestants')
    revalidatePath('/admin/teams')
    return { ok: true, contestant }
  } catch (error) {
    console.error('updateContestantAction error', error)
    return { ok: false, error: 'Failed to update contestant' }
  }
}

export async function deleteContestantAction(formData: FormData) {
  const id = parseInt((formData.get('id') || '').toString())
  
  if (!id) {
    return { ok: false, error: 'Contestant ID is required' }
  }

  try {
    await deleteContestant(id)
    revalidatePath('/admin/contestants')
    revalidatePath('/admin/teams')
    return { ok: true }
  } catch (error) {
    console.error('deleteContestantAction error', error)
    return { ok: false, error: 'Failed to delete contestant' }
  }
}

export async function getAllContestantsAction() {
  try {
    const contestants = await getAllContestants()
    return { ok: true, contestants }
  } catch (error) {
    console.error('getAllContestantsAction error', error)
    return { ok: false, error: 'Failed to fetch contestants' }
  }
}
