import { db } from '../src/lib/db/index'
import { players, contestants, teams } from '../src/lib/db/schema'
import { eq } from 'drizzle-orm'

// Team assignments from the user
const teamAssignments = [
  { player: 'Aleta', contestants: ['Jessika', 'Aaron', 'Pui Man'] },
  { player: 'Alex', contestants: ['Jessika', 'Lesley', 'Toby'] },
  { player: 'Anna', contestants: ['Jasmine', 'Iain', 'Toby'] },
  { player: 'Annie', contestants: ['Iain', 'Nadia', 'Pui Man'] },
  { player: 'Ben', contestants: ['Nataliia', 'Iain', 'Leighton'] },
  { player: 'Bob', contestants: ['Tom', 'Nataliia', 'Pui Man'] },
  { player: 'Christine', contestants: ['Tom', 'Nataliia', 'Toby'] },
  { player: 'Dani', contestants: ['Tom', 'Iain', 'Nadia'] },
  { player: 'Emma', contestants: ['Nataliia', 'Nadia', 'Leighton'] },
  { player: 'Ira', contestants: ['Jessika', 'Jasmine', 'Lesley'] },
  { player: 'Jake', contestants: ['Jessika', 'Jasmine', 'Leighton'] },
  { player: 'Jeremy', contestants: ['Jasmine', 'Lesley', 'Leighton'] },
  { player: 'Maria', contestants: ['Nataliia', 'Aaron', 'Pui Man'] },
  { player: 'Ruby', contestants: ['Tom', 'Aaron', 'Toby'] },
  { player: 'Whiting', contestants: ['Nadia', 'Aaron', 'Lesley'] },
]

async function assignTeams() {
  try {
    console.log('Starting team assignment...')

    // Clear existing team assignments
    await db.delete(teams)
    console.log('Cleared existing team assignments')

    // Get all players and contestants
    const allPlayers = await db.select().from(players)
    const allContestants = await db.select().from(contestants)

    console.log(`Found ${allPlayers.length} players and ${allContestants.length} contestants`)

    // Create lookup maps
    const playerMap = new Map(allPlayers.map(p => [p.name, p.id]))
    const contestantMap = new Map(allContestants.map(c => [c.name, c.id]))

    // Process each team assignment
    const newAssignments = []
    let successCount = 0
    let errorCount = 0

    for (const assignment of teamAssignments) {
      const playerId = playerMap.get(assignment.player)
      if (!playerId) {
        console.error(`Player not found: ${assignment.player}`)
        errorCount++
        continue
      }

      for (const contestantName of assignment.contestants) {
        const contestantId = contestantMap.get(contestantName)
        if (!contestantId) {
          console.error(`Contestant not found: ${contestantName}`)
          errorCount++
          continue
        }

        newAssignments.push({
          playerId,
          contestantId
        })
        successCount++
      }
    }

    // Insert new assignments
    if (newAssignments.length > 0) {
      await db.insert(teams).values(newAssignments)
      console.log(`Successfully assigned ${successCount} contestants to teams`)
    }

    if (errorCount > 0) {
      console.log(`Encountered ${errorCount} errors during assignment`)
    }

    // Verify assignments
    const finalTeams = await db.select({
      playerName: players.name,
      teamName: players.teamName,
      contestantName: contestants.name
    })
      .from(teams)
      .innerJoin(players, eq(teams.playerId, players.id))
      .innerJoin(contestants, eq(teams.contestantId, contestants.id))
      .orderBy(players.name, contestants.name)

    console.log('\nFinal team assignments:')
    const groupedTeams = finalTeams.reduce((acc, team) => {
      if (!acc[team.playerName]) {
        acc[team.playerName] = []
      }
      acc[team.playerName].push(team.contestantName)
      return acc
    }, {} as Record<string, string[]>)

    for (const [player, contestants] of Object.entries(groupedTeams)) {
      console.log(`${player}: ${contestants.join(', ')}`)
    }

    console.log('\nTeam assignment completed successfully!')

  } catch (error) {
    console.error('Error assigning teams:', error)
    throw error
  }
}

assignTeams()
  .then(() => {
    console.log('Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
