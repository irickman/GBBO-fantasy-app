import { NextResponse } from 'next/server'
import { getWeeklyScores } from '@/lib/db/queries'

export async function GET(
  request: Request,
  { params }: { params: { week: string } }
) {
  try {
    const week = parseInt(params.week)
    if (isNaN(week) || week < 1 || week > 10) {
      return NextResponse.json({ error: 'Invalid week number' }, { status: 400 })
    }

    const scores = await getWeeklyScores(week)
    return NextResponse.json({ scores })
  } catch (error) {
    console.error('Weekly scores API error', error)
    return NextResponse.json({ error: 'Failed to fetch weekly scores' }, { status: 500 })
  }
}

