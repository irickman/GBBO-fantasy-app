import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const maxDuration = 60

// Complete dataset
const CONTESTANTS = [
  { name: 'Aaron', eliminatedWeek: null },
  { name: 'Iain', eliminatedWeek: null },
  { name: 'Jasmine', eliminatedWeek: null },
  { name: 'Jessika', eliminatedWeek: null },
  { name: 'Lesley', eliminatedWeek: null },
  { name: 'Nadia', eliminatedWeek: null },
  { name: 'Nataliia', eliminatedWeek: null },
  { name: 'Pui Man', eliminatedWeek: 3 },
  { name: 'Toby', eliminatedWeek: null },
  { name: 'Tom', eliminatedWeek: null },
  { name: 'Hassan', eliminatedWeek: 1 },
  { name: 'Leighton', eliminatedWeek: 2 }
]

const PLAYERS = [
  { name: 'Aleta', teamName: 'The Baking Beauties', contestants: ['Jessika', 'Aaron', 'Pui Man'] },
  { name: 'Alex', teamName: 'The Flour Power', contestants: ['Jessika', 'Lesley', 'Toby'] },
  { name: 'Anna', teamName: 'The Sweet Success', contestants: ['Jasmine', 'Iain', 'Toby'] },
  { name: 'Annie', teamName: 'The Rising Dough', contestants: ['Iain', 'Nadia', 'Pui Man'] },
  { name: 'Ben', teamName: 'The Knead for Speed', contestants: ['Nataliia', 'Iain', 'Leighton'] },
  { name: 'Bob', teamName: 'The Bread Winners', contestants: ['Tom', 'Nataliia', 'Pui Man'] },
  { name: 'Christine', teamName: 'The Cake Crusaders', contestants: ['Tom', 'Nataliia', 'Toby'] },
  { name: 'Dani', teamName: 'The Pastry Pioneers', contestants: ['Tom', 'Iain', 'Nadia'] },
  { name: 'Emma', teamName: 'The Dough-lightful', contestants: ['Nataliia', 'Nadia', 'Leighton'] },
  { name: 'Ira', teamName: 'The Bake Believe', contestants: ['Jessika', 'Jasmine', 'Lesley'] },
  { name: 'Jake', teamName: 'The Flourishing Bakers', contestants: ['Jessika', 'Jasmine', 'Leighton'] },
  { name: 'Jeremy', teamName: 'The Sweet Dreams', contestants: ['Jasmine', 'Lesley', 'Leighton'] },
  { name: 'Maria', teamName: 'The Rolling Pins', contestants: ['Nataliia', 'Aaron', 'Pui Man'] },
  { name: 'Ruby', teamName: 'The Batter Up', contestants: ['Tom', 'Aaron', 'Toby'] },
  { name: 'Whiting', teamName: 'The Knead to Know', contestants: ['Nadia', 'Aaron', 'Lesley'] }
]

export async function POST(request: Request) {
  try {
    const { step } = await request.json()
    
    // Step 1: Clear all data
    if (step === 'clear') {
      console.log('Step 1: Clearing all data...')
      await db.clearAllData()
      return NextResponse.json({
        success: true,
        step: 'clear',
        message: 'Database cleared',
        nextStep: 'contestants'
      })
    }
    
    // Step 2: Create contestants
    if (step === 'contestants') {
      console.log('Step 2: Creating contestants...')
      const contestantMap = new Map<string, number>()
      
      for (const c of CONTESTANTS) {
        const contestant = await db.createContestant(c.name, c.eliminatedWeek)
        contestantMap.set(c.name, contestant.id)
      }
      
      return NextResponse.json({
        success: true,
        step: 'contestants',
        message: `Created ${CONTESTANTS.length} contestants`,
        contestants: CONTESTANTS.length,
        nextStep: 'players-1'
      })
    }
    
    // Step 3a: Create first 5 players
    if (step === 'players-1') {
      console.log('Step 3a: Creating players 1-5...')
      const batch = PLAYERS.slice(0, 5)
      await createPlayerBatch(batch)
      
      return NextResponse.json({
        success: true,
        step: 'players-1',
        message: `Created ${batch.length} players`,
        players: batch.map(p => p.name),
        nextStep: 'players-2'
      })
    }
    
    // Step 3b: Create next 5 players
    if (step === 'players-2') {
      console.log('Step 3b: Creating players 6-10...')
      const batch = PLAYERS.slice(5, 10)
      await createPlayerBatch(batch)
      
      return NextResponse.json({
        success: true,
        step: 'players-2',
        message: `Created ${batch.length} players`,
        players: batch.map(p => p.name),
        nextStep: 'players-3'
      })
    }
    
    // Step 3c: Create last 5 players
    if (step === 'players-3') {
      console.log('Step 3c: Creating players 11-15...')
      const batch = PLAYERS.slice(10, 15)
      await createPlayerBatch(batch)
      
      return NextResponse.json({
        success: true,
        step: 'players-3',
        message: `Created ${batch.length} players`,
        players: batch.map(p => p.name),
        nextStep: 'complete'
      })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid step. Use: clear, contestants, players-1, players-2, players-3'
    }, { status: 400 })
    
  } catch (error) {
    console.error('Batch restore error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function createPlayerBatch(players: typeof PLAYERS) {
  // Get all contestants for mapping
  const allContestants = await db.getContestants()
  const contestantMap = new Map<string, number>()
  for (const c of allContestants) {
    contestantMap.set(c.name, c.id)
  }
  
  for (const p of players) {
    const player = await db.createPlayer(p.name, p.teamName)
    const contestantIds = p.contestants
      .map(name => contestantMap.get(name)!)
      .filter(Boolean)
    
    if (contestantIds.length === 3) {
      await db.updatePlayerTeam(player.id, contestantIds)
    }
  }
}

