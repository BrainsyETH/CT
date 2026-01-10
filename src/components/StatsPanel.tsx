"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useModeStore } from "@/store/mode-store";
import { formatCurrency } from "@/lib/formatters";
import type { Event } from "@/lib/types";

interface StatsPanelProps {
  events: Event[];
}

export function StatsPanel({ events }: StatsPanelProps) {
  const { mode } = useModeStore();
  const isCrimeline = mode === "crimeline";

  const stats = useMemo(() => {
    const crimelineEvents = events.filter(
      (e) => e.mode.includes("crimeline") && e.crimeline
    );

    const totalLost = crimelineEvents.reduce(
      (sum, e) => sum + (e.crimeline?.funds_lost_usd || 0),
      0
    );

    const byType: Record<string, { count: number; total: number }> = {};
    crimelineEvents.forEach((e) => {
      if (e.crimeline?.type) {
        if (!byType[e.crimeline.type]) {
          byType[e.crimeline.type] = { count: 0, total: 0 };
        }
        byType[e.crimeline.type].count++;
        byType[e.crimeline.type].total += e.crimeline.funds_lost_usd || 0;
      }
    });

    const topTypes = Object.entries(byType)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 3);

    const biggestHack = crimelineEvents.reduce(
      (max, e) =>
        (e.crimeline?.funds_lost_usd || 0) > (max?.crimeline?.funds_lost_usd || 0)
          ? e
          : max,
      crimelineEvents[0]
    );

    const recoveredCount = crimelineEvents.filter(
      (e) => e.crimeline?.status === "Funds recovered"
    ).length;

    const totalLossCount = crimelineEvents.filter(
      (e) => e.crimeline?.status === "Total loss"
    ).length;

    return {
      totalEvents: crimelineEvents.length,
      totalLost,
      topTypes,
      biggestHack,
      recoveredCount,
      totalLossCount,
    };
  }, [events]);

  if (!isCrimeline) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 p-4 rounded-2xl bg-gray-950 border-2 border-red-900/60 shadow-[6px_6px_0_rgba(0,0,0,0.6)]"
    >
      <h2 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
        <span>💀</span> Crimeline Statistics
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {/* Total Lost */}
        <div className="bg-gray-900/60 rounded-xl p-3 border-2 border-red-900/40">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Lost</p>
          <p className="text-xl font-bold text-red-400">
            {formatCurrency(stats.totalLost)}
          </p>
        </div>

        {/* Total Events */}
        <div className="bg-gray-900/60 rounded-xl p-3 border-2 border-red-900/40">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Incidents</p>
          <p className="text-xl font-bold text-white">{stats.totalEvents}</p>
        </div>

        {/* Recovered */}
        <div className="bg-gray-900/60 rounded-xl p-3 border-2 border-red-900/40">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Recovered</p>
          <p className="text-xl font-bold text-green-400">{stats.recoveredCount}</p>
        </div>

        {/* Total Loss */}
        <div className="bg-gray-900/60 rounded-xl p-3 border-2 border-red-900/40">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Loss</p>
          <p className="text-xl font-bold text-red-500">{stats.totalLossCount}</p>
        </div>
      </div>

      {/* Biggest Hack */}
      {stats.biggestHack && (
        <div className="mb-4 p-3 bg-red-950/40 rounded-xl border-2 border-red-900/40">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Biggest Incident
          </p>
          <p className="text-sm font-bold text-white">{stats.biggestHack.title}</p>
          <p className="text-lg font-bold text-red-400">
            {formatCurrency(stats.biggestHack.crimeline?.funds_lost_usd || 0)}
          </p>
        </div>
      )}

      {/* Top Attack Types */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
          Top Attack Vectors
        </p>
        <div className="flex flex-wrap gap-2">
          {stats.topTypes.map(([type, data]) => (
            <div
              key={type}
              className="px-3 py-1.5 bg-gray-800 rounded-lg border-2 border-gray-700"
            >
              <span className="text-xs text-gray-400">{type}</span>
              <span className="ml-2 text-xs font-bold text-red-400">
                {formatCurrency(data.total)}
              </span>
              <span className="ml-1 text-xs text-gray-500">({data.count})</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
