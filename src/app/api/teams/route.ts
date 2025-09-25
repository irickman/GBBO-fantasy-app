import { NextResponse } from 'next/server'
import { getPlayers, getContestants } from '@/lib/db/queries'
import { db } from '@/lib/db'
import { teams, players, contestants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    // Get all teams with player and contestant information
    const teamsWithDetails = await db.select({
      teamId: teams.id,
      playerId: teams.playerId,
      playerName: players.name,
      teamName: players.teamName,
      contestantId: teams.contestantId,
      contestantName: contestants.name,
      eliminatedWeek: contestants.eliminatedWeek,
    })
    .from(teams)
    .innerJoin(players, eq(teams.playerId, players.id))
    .innerJoin(contestants, eq(teams.contestantId, contestants.id))
    .orderBy(players.name, contestants.name)
    
    return NextResponse.json({ teams: teamsWithDetails })
  } catch (error) {
    console.error('Teams API error:', error)
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
  }
}

