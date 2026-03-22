"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModeStore } from "@/store/mode-store";
import { formatCurrency } from "@/lib/formatters";
import type { Event } from "@/lib/types";

interface HeroBannerProps {
  events: Event[];
}

export function HeroBanner({ events }: HeroBannerProps) {
  const { mode } = useModeStore();
  const isCrimeline = mode === "crimeline";
  const [activeStatIndex, setActiveStatIndex] = useState(0);

  const stats = useMemo(() => {
    const totalEvents = events.length;
    const crimelineEvents = events.filter(
      (e) =>
        (Array.isArray(e.mode) ? e.mode.includes("crimeline") : e.mode === "crimeline") &&
        e.crimeline
    );
    const totalLost = crimelineEvents.reduce(
      (sum, e) => sum + (e.crimeline?.funds_lost_usd || 0),
      0
    );
    const totalIncidents = crimelineEvents.length;

    const years = new Set(events.map((e) => e.date.slice(0, 4)));
    const yearSpan = years.size;

    const timelineStats = [
      { label: "Events catalogued", value: `${totalEvents}+`, sublabel: `across ${yearSpan} years of crypto history` },
      { label: "Years of history", value: `${yearSpan}`, sublabel: "from Bitcoin's genesis to today" },
      { label: "Categories tracked", value: "15+", sublabel: "Bitcoin, DeFi, NFTs, Regulation & more" },
    ];

    const crimelineStats = [
      { label: "Total funds stolen", value: formatCurrency(totalLost), sublabel: `across ${totalIncidents} incidents` },
      { label: "Incidents recorded", value: `${totalIncidents}`, sublabel: "hacks, exploits, rug pulls & fraud" },
      { label: "The full rap sheet", value: formatCurrency(totalLost), sublabel: "and counting..." },
    ];

    return isCrimeline ? crimelineStats : timelineStats;
  }, [events, isCrimeline]);

  // Rotate stats every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStatIndex((prev) => (prev + 1) % stats.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [stats.length]);

  const activeStat = stats[activeStatIndex];

  return (
    <div
      className={`mb-6 rounded-xl border-2 overflow-hidden transition-colors duration-300 ${
        isCrimeline
          ? "border-purple-800 bg-gradient-to-r from-gray-950 via-purple-950/20 to-gray-950 shadow-[4px_4px_0_rgba(124,58,237,0.3)]"
          : "border-teal-300 bg-gradient-to-r from-teal-50/60 via-white to-teal-50/60 shadow-[4px_4px_0_rgba(20,184,166,0.15)]"
      }`}
    >
      <div className="px-5 py-5 sm:py-6 text-center relative">
        {/* Rotating stat */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStatIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
          >
            <p
              className={`text-xs sm:text-sm font-bold uppercase tracking-widest mb-1 ${
                isCrimeline ? "text-purple-400" : "text-teal-600"
              }`}
            >
              {activeStat.label}
            </p>
            <p
              className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight ${
                isCrimeline ? "text-white" : "text-gray-900"
              }`}
            >
              {activeStat.value}
            </p>
            <p
              className={`mt-1 text-sm ${
                isCrimeline ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {activeStat.sublabel}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {stats.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveStatIndex(i)}
              aria-label={`Show stat ${i + 1}`}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === activeStatIndex
                  ? isCrimeline
                    ? "bg-purple-400 w-4"
                    : "bg-teal-500 w-4"
                  : isCrimeline
                  ? "bg-gray-600 hover:bg-gray-500"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
