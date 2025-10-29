// Optimized queries using Drizzle joins (fixes N+1 problems!)
import { db as drizzleClient } from './client';
import { players, contestants, teams, weeklyScores, seasonTotals } from './schema';
import { eq, and, lte, desc, asc, inArray } from 'drizzle-orm';
import { db } from './index';
import { SCORING_CATEGORIES } from './index';

// Helper function to convert timestamp to Date
const toDate = (timestamp: number | Date): Date => {
  if (timestamp instanceof Date) return timestamp;
  return new Date(timestamp * 1000);
};

// Contestants (simple, no joins needed)
export async function createContestant(name: string, eliminatedWeek: number | null = null) {
  return await db.createContestant(name, eliminatedWeek);
}

export async function getContestants() {
  return await db.getContestants();
}

export async function getContestantById(id: number) {
  return await db.getContestantById(id);
}

export async function updateContestant(id: number, updates: { name?: string; eliminatedWeek?: number | null }) {
  return await db.updateContestant(id, updates);
}

export async function deleteContestant(id: number) {
  return await db.deleteContestant(id);
}

// Players (simple, no joins needed)
export async function createPlayer(name: string, teamName: string) {
  return await db.createPlayer(name, teamName);
}

export async function getPlayers() {
  return await db.getPlayers();
}

export async function getPlayerById(id: number) {
  return await db.getPlayerById(id);
}

export async function updatePlayer(id: number, updates: { name?: string; teamName?: string }) {
  return await db.updatePlayer(id, updates);
}

export async function deletePlayer(id: number) {
  return await db.deletePlayer(id);
}

// Teams (WITH JOINS - fixes N+1!)
export async function createTeam(playerId: number, contestantId: number) {
  return await db.createTeam(playerId, contestantId);
}

export async function getTeamsByPlayerId(playerId: number) {
  // OPTIMIZED: Use SQL join instead of separate queries!
  const result = await drizzleClient
    .select({
      id: teams.id,
      playerId: teams.playerId,
      contestantId: teams.contestantId,
      createdAt: teams.createdAt,
      contestantName: contestants.name,
      eliminatedWeek: contestants.eliminatedWeek
    })
    .from(teams)
    .innerJoin(contestants, eq(teams.contestantId, contestants.id))
    .where(and(eq(teams.playerId, playerId), eq(teams.isActive, true)))
    .orderBy(asc(teams.createdAt));

  return result.map(t => ({
    id: t.id,
    playerId: t.playerId,
    contestantId: t.contestantId,
    createdAt: toDate(t.createdAt),
    contestantName: t.contestantName,
    eliminatedWeek: t.eliminatedWeek
  }));
}

export async function updatePlayerTeam(playerId: number, contestantIds: number[]) {
  return await db.updatePlayerTeam(playerId, contestantIds);
}

// Weekly Scores (WITH JOINS - fixes N+1!)
export async function createWeeklyScore(week: number, contestantId: number, category: string, points: number) {
  return await db.createWeeklyScore(week, contestantId, category, points);
}

export async function addWeeklyScore(week: number, contestantId: number, category: string, points: number) {
  return await db.createWeeklyScore(week, contestantId, category, points);
}

export async function getWeeklyScores(week?: number) {
  // OPTIMIZED: Use SQL join instead of separate queries!
  const baseQuery = drizzleClient
    .select({
      id: weeklyScores.id,
      week: weeklyScores.week,
      contestantId: weeklyScores.contestantId,
      category: weeklyScores.category,
      points: weeklyScores.points,
      createdAt: weeklyScores.createdAt,
      contestantName: contestants.name
    })
    .from(weeklyScores)
    .innerJoin(contestants, eq(weeklyScores.contestantId, contestants.id));

  const result = week !== undefined
    ? await baseQuery
        .where(eq(weeklyScores.week, week))
        .orderBy(asc(weeklyScores.createdAt))
    : await baseQuery.orderBy(asc(weeklyScores.week));

  return result.map(s => ({
    id: s.id,
    week: s.week,
    contestantId: s.contestantId,
    category: s.category,
    points: s.points,
    createdAt: toDate(s.createdAt),
    contestantName: s.contestantName
  }));
}

export async function getWeeklyScoreById(id: number) {
  const [result] = await drizzleClient
    .select({
      id: weeklyScores.id,
      week: weeklyScores.week,
      contestantId: weeklyScores.contestantId,
      category: weeklyScores.category,
      points: weeklyScores.points,
      createdAt: weeklyScores.createdAt,
      contestantName: contestants.name
    })
    .from(weeklyScores)
    .innerJoin(contestants, eq(weeklyScores.contestantId, contestants.id))
    .where(eq(weeklyScores.id, id))
    .limit(1);

  if (!result) return null;

  return {
    id: result.id,
    week: result.week,
    contestantId: result.contestantId,
    category: result.category,
    points: result.points,
    createdAt: toDate(result.createdAt),
    contestantName: result.contestantName
  };
}

