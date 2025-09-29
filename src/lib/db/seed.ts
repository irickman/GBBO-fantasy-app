import { db } from './index'

export async function seedDatabase() {
  try {
    // Clear existing data first
    await db.clearAllData()

    // 1. Create Contestants with elimination status
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

    const contestantMap = new Map<string, number>()
    for (const c of contestantsData) {
      const contestant = await db.createContestant(c.name, c.eliminatedWeek)
      contestantMap.set(c.name, contestant.id)
    }

    // 2. Create Players and their Teams
    const playersData = [
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
      { name: 'Whiting', teamName: 'The Knead to Know', contestants: ['Nadia', 'Aaron', 'Lesley'] },
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