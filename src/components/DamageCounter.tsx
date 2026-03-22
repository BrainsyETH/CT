"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModeStore } from "@/store/mode-store";
import { formatCurrency } from "@/lib/formatters";
import type { Event } from "@/lib/types";

interface DamageCounterProps {
  events: Event[];
}

export function DamageCounter({ events }: DamageCounterProps) {
  const { mode } = useModeStore();
  const isCrimeline = mode === "crimeline";

  const totalLost = useMemo(() => {
    return events
      .filter(
        (e) =>
          (Array.isArray(e.mode) ? e.mode.includes("crimeline") : e.mode === "crimeline") &&
          e.crimeline?.funds_lost_usd
      )
      .reduce((sum, e) => sum + (e.crimeline?.funds_lost_usd || 0), 0);
  }, [events]);

  const incidentCount = useMemo(() => {
    return events.filter(
      (e) =>
        (Array.isArray(e.mode) ? e.mode.includes("crimeline") : e.mode === "crimeline") &&
        e.crimeline
    ).length;
  }, [events]);

  // Only show in crimeline mode
  if (!isCrimeline || totalLost === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-14 left-4 z-30 lg:bottom-4 px-4 py-3 rounded-lg border-2 backdrop-blur-md bg-gray-950/90 border-purple-700 shadow-[3px_3px_0_rgba(124,58,237,0.4)]"
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-0.5">
          Total Damage
        </p>
        <p className="text-lg sm:text-xl font-black text-purple-300 tabular-nums">
          {formatCurrency(totalLost)}
        </p>
        <p className="text-[10px] text-gray-500">
          {incidentCount} incidents
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