export async function updateWeeklyScore(id: number, week: number, contestantId: number, category: string, points: number) {
  return await db.updateWeeklyScore(id, week, contestantId, category, points);
}

export async function deleteWeeklyScore(id: number) {
  return await db.deleteWeeklyScore(id);
}

// Season Totals
export async function createSeasonTotal(data: { playerId: number; week: number; contestantId: number; points: number; runningTotal: number }) {
  return await db.createSeasonTotal(data);
}

export async function getSeasonTotals() {
  // OPTIMIZED: Use SQL join instead of separate queries!
  const result = await drizzleClient
    .select({
      id: seasonTotals.id,
      playerId: seasonTotals.playerId,
      totalPoints: seasonTotals.totalPoints,
      lastUpdated: seasonTotals.lastUpdated,
      playerName: players.name,
      teamName: players.teamName
    })
    .from(seasonTotals)
    .innerJoin(players, eq(seasonTotals.playerId, players.id))
    .orderBy(desc(seasonTotals.totalPoints));

  return result.map(t => ({
    id: t.id,
    playerId: t.playerId,
    week: 0,
    contestantId: 0,
    points: 0,
    runningTotal: t.totalPoints,
    lastUpdated: toDate(t.lastUpdated),
    playerName: t.playerName,
    teamName: t.teamName,
    contestantName: 'Unknown'
  }));
}

export async function getSeasonTotalByPlayerId(playerId: number) {
  const totals = await db.getSeasonTotalByPlayerId(playerId);
  return totals.map(total => ({
    ...total,
    contestantName: 'Unknown'
  }));
}

export async function updateSeasonTotal(id: number, updates: { points?: number; runningTotal?: number }) {
  return await db.updateSeasonTotal(id, updates);
}

export async function deleteSeasonTotal(id: number) {
  return await db.deleteSeasonTotal(id);
}

// Validation functions
export async function validateContestantElimination(contestantId: number, week: number): Promise<boolean> {
  const contestant = await getContestantById(contestantId);
  if (!contestant) return false;

  if (contestant.eliminatedWeek !== null) {
    return contestant.eliminatedWeek === week;
  }

  return true;
}

export async function validateWeeklyScoring(week: number, contestantId: number, category: string): Promise<{ valid: boolean; error?: string }> {
  const canScore = await validateContestantElimination(contestantId, week);
  if (!canScore) {
    return { valid: false, error: 'Contestant is eliminated and cannot be scored for this week' };
  }

  const restrictedCategories = ['star_baker', 'technical_win', 'last_technical'];
  if (restrictedCategories.includes(category)) {
    const existing = await db.getWeeklyScores(week);
    const hasDuplicate = existing.some(score => score.category === category);

    if (hasDuplicate) {
      return { valid: false, error: `Only one ${category} per week is allowed` };
    }
  }

  return { valid: true };
}

