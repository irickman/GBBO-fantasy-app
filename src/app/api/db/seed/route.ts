import { NextResponse } from 'next/server'
import { seedDatabase } from '@/lib/db/seed'

export async function POST() {
  try {
    const result = await seedDatabase()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Database seeding error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to seed database' },
      { status: 500 }
    )
  }
}

