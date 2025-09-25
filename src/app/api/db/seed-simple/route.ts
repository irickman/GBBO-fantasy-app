import { NextResponse } from 'next/server'
import { db } from '@/lib/db/index'

export async function POST() {
  try {
    console.log('Starting simple seed...')
    
    // Clear existing data first
    await db.clearAllData()
    console.log('Data cleared')

    // Create contestants only
    const contestantsData = [
      { name: 'Aaron', eliminatedWeek: null },
      { name: 'Hassan', eliminatedWeek: 1 },
      { name: 'Iain', eliminatedWeek: null },
      { name: 'Jasmine', eliminatedWeek: null },
      { name: 'Jessika', eliminatedWeek: null },
      { name: 'Leighton', eliminatedWeek: 2 },
      { name: 'Lesley', eliminatedWeek: null },
      { name: 'Nadia', eliminatedWeek: null },
      { name: 'Nataliia', eliminatedWeek: null },
      { name: 'Pui Man', eliminatedWeek: 3 },
      { name: 'Toby', eliminatedWeek: null },
      { name: 'Tom', eliminatedWeek: null },
    ]

    console.log('Creating contestants...')
    const createdContestants = []
    for (const c of contestantsData) {
      const contestant = await db.createContestant(c.name, c.eliminatedWeek)
      createdContestants.push(contestant)
      console.log(`Created contestant: ${c.name}`)
    }

    console.log('Simple seed completed successfully')
    return NextResponse.json({ 
      success: true, 
      message: 'Simple database seeded with contestants',
      contestants: createdContestants.length
    })
  } catch (error) {
    console.error('Simple seeding error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
