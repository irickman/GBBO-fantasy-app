import { NextResponse } from 'next/server'
import { getPlayerWeeklyBreakdown } from '@/lib/db/queries'

export async function GET(
  request: Request,
  { params }: { params: { playerId: string } }
) {
  try {
    const playerId = parseInt(params.playerId)
    if (isNaN(playerId)) {
      return NextResponse.json({ error: 'Invalid player ID' }, { status: 400 })
    }

    const breakdown = await getPlayerWeeklyBreakdown(playerId)
    return NextResponse.json({ breakdown })
  } catch (error) {
    console.error('Player breakdown API error', error)
    return NextResponse.json({ error: 'Failed to fetch player breakdown' }, { status: 500 })
  }
}
