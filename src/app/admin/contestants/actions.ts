'use server'

import { revalidatePath } from 'next/cache'
import { createContestant } from '@/lib/db/queries'

export async function createContestantAction(formData: FormData) {
  const name = (formData.get('name') || '').toString().trim()
  if (!name) {
    return { ok: false, error: 'Name is required' }
  }

  try {
    await createContestant(name)
    revalidatePath('/admin/contestants')
    return { ok: true }
  } catch (error) {
    console.error('createContestantAction error', error)
    return { ok: false, error: 'Failed to create contestant' }
  }
}
