# GBBO Fantasy App — Implementation Checklist (Cursor‑ready)

This playbook fixes three pain points:

- **Writes failing/flaky** → move all writes to a **Node runtime** API route that talks to **Vercel Blob**.
- **Leaderboard not updating** → fetch with `cache: 'no-store'` (or add cache tags + revalidation).
- **Hard to seed data** → a **one-shot Node script** seeds Blob and publishes a `current.json` index.

Paste this file into your repo as `TODO.md` (or follow directly in Cursor).

---

## 0) Create a working branch

```bash
git checkout -b fix/storage-and-seeding
```

---

## 1) Install / update dependencies

```bash
pnpm add @vercel/blob
# or: npm i @vercel/blob / yarn add @vercel/blob
```

> If you plan to migrate to a DB later, you can add these (optional for now):
>
> ```bash
> pnpm add drizzle-orm drizzle-kit @vercel/postgres zod
> ```

---

## 2) Environment variables (local + Vercel)

Create `.env.local` (and mirror these in **Vercel → Project → Settings → Environment Variables**):

```env
# Required for write operations to Blob from server-side code
BLOB_READ_WRITE_TOKEN=***

# After you run the seed script below, copy the printed public URL for
# indexes/current.json into this env var:
NEXT_PUBLIC_INDEX_URL=https://<your-public-blob-host>/indexes/current.json

# (Optional) simple admin secret:
# If set, the save API will require header x-admin-secret to match this value.
ADMIN_SECRET=change-me
```

**Important:** Do **not** import `BLOB_READ_WRITE_TOKEN` in any client component.

---

## 3) Server: single API route for weekly saves (Node runtime)

**Create:** `app/api/admin/save-week/route.ts`

```ts
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
```

---

## 4) Server: canonical reader for leaderboard (no stale cache)

**Create:** `lib/leaderboard.ts`

```ts
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
```

---

## 5) Page update: Server Component leaderboard

**Edit (or create):** `app/leaderboard/page.tsx`

```tsx
// app/leaderboard/page.tsx
import { getCurrentWeek } from '@/lib/leaderboard';

export default async function LeaderboardPage() {
  const { index, week } = await getCurrentWeek();

  // If "scores" already represent totals for that week, just sort.
  const rows = [...week.scores].sort((a, b) => b.points - a.points);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">GBBO Leaderboard</h1>
      <p className="text-sm text-gray-500 mt-1">
        Season {index.currentSeasonId}, Week {index.currentWeek}
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[360px] text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-6">Rank</th>
              <th className="py-2 pr-6">Team</th>
              <th className="py-2 pr-6">Points</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.teamId} className="border-b">
                <td className="py-2 pr-6">{i + 1}</td>
                <td className="py-2 pr-6">{r.teamId}</td>
                <td className="py-2 pr-6">{r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
```

---

## 6) Admin UI: minimal client page that calls the API and updates optimistically

**Create:** `app/admin/page.tsx`

```tsx
'use client';

import * as React from 'react';

type Score = { teamId: string; points: number };

export default function AdminPage() {
  const [seasonId, setSeasonId] = React.useState('2025');
  const [week, setWeek] = React.useState(1);
  const [scores, setScores] = React.useState<Score[]>([
    // example editable rows
    { teamId: 'Team A', points: 0 },
    { teamId: 'Team B', points: 0 },
    { teamId: 'Team C', points: 0 },
  ]);
  const [note, setNote] = React.useState('');
  const [adminSecret, setAdminSecret] = React.useState(''); // optional if you set ADMIN_SECRET
  const [pending, startTransition] = React.useTransition();
  const [toast, setToast] = React.useState<string | null>(null);

  function updateScore(i: number, points: number) {
    setScores(prev => prev.map((s, idx) => (idx === i ? { ...s, points } : s)));
  }

  function addRow() {
    setScores(prev => [...prev, { teamId: `Team ${String.fromCharCode(65 + prev.length)}`, points: 0 }]);
  }

  async function save() {
    setToast(null);
    startTransition(async () => {
      const headers: Record<string, string> = { 'content-type': 'application/json' };
      if (adminSecret) headers['x-admin-secret'] = adminSecret;

      const res = await fetch('/api/admin/save-week', {
        method: 'POST',
        headers,
        body: JSON.stringify({ seasonId, week: Number(week), scores, note }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setToast(`Save failed: ${err.error ?? res.statusText}`);
        return;
      }
      const data = await res.json();
      setToast(`Saved! index: ${data.indexFile.split('/').pop()}`);
    });
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Admin — Weekly Points</h1>

      <div className="flex flex-wrap gap-4 items-end">
        <label className="flex items-center gap-2">
          <span>Season</span>
          <input className="border px-2 py-1 rounded" value={seasonId} onChange={e => setSeasonId(e.target.value)} />
        </label>
        <label className="flex items-center gap-2">
          <span>Week</span>
          <input className="border px-2 py-1 rounded w-16" type="number" value={week} onChange={e => setWeek(Number(e.target.value))} />
        </label>
        <label className="flex items-center gap-2">
          <span>Admin Secret</span>
          <input className="border px-2 py-1 rounded" type="password" value={adminSecret} onChange={e => setAdminSecret(e.target.value)} placeholder="optional" />
        </label>
      </div>

      <div className="space-y-2">
        {scores.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <input
              className="border px-2 py-1 rounded"
              value={s.teamId}
              onChange={e => setScores(prev => prev.map((x, idx) => (idx === i ? { ...x, teamId: e.target.value } : x)))}
            />
            <input
              className="border px-2 py-1 rounded w-24"
              type="number"
              value={s.points}
              onChange={e => updateScore(i, Number(e.target.value))}
            />
          </div>
        ))}
        <button className="border px-3 py-1 rounded" onClick={addRow}>+ Add Team</button>
      </div>

      <label className="block">
        <div>Note (optional)</div>
        <textarea className="border px-2 py-1 rounded w-full" rows={3} value={note} onChange={e => setNote(e.target.value)} />
      </label>

      <button
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={save}
        disabled={pending}
      >
        {pending ? 'Saving…' : 'Save Week'}
      </button>

      {toast && <div className="text-sm text-green-700">{toast}</div>}
    </main>
  );
}
```

