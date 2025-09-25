import { db } from './index'

export async function seedDatabase() {
  try {
    // Clear existing data first
    await db.clearAllData()

    // 1. Create Contestants with elimination status
    const contestantsData = [
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
      { name: 'Leighton', eliminatedWeek: 2 },
    ]

    const contestantMap = new Map<string, number>()
    for (const c of contestantsData) {
      const contestant = await db.createContestant(c.name, c.eliminatedWeek)
      contestantMap.set(c.name, contestant.id)
    }

    // 2. Create Players and their Teams
    const playersData = [
      { name: 'Aleta', teamName: 'Aleta\'s Aces', contestants: ['Jessika', 'Aaron', 'Pui Man'] },
      { name: 'Alex', teamName: 'Alex\'s Alchemists', contestants: ['Jessika', 'Lesley', 'Toby'] },
      { name: 'Anna', teamName: 'Anna\'s Artisans', contestants: ['Jasmine', 'Iain', 'Toby'] },
      { name: 'Annie', teamName: 'Annie\'s Angels', contestants: ['Iain', 'Nadia', 'Pui Man'] },
      { name: 'Ben', teamName: 'Ben\'s Bakes', contestants: ['Nataliia', 'Iain', 'Leighton'] },
      { name: 'Bob', teamName: 'Bob\'s Best', contestants: ['Tom', 'Nataliia', 'Pui Man'] },
      { name: 'Christine', teamName: 'Christine\'s Creations', contestants: ['Tom', 'Nataliia', 'Toby'] },
      { name: 'Dani', teamName: 'Dani\'s Delights', contestants: ['Tom', 'Iain', 'Nadia'] },
      { name: 'Emma', teamName: 'Emma\'s Edibles', contestants: ['Nataliia', 'Nadia', 'Leighton'] },
      { name: 'Ira', teamName: 'Ira\'s Icing', contestants: ['Jessika', 'Jasmine', 'Lesley'] },
      { name: 'Jake', teamName: 'Jake\'s Jellies', contestants: ['Jessika', 'Jasmine', 'Leighton'] },
      { name: 'Jeremy', teamName: 'Jeremy\'s Jewels', contestants: ['Jasmine', 'Lesley', 'Leighton'] },
      { name: 'Maria', teamName: 'Maria\'s Marvels', contestants: ['Nataliia', 'Aaron', 'Pui Man'] },
      { name: 'Ruby', teamName: 'Ruby\'s Roulades', contestants: ['Tom', 'Aaron', 'Toby'] },
      { name: 'Whiting', teamName: 'Whiting\'s Wonders', contestants: ['Nadia', 'Aaron', 'Lesley'] },
    ]

    for (const p of playersData) {
      const newPlayer = await db.createPlayer(p.name, p.teamName)
      const contestantIds = p.contestants.map(name => contestantMap.get(name)).filter(Boolean) as number[]
      if (newPlayer && newPlayer.id && contestantIds.length === 3) {
        await db.updatePlayerTeam(newPlayer.id, contestantIds)
      }
    }

    return {
      success: true,
      message: 'Database seeded with all contestants, players, and teams',
      players: playersData.length,
      contestants: contestantsData.length,
      teams: playersData.length * 3 // 3 contestants per player
    }
  } catch (error) {
    console.error('Seeding error:', error)
    throw error
  }
}

export async function clearAllData() {
  try {
    // Clear all data using the blob storage
    await db.clearAllData()

    return {
      success: true,
      message: 'All data cleared successfully'
    }
  } catch (error) {
    console.error('Clear data error:', error)
    throw error
  }
}