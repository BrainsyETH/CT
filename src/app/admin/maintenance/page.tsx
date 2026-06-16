"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Task = "images" | "tweets" | "defillama";

const SECRET_KEY = "coe-admin-secret";

export default function AdminMaintenancePage() {
  const [secret, setSecret] = useState("");
  const [running, setRunning] = useState<Task | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [totals, setTotals] = useState<{ images: number; tweets: number; defillama: number }>({
    images: 0,
    tweets: 0,
    defillama: 0,
  });

  useEffect(() => {
    const saved = window.localStorage.getItem(SECRET_KEY);
    if (saved) setSecret(saved);
  }, []);

  const append = (line: string) => setLog((prev) => [...prev, line]);

  async function runBackfill(task: Task) {
    if (!secret) {
      append("⚠ Enter your admin secret first.");
      return;
    }
    window.localStorage.setItem(SECRET_KEY, secret);
    setRunning(task);
    append(`▶ Starting ${task} backfill…`);

    let safety = 30; // cap total batches so a click can't loop forever
    try {
      while (safety-- > 0) {
        const res = await fetch("/api/admin/maintenance", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-admin-secret": secret },
          body: JSON.stringify({ task, max: task === "defillama" ? 25 : 40 }),
        });
        const data = await res.json();

        if (!res.ok || data.success === false) {
          append(`✕ ${data.error || res.statusText}`);
          break;
        }
        if (data.done || data.processed === 0) {
          append(`✓ ${task} complete — nothing left to process.`);
          break;
        }

        const got = data.replaced?.length ?? data.updated?.length ?? data.inserted?.length ?? 0;
        setTotals((t) => ({ ...t, [task]: t[task] + got }));
        append(`  ${data.message ?? `batch processed ${data.processed ?? 0}`}`);
      }
    } catch (err) {
      append(`✕ ${err instanceof Error ? err.message : "Request failed"}`);
    } finally {
      setRunning(null);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="px-6 pt-10 pb-6 border-b border-white/10">
        <div className="max-w-3xl mx-auto space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Admin / Dev</p>
          <h1 className="text-3xl font-semibold">Event Maintenance</h1>
          <p className="text-white/70">
            Backfill real images and tweets onto existing events. Each button runs
            in batches until there is nothing left to process.
          </p>
          <Link className="inline-flex items-center text-sm text-blue-300 hover:text-blue-200 pt-2" href="/">
            &larr; Back to timeline
          </Link>
        </div>
      </header>

      <main className="px-6 py-10">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="space-y-2">
            <label className="block text-sm text-white/70">Admin secret</label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="ADMIN_SECRET"
              className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => runBackfill("images")}
              disabled={running !== null}
              className="inline-flex items-center rounded-lg bg-teal-500/90 px-4 py-2 text-sm font-medium text-black hover:bg-teal-400 disabled:opacity-50"
            >
              {running === "images" ? "Backfilling images…" : "Backfill images"}
            </button>
            <button
              onClick={() => runBackfill("tweets")}
              disabled={running !== null}
              className="inline-flex items-center rounded-lg bg-purple-500/90 px-4 py-2 text-sm font-medium text-white hover:bg-purple-400 disabled:opacity-50"
            >
              {running === "tweets" ? "Backfilling tweets…" : "Backfill tweets"}
            </button>
            <button
              onClick={() => runBackfill("defillama")}
              disabled={running !== null}
              className="inline-flex items-center rounded-lg bg-amber-500/90 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50"
            >
              {running === "defillama" ? "Importing DefiLlama hacks…" : "Import DefiLlama hacks"}
            </button>
          </div>

          <p className="text-sm text-white/60">
            Re-hosted images: <span className="text-white">{totals.images}</span> ·
            Events given tweets: <span className="text-white">{totals.tweets}</span> ·
            DefiLlama hacks imported: <span className="text-white">{totals.defillama}</span>
          </p>

          <div className="rounded-lg bg-white/5 border border-white/10 p-4 font-mono text-xs leading-relaxed max-h-[50vh] overflow-auto whitespace-pre-wrap">
            {log.length === 0 ? (
              <span className="text-white/40">Output will appear here…</span>
            ) : (
              log.map((line, i) => <div key={i}>{line}</div>)
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