> The admin page talks to **one** server route; no direct Blob calls from the browser.

---

## 7) Seeding: one-shot Node script that uploads initial data + current index

Use an **ESM** script (`.mjs`) so you can run it with plain Node. It expects `BLOB_READ_WRITE_TOKEN` in the environment and a local `seed-data.json` file.

**Create:** `scripts/seed-blob.mjs`

```js
// scripts/seed-blob.mjs
// Run with: node --env-file=.env.local scripts/seed-blob.mjs
import { put } from '@vercel/blob';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Types (for reference)
// type Score = { teamId: string; points: number };
// type WeekDoc = { seasonId: string; week: number; scores: Score[]; savedAt: string; note?: string };

async function main() {
  const filePath = path.join(__dirname, '..', 'seed-data.json');
  const raw = await fs.readFile(filePath, 'utf-8');
  const seed = JSON.parse(raw); // { seasonId: string, weeks: Array<{week:number, scores: Score[], note?:string}> }

  let lastUrl = '';
  let lastWeek = 0;

  for (const w of seed.weeks) {
    const doc = {
      seasonId: seed.seasonId,
      week: w.week,
      scores: w.scores,
      note: w.note,
      savedAt: new Date().toISOString(),
    };

    const key = `scores/${seed.seasonId}/week-${w.week}.json`;
    const res = await put(key, JSON.stringify(doc), {
      access: 'public',
      contentType: 'application/json',
    });

    lastUrl = res.url;
    lastWeek = w.week;
    console.log('Wrote:', key, '→', res.url);
  }

  // Write index pointer to the last uploaded week
  const indexKey = `indexes/current.json`;
  const idxDoc = {
    currentSeasonId: seed.seasonId,
    currentWeek: lastWeek,
    scoresUrl: lastUrl,
    updatedAt: new Date().toISOString(),
  };
  const idxRes = await put(indexKey, JSON.stringify(idxDoc), {
    access: 'public',
    contentType: 'application/json',
  });

  console.log('\nIndex file URL (set this as NEXT_PUBLIC_INDEX_URL):');
  console.log(idxRes.url);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

**Create:** `seed-data.json` (example)

```json
{
  "seasonId": "2025",
  "weeks": [
    { "week": 1, "scores": [{ "teamId": "Team A", "points": 15 }, { "teamId": "Team B", "points": 12 }] },
    { "week": 2, "scores": [{ "teamId": "Team A", "points": 31 }, { "teamId": "Team B", "points": 25 }] }
  ]
}
```

**Add to `package.json` (optional):**

```json
{
  "scripts": {
    "seed:blob": "node --env-file=.env.local scripts/seed-blob.mjs"
  }
}
```

> If your Node version does **not** support `--env-file`, install `dotenv-cli` and use:
>
> ```bash
> pnpm add -D dotenv-cli
> pnpm dotenv -e .env.local -- node scripts/seed-blob.mjs
> ```

---

## 8) Performance tidy-ups (quick wins)

- Keep leaderboard as a **Server Component** (no client waterfalls).
- Admin page only ships a small client bundle; avoid importing admin code in public routes.
- Delete any prior client-side Blob write code (replaced by the API).

---

## 9) (Optional) Switch to Vercel Postgres later

When you want atomic updates & richer queries:

- Keep the **same admin UI**.
- Replace the API route’s `put()` calls with DB writes (Drizzle).
- Optionally continue writing `indexes/current.json` for ultra-fast public reads.

---

## 10) Deploy

```bash
git add -A
git commit -m "Fix: Node runtime save route, no-store reads, seed script, admin page"
git push origin fix/storage-and-seeding
# open a PR, deploy preview, then merge
```

---

## Verification checklist

1. Visit `/admin`, enter scores, click **Save Week** → toast shows success and index filename.
2. Visit `/leaderboard` → values reflect the latest week immediately.
3. Run the seed script with your real data → copy the printed **Index file URL** into `NEXT_PUBLIC_INDEX_URL` → refresh `/leaderboard`.
