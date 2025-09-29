// app/api/admin/save-week/route.ts
export const runtime = 'node'; // Blob RW requires Node runtime

import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

type Score = { teamId: string; points: number };
type SavePayload = { seasonId: string; week: number; scores: Score[]; note?: string };

export async function POST(request: Request) {
  try {
    // Optional auth: if ADMIN_SECRET is set, require matching x-admin-secret header
    const adminSecret = process.env.ADMIN_SECRET;
    if (adminSecret) {
      const header = request.headers.get('x-admin-secret');
      if (header !== adminSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = (await request.json()) as SavePayload;
    if (!body?.seasonId || typeof body.week !== 'number' || !Array.isArray(body.scores)) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const key = `scores/${body.seasonId}/week-${body.week}.json`;

    // 1) Write the week's scores file
    const putRes = await put(
      key,
      JSON.stringify({ ...body, savedAt: now }),
      { access: 'public', contentType: 'application/json' }
    );

    // 2) Update the "current pointer" index so the UI knows which week to show
    const indexKey = `indexes/current.json`;
    const indexDoc = {
      currentSeasonId: body.seasonId,
      currentWeek: body.week,
      scoresUrl: putRes.url, // public URL to the file just written
      updatedAt: now,
    };

    const idxRes = await put(
      indexKey,
      JSON.stringify(indexDoc),
      { access: 'public', contentType: 'application/json' }
    );

    // Optionally: import { revalidateTag, revalidatePath } from 'next/cache'
    // and call them here if you use cache tags or static routes.

    return NextResponse.json({
      ok: true,
      scoresFile: putRes.url,
      indexFile: idxRes.url,
    });
  } catch (err) {
    console.error('save-week error:', err);
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }
}