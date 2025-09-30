# Blob Storage Setup Guide

This guide explains the new simplified storage architecture for the GBBO Fantasy App using Vercel Blob.

## What Changed

The app now uses a simpler architecture with:
- **Vercel Blob** for storing weekly scores (replaces complex database writes)
- **Node runtime API route** for reliable writes (`/api/admin/save-week`)
- **No-cache fetching** to ensure leaderboard always shows latest data
- **One-shot seeding script** for easy data initialization

## Setup Steps

### 1. Environment Variables

Add these to your `.env.local` (and to Vercel environment variables):

```env
# Required for write operations to Blob from server-side code
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx

# After running seed script, paste the printed URL here
NEXT_PUBLIC_INDEX_URL=https://xxxxx.public.blob.vercel-storage.com/indexes/current.json

# Optional: protect admin route
ADMIN_SECRET=your-secret-here
```

### 2. Get Your Blob Token

1. Go to your Vercel project dashboard
2. Navigate to **Storage** → **Create** → **Blob Store**
3. Copy the `BLOB_READ_WRITE_TOKEN` from the connection settings

### 3. Seed Initial Data

Edit `seed-data.json` with your initial weekly scores:

```json
{
  "seasonId": "2025",
  "weeks": [
    { "week": 1, "scores": [{ "teamId": "Team A", "points": 15 }] },
    { "week": 2, "scores": [{ "teamId": "Team A", "points": 31 }] }
  ]
}
```

Then run:

```bash
npm run seed:blob
# or: pnpm seed:blob
```

**Copy the printed index URL** and paste it into `NEXT_PUBLIC_INDEX_URL` in your `.env.local` and Vercel.

### 4. Deploy

```bash
git add -A
git commit -m "Fix: Node runtime save route, no-store reads, seed script, admin page"
git push origin fix/storage-and-seeding
```

Create a PR and deploy the preview.

## Usage

### Admin Interface

Visit `/admin` to enter weekly scores:

1. Enter season ID and week number
2. Add/edit team scores
3. (Optional) Enter admin secret if `ADMIN_SECRET` is set
4. Click "Save Week"

The system will:
- Upload the week's scores to Blob storage
- Update the current index pointer
- Return the public URLs

### Simplified Leaderboard

Visit `/leaderboard-simple` to see the current week's standings.

The page:
- Fetches fresh data on every load (no caching)
- Shows season, week, and sorted scores
- Displays data from the current index

### Original Leaderboard

The original `/leaderboard` page with weekly breakdowns is still available and continues to work with the existing database structure.

## Architecture

```
┌─────────────┐
│   Admin UI  │
│  (/admin)   │
└──────┬──────┘
       │ POST
       ▼
┌──────────────────────┐
│  API: save-week      │
│  (Node runtime)      │
└──────┬───────────────┘
       │ put()
       ▼
┌──────────────────────┐
│   Vercel Blob        │
│                      │
│  scores/2025/        │
│    week-1.json       │
│    week-2.json       │
│                      │
│  indexes/            │
│    current.json ──┐  │
└───────────────────┼──┘
                    │
       ┌────────────┘
       │ fetch (no-store)
       ▼
┌──────────────────────┐
│  lib/leaderboard.ts  │
│  getCurrentWeek()    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Leaderboard Page    │
│  (Server Component)  │
└──────────────────────┘
```

## Files Created

- `src/app/api/admin/save-week/route.ts` - API endpoint for saving weekly scores
- `src/lib/leaderboard.ts` - Canonical reader with no-cache fetching
- `src/app/admin/page.tsx` - Admin UI for entering scores
- `src/app/leaderboard-simple/page.tsx` - Simplified leaderboard display
- `scripts/seed-blob.mjs` - One-shot seeding script
- `seed-data.json` - Example seed data

## Troubleshooting

### "NEXT_PUBLIC_INDEX_URL not set"
Run the seed script and copy the printed URL to your environment variables.

### "Unauthorized" when saving
Make sure the `x-admin-secret` header matches your `ADMIN_SECRET` env var, or remove the `ADMIN_SECRET` to disable auth.

### Leaderboard shows stale data
Check that `NEXT_PUBLIC_INDEX_URL` is correct and the blob is publicly accessible.

### Build issues with seed script
If `--env-file` is not supported by your Node version, install `dotenv-cli`:
```bash
npm install -D dotenv-cli
npx dotenv -e .env.local -- node scripts/seed-blob.mjs
```

## Next Steps

When ready to migrate to a full database:
- Keep the same admin UI
- Replace `put()` calls with database writes (Drizzle)
- Optionally continue writing the index file for ultra-fast public reads
