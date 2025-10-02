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

