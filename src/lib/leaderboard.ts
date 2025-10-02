// lib/leaderboard.ts
export type Score = { teamId: string; points: number };
export type WeekDoc = {
  seasonId: string;
  week: number;
  scores: Score[];
  savedAt: string;
  note?: string;
};
export type IndexDoc = {
  currentSeasonId: string;
  currentWeek: number;
  scoresUrl: string; // public URL to current week doc
  updatedAt: string;
};

const INDEX_URL = process.env.NEXT_PUBLIC_INDEX_URL!;

/**
 * Always fetch fresh data to avoid serving stale leaderboard in SSR.
 * If you'd rather use Next cache tags, switch to:
 *   fetch(INDEX_URL, { next: { tags: ['config'] } })
 * and call revalidateTag('config') in the save route.
 */
export async function getCurrentWeek(): Promise<{ index: IndexDoc; week: WeekDoc }> {
  if (!INDEX_URL) throw new Error('NEXT_PUBLIC_INDEX_URL not set');

  const idxRes = await fetch(INDEX_URL, { cache: 'no-store' });
  if (!idxRes.ok) throw new Error('Failed to load index');
  const index = (await idxRes.json()) as IndexDoc;

  const weekRes = await fetch(index.scoresUrl, { cache: 'no-store' });
  if (!weekRes.ok) throw new Error('Failed to load week');
  const week = (await weekRes.json()) as WeekDoc;

  return { index, week };
}