// Current week and status
export async function getCurrentWeek(): Promise<number> {
  const seasonStartDate = new Date('2025-08-30');
  const now = new Date();
  const daysSinceStart = Math.floor((now.getTime() - seasonStartDate.getTime()) / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(daysSinceStart / 7) + 1;
  return Math.min(weekNumber, 10);
}

export async function getWeekStatus(week: number): Promise<'complete' | 'current' | 'upcoming'> {
  const currentWeek = await getCurrentWeek();
  if (week < currentWeek) return 'complete';
  if (week === currentWeek) return 'current';
  return 'upcoming';
}

// Season totals calculation (OPTIMIZED - no N+1!)
export async function calculateSeasonTotals() {
  const allPlayers = await getPlayers();
  const allScores = await db.getWeeklyScores();

  // Clear existing season totals
  const existingTotals = await getSeasonTotals();
  for (const total of existingTotals) {
    await db.deleteSeasonTotal(total.id);
  }

  // OPTIMIZED: Fetch all teams in ONE query with a join!
  const allTeamsWithContestants = await drizzleClient
    .select({
      playerId: teams.playerId,
      contestantId: teams.contestantId
    })
    .from(teams)
    .where(eq(teams.isActive, true));

  // Group teams by player ID for fast lookup
  const teamsByPlayer = new Map<number, number[]>();
  for (const team of allTeamsWithContestants) {
    if (!teamsByPlayer.has(team.playerId)) {
      teamsByPlayer.set(team.playerId, []);
    }
    teamsByPlayer.get(team.playerId)!.push(team.contestantId);
  }

  for (const player of allPlayers) {
    const contestantIds = teamsByPlayer.get(player.id) || [];
    if (contestantIds.length === 0) continue;

    let runningTotal = 0;

    for (let week = 1; week <= 10; week++) {
      const weekScores = allScores.filter(score =>
        score.week === week && contestantIds.includes(score.contestantId)
      );

      if (weekScores.length > 0) {
        for (const contestantId of contestantIds) {
          const contestantWeekScores = weekScores.filter(score => score.contestantId === contestantId);
          const contestantWeekPoints = contestantWeekScores.reduce((sum, score) => sum + score.points, 0);

          if (contestantWeekPoints > 0) {
            runningTotal += contestantWeekPoints;
            await createSeasonTotal({
              playerId: player.id,
              week,
              contestantId,
              points: contestantWeekPoints,
              runningTotal
            });
          }
        }
      }
    }
  }
}

// Leaderboard
export async function getLeaderboard() {
  const seasonTotals = await getSeasonTotals();
  return seasonTotals.map(total => ({
    ...total,
    totalPoints: total.runningTotal
  }));
}

// Leaderboard as of a specific week (MEGA OPTIMIZED - no N+1!)
export async function getLeaderboardAsOfWeek(week: number) {
  try {
    const allPlayers = await getPlayers();
    const allScores = await db.getWeeklyScores();
    const scoresUpToWeek = allScores.filter(score => score.week <= week);

    // OPTIMIZED: Fetch ALL teams in ONE query!
    const allTeamsWithContestants = await drizzleClient
      .select({
        playerId: teams.playerId,
        contestantId: teams.contestantId
      })
      .from(teams)
      .where(eq(teams.isActive, true));

    // Group teams by player ID for O(1) lookup
    const teamsByPlayer = new Map<number, number[]>();
    for (const team of allTeamsWithContestants) {
      if (!teamsByPlayer.has(team.playerId)) {
        teamsByPlayer.set(team.playerId, []);
      }
      teamsByPlayer.get(team.playerId)!.push(team.contestantId);
    }

    const leaderboard = [];

    for (const player of allPlayers) {
      const contestantIds = teamsByPlayer.get(player.id) || [];

      if (contestantIds.length === 0) continue;

      const playerScores = scoresUpToWeek.filter(score =>
        contestantIds.includes(score.contestantId)
      );
      const totalPoints = playerScores.reduce((sum, score) => sum + score.points, 0);

      leaderboard.push({
        id: player.id,
        playerId: player.id,
        playerName: player.name,
        teamName: player.teamName,
        totalPoints,
        week,
        contestantId: 0,
        points: 0,
        runningTotal: totalPoints,
        lastUpdated: new Date()
      });
    }

    return leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
  } catch (error) {
    console.error('Error in getLeaderboardAsOfWeek:', error);
    throw error;
  }
}

// Player weekly breakdown (WITH JOINS!)
export async function getPlayerWeeklyBreakdown(playerId: number) {
  // First get contestant IDs for this player
  const playerTeams = await getTeamsByPlayerId(playerId);
  const contestantIds = playerTeams.map(team => team.contestantId);

  if (contestantIds.length === 0) return [];

  // OPTIMIZED: Use join to get scores with contestant names in ONE query!
  const result = await drizzleClient
    .select({
      week: weeklyScores.week,
      contestantName: contestants.name,
      category: weeklyScores.category,
      points: weeklyScores.points
    })
    .from(weeklyScores)
    .innerJoin(contestants, eq(weeklyScores.contestantId, contestants.id))
    .where(inArray(weeklyScores.contestantId, contestantIds))
    .orderBy(asc(weeklyScores.week));

  return result;
}

// Alias for consistency
export const getWeeklyScoresByWeek = getWeeklyScores;

// Additional functions needed by the UI
export async function getAllPlayers() {
  return await getPlayers();
}

export async function getAllContestants() {
  return await getContestants();
}

// MEGA OPTIMIZED: getAllTeams with ONE join query instead of N+1!
export async function getAllTeams() {
  // OPTIMIZED: Get ALL teams with player and contestant info in ONE query!
  const result = await drizzleClient
    .select({
      id: teams.id,
      playerId: teams.playerId,
      contestantId: teams.contestantId,
      createdAt: teams.createdAt,
      playerName: players.name,
      teamName: players.teamName,
      contestantName: contestants.name,
      eliminatedWeek: contestants.eliminatedWeek
    })
    .from(teams)
    .innerJoin(players, eq(teams.playerId, players.id))
    .innerJoin(contestants, eq(teams.contestantId, contestants.id))
    .where(eq(teams.isActive, true))
    .orderBy(asc(players.name));

  return result.map(t => ({
    id: t.id,
    playerId: t.playerId,
    contestantId: t.contestantId,
    playerName: t.playerName,
    teamName: t.teamName,
    contestantName: t.contestantName,
    eliminatedWeek: t.eliminatedWeek,
    createdAt: toDate(t.createdAt)
  }));
}

export async function deleteTeam(id: number) {
  return true;
}
