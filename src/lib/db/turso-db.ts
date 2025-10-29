// Turso database implementation with Drizzle ORM
import { db } from './client';
import { players, contestants, teams, weeklyScores, seasonTotals } from './schema';
import { eq, and, desc, asc } from 'drizzle-orm';

// Type definitions matching the interface
interface Player {
  id: number;
  name: string;
  teamName: string;
  createdAt: Date;
}

interface Contestant {
  id: number;
  name: string;
  eliminatedWeek: number | null;
  createdAt: Date;
}

interface Team {
  id: number;
  playerId: number;
  contestantId: number;
  createdAt: Date;
}

interface WeeklyScore {
  id: number;
  week: number;
  contestantId: number;
  category: string;
  points: number;
  createdAt: Date;
}

interface SeasonTotal {
  id: number;
  playerId: number;
  week: number;
  contestantId: number;
  points: number;
  runningTotal: number;
  lastUpdated: Date;
}

// Helper function to convert timestamp to Date
const toDate = (timestamp: number | Date): Date => {
  if (timestamp instanceof Date) return timestamp;
  return new Date(timestamp * 1000);
};

export const tursoDb = {
  // Players
  async createPlayer(name: string, teamName: string): Promise<Player> {
    const [player] = await db
      .insert(players)
      .values({ name, teamName })
      .returning();

    return {
      ...player,
      createdAt: toDate(player.createdAt)
    };
  },

  async getPlayers(): Promise<Player[]> {
    const result = await db
      .select()
      .from(players)
      .orderBy(asc(players.createdAt));

    return result.map(p => ({
      ...p,
      createdAt: toDate(p.createdAt)
    }));
  },

  async getPlayerById(id: number): Promise<Player | null> {
    const [player] = await db
      .select()
      .from(players)
      .where(eq(players.id, id))
      .limit(1);

    if (!player) return null;

    return {
      ...player,
      createdAt: toDate(player.createdAt)
    };
  },

  async updatePlayer(id: number, updates: Partial<Player>): Promise<Player | null> {
    try {
      const [updated] = await db
        .update(players)
        .set(updates)
        .where(eq(players.id, id))
        .returning();

      if (!updated) return null;

      return {
        ...updated,
        createdAt: toDate(updated.createdAt)
      };
    } catch {
      return null;
    }
  },

  async deletePlayer(id: number): Promise<boolean> {
    try {
      await db
        .delete(players)
        .where(eq(players.id, id));
      return true;
    } catch {
      return false;
    }
  },

  // Contestants
  async createContestant(name: string, eliminatedWeek: number | null = null): Promise<Contestant> {
    const [contestant] = await db
      .insert(contestants)
      .values({ name, eliminatedWeek })
      .returning();

    return {
      ...contestant,
      createdAt: toDate(contestant.createdAt)
    };
  },

  async getContestants(): Promise<Contestant[]> {
    const result = await db
      .select()
      .from(contestants)
      .orderBy(asc(contestants.createdAt));

    return result.map(c => ({
      ...c,
      createdAt: toDate(c.createdAt)
    }));
  },

  async getContestantById(id: number): Promise<Contestant | null> {
    const [contestant] = await db
      .select()
      .from(contestants)
      .where(eq(contestants.id, id))
      .limit(1);

    if (!contestant) return null;

    return {
      ...contestant,
      createdAt: toDate(contestant.createdAt)
    };
  },

  async updateContestant(id: number, updates: Partial<Contestant>): Promise<Contestant | null> {
    try {
      const [updated] = await db
        .update(contestants)
        .set(updates)
        .where(eq(contestants.id, id))
        .returning();

      if (!updated) return null;

      return {
        ...updated,
        createdAt: toDate(updated.createdAt)
      };
    } catch {
      return null;
    }
  },

  async deleteContestant(id: number): Promise<boolean> {
    try {
      await db
        .delete(contestants)
        .where(eq(contestants.id, id));
      return true;
    } catch {
      return false;
    }
  },

  // Teams
  async createTeam(playerId: number, contestantId: number): Promise<Team> {
    const [team] = await db
      .insert(teams)
      .values({ playerId, contestantId, isActive: true })
      .returning();

    return {
      id: team.id,
      playerId: team.playerId,
      contestantId: team.contestantId,
      createdAt: toDate(team.createdAt)
    };
  },

  async getTeamsByPlayerId(playerId: number): Promise<Team[]> {
    const result = await db
      .select()
      .from(teams)
      .where(and(eq(teams.playerId, playerId), eq(teams.isActive, true)))
      .orderBy(asc(teams.createdAt));

    return result.map(t => ({
      id: t.id,
      playerId: t.playerId,
      contestantId: t.contestantId,
      createdAt: toDate(t.createdAt)
    }));
  },

  async updatePlayerTeam(playerId: number, contestantIds: number[]): Promise<void> {
    // Mark all existing teams as inactive
    await db
      .update(teams)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(teams.playerId, playerId));

    // Create new teams in bulk (much faster than loop!)
    if (contestantIds.length > 0) {
      await db.insert(teams).values(
        contestantIds.map(contestantId => ({
          playerId,
          contestantId,
          isActive: true
        }))
      );
    }
  },

  // Weekly Scores
  async createWeeklyScore(week: number, contestantId: number, category: string, points: number): Promise<WeeklyScore> {
    const [score] = await db
      .insert(weeklyScores)
      .values({ week, contestantId, category, points })
      .returning();

    return {
      ...score,
      createdAt: toDate(score.createdAt)
    };
  },

  async getWeeklyScores(week?: number): Promise<WeeklyScore[]> {
    const baseQuery = db.select().from(weeklyScores);

    const result = week !== undefined
      ? await baseQuery
          .where(eq(weeklyScores.week, week))
          .orderBy(asc(weeklyScores.createdAt))
      : await baseQuery.orderBy(asc(weeklyScores.week));

    return result.map(s => ({
      ...s,
      createdAt: toDate(s.createdAt)
    }));
  },

  async getWeeklyScoreById(id: number): Promise<WeeklyScore | null> {
    const [score] = await db
      .select()
      .from(weeklyScores)
      .where(eq(weeklyScores.id, id))
      .limit(1);

    if (!score) return null;

    return {
      ...score,
      createdAt: toDate(score.createdAt)
    };
  },

  async updateWeeklyScore(id: number, week: number, contestantId: number, category: string, points: number): Promise<WeeklyScore | null> {
    try {
      const [updated] = await db
        .update(weeklyScores)
        .set({ week, contestantId, category, points })
        .where(eq(weeklyScores.id, id))
        .returning();

      if (!updated) return null;

      return {
        ...updated,
        createdAt: toDate(updated.createdAt)
      };
    } catch {
      return null;
    }
  },

  async deleteWeeklyScore(id: number): Promise<boolean> {
    try {
      await db
        .delete(weeklyScores)
        .where(eq(weeklyScores.id, id));
      return true;
    } catch {
      return false;
    }
  },

  // Season Totals
  async createSeasonTotal(data: { playerId: number; week: number; contestantId: number; points: number; runningTotal: number }): Promise<SeasonTotal> {
    // Check if season total exists for this player
    const [existing] = await db
      .select()
      .from(seasonTotals)
      .where(eq(seasonTotals.playerId, data.playerId))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(seasonTotals)
        .set({ totalPoints: data.runningTotal, lastUpdated: new Date() })
        .where(eq(seasonTotals.playerId, data.playerId))
        .returning();

      return {
        id: updated.id,
        playerId: updated.playerId,
        week: data.week,
        contestantId: data.contestantId,
        points: data.points,
        runningTotal: updated.totalPoints,
        lastUpdated: toDate(updated.lastUpdated)
      };
    }

    const [total] = await db
      .insert(seasonTotals)
      .values({
        playerId: data.playerId,
        totalPoints: data.runningTotal
      })
      .returning();

    return {
      id: total.id,
      playerId: total.playerId,
      week: data.week,
      contestantId: data.contestantId,
      points: data.points,
      runningTotal: total.totalPoints,
      lastUpdated: toDate(total.lastUpdated)
    };
  },

  async getSeasonTotals(): Promise<SeasonTotal[]> {
    const result = await db
      .select()
      .from(seasonTotals)
      .orderBy(desc(seasonTotals.totalPoints));

    return result.map(t => ({
      id: t.id,
      playerId: t.playerId,
      week: 0,
      contestantId: 0,
      points: 0,
      runningTotal: t.totalPoints,
      lastUpdated: toDate(t.lastUpdated)
    }));
  },

  async getSeasonTotalByPlayerId(playerId: number): Promise<SeasonTotal[]> {
    const [total] = await db
      .select()
      .from(seasonTotals)
      .where(eq(seasonTotals.playerId, playerId))
      .limit(1);

    if (!total) return [];

    return [{
      id: total.id,
      playerId: total.playerId,
      week: 0,
      contestantId: 0,
      points: 0,
      runningTotal: total.totalPoints,
      lastUpdated: toDate(total.lastUpdated)
    }];
  },

  async updateSeasonTotal(id: number, updates: { points?: number; runningTotal?: number }): Promise<SeasonTotal | null> {
    try {
      const [updated] = await db
        .update(seasonTotals)
        .set({
          totalPoints: updates.runningTotal ?? updates.points ?? 0,
          lastUpdated: new Date()
        })
        .where(eq(seasonTotals.id, id))
        .returning();

      if (!updated) return null;

      return {
        id: updated.id,
        playerId: updated.playerId,
        week: 0,
        contestantId: 0,
        points: 0,
        runningTotal: updated.totalPoints,
        lastUpdated: toDate(updated.lastUpdated)
      };
    } catch {
      return null;
    }
  },

  async deleteSeasonTotal(id: number): Promise<boolean> {
    try {
      await db
        .delete(seasonTotals)
        .where(eq(seasonTotals.id, id));
      return true;
    } catch {
      return false;
    }
  },

  // Seed default data
  async seedDefaultData(): Promise<void> {
    const existingContestants = await db.select().from(contestants);

    if (existingContestants.length === 0) {
      const defaultContestants = [
        'Tom', 'Jessika', 'Jasmine', 'Nataliia', 'Lesley', 'Iain',
        'Toby', 'Aaron', 'Pui Man', 'Nadia', 'Leighton', 'Hassan'
      ];

      await db.insert(contestants).values(
        defaultContestants.map(name => ({ name, eliminatedWeek: null }))
      );
    }
  },

  // Clear all data
  async clearAllData(): Promise<void> {
    await db.delete(seasonTotals);
    await db.delete(weeklyScores);
    await db.delete(teams);
    await db.delete(contestants);
    await db.delete(players);
  }
};
