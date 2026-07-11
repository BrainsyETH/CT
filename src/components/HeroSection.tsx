"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useModeStore } from "@/store/mode-store";
import { AnimatedNumber } from "./AnimatedNumber";
import { formatCurrency } from "@/lib/formatters";
import type { Event } from "@/lib/types";

const DISMISS_KEY = "coe-hero-dismissed";

interface HeroSectionProps {
  events: Event[];
}

export function HeroSection({ events }: HeroSectionProps) {
  const { mode, openFeedbackModal } = useModeStore();
  const isCrimeline = mode === "crimeline";
  const prefersReducedMotion = useReducedMotion();
  const [dismissed, setDismissed] = useState(true); // Start true to avoid flash

  useEffect(() => {
    const stored = localStorage.getItem(DISMISS_KEY);
    setDismissed(stored === "1");
  }, []);

  const stats = useMemo(() => {
    const years = new Set(events.map((e) => e.date.slice(0, 4)));
    const crimelineEvents = events.filter(
      (e) =>
        (Array.isArray(e.mode) ? e.mode.includes("crimeline") : e.mode === "crimeline") &&
        e.crimeline?.funds_lost_usd
    );
    const totalLost = crimelineEvents.reduce(
      (sum, e) => sum + (e.crimeline?.funds_lost_usd || 0),
      0
    );
    return {
      totalEvents: events.length,
      yearsCovered: years.size,
      totalLost,
      incidents: crimelineEvents.length,
    };
  }, [events]);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  const scrollToTimeline = () => {
    const target = document.getElementById("timeline-section");
    if (!target) return;
    // Offset for the fixed header so the filter bar isn't tucked underneath it
    const headerOffset = 96;
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <motion.section
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative mb-8 rounded-xl border-3 overflow-hidden transition-colors duration-300 ${
        isCrimeline
          ? "bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 border-purple-700 shadow-[4px_4px_0_rgba(124,58,237,0.4)]"
          : "bg-gradient-to-br from-white via-teal-50/50 to-white border-teal-500 shadow-[4px_4px_0_rgba(20,184,166,0.3)]"
      }`}
    >
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className={`absolute top-3 right-3 z-10 p-1 rounded-full transition-colors ${
          isCrimeline
            ? "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
            : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        }`}
        aria-label="Dismiss hero section"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="px-6 py-8 md:py-10 text-center">
        {/* Tagline */}
        <h2
          className={`text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-tight ${
            isCrimeline ? "text-purple-100" : "text-gray-900"
          }`}
        >
          {isCrimeline
            ? "Every Hack, Scam & Rug Pull in Crypto"
            : mode === "both"
            ? "The Complete History of Cryptocurrency"
            : "Milestones That Shaped Crypto"}
        </h2>
        <p
          className={`mt-2 text-sm md:text-base max-w-xl mx-auto ${
            isCrimeline ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {isCrimeline
            ? "An interactive crimeline of security incidents, exploits, and fraud."
            : "An interactive timeline of the events that built the crypto ecosystem."}
        </p>

        {/* Stat counters */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 md:gap-10">
          <StatItem
            label="Events"
            value={stats.totalEvents}
            isCrimeline={isCrimeline}
          />
          <StatItem
            label="Years"
            value={stats.yearsCovered}
            isCrimeline={isCrimeline}
          />
          {(isCrimeline || mode === "both") && stats.totalLost > 0 && (
            <StatItem
              label="Total Lost"
              value={stats.totalLost}
              formatFn={(n) => formatCurrency(n)}
              isCrimeline={isCrimeline}
            />
          )}
          {(isCrimeline || mode === "both") && stats.incidents > 0 && (
            <StatItem
              label="Incidents"
              value={stats.incidents}
              isCrimeline={isCrimeline}
            />
          )}
        </div>

        {/* CTAs */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={scrollToTimeline}
            className={`neo-brutalist-btn px-5 py-2.5 text-sm font-bold rounded-lg transition-all ${
              isCrimeline
                ? "neo-brutalist-btn-crimeline"
                : "neo-brutalist-btn-timeline"
            }`}
          >
            Explore {isCrimeline ? "Crimeline" : "Timeline"}
          </button>
          <button
            onClick={() => openFeedbackModal("new_event")}
            className={`neo-brutalist-btn px-5 py-2.5 text-sm font-bold rounded-lg transition-all ${
              isCrimeline
                ? "neo-brutalist-btn-inactive"
                : "neo-brutalist-btn-inactive"
            }`}
          >
            Submit an Event
          </button>
        </div>
      </div>
    </motion.section>
  );
}

function StatItem({
  label,
  value,
  formatFn,
  isCrimeline,
}: {
  label: string;
  value: number;
  formatFn?: (n: number) => string;
  isCrimeline: boolean;
}) {
  return (
    <div className="text-center">
      <div
        className={`text-2xl md:text-3xl font-black tabular-nums ${
          isCrimeline ? "text-purple-300" : "text-teal-600"
        }`}
      >
        <AnimatedNumber value={value} formatFn={formatFn} />
      </div>
      <div
        className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${
          isCrimeline ? "text-purple-500" : "text-teal-700/60"
        }`}
      >
        {label}
      </div>
    </div>
  );
}
