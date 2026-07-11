"use client";

import { useCallback } from "react";
import { useModeStore } from "@/store/mode-store";
import type { Event } from "@/lib/types";

interface RandomEventButtonProps {
  events: Event[];
}

export function RandomEventButton({ events }: RandomEventButtonProps) {
  const { mode, setSelectedEventId } = useModeStore();
  const isCrimeline = mode === "crimeline";

  // Compute eligible events up front so the button can disable itself instead
  // of silently no-oping when the current mode has nothing to show.
  const modeFiltered = events.filter((event) => {
    const eventModes = Array.isArray(event.mode) ? event.mode : [event.mode];
    if (mode === "timeline") return eventModes.includes("timeline");
    if (mode === "crimeline") return eventModes.includes("crimeline") && !!event.crimeline;
    return true;
  });
  const hasEvents = modeFiltered.length > 0;

  const handleRandomEvent = useCallback(() => {
    if (modeFiltered.length === 0) return;
    const random = modeFiltered[Math.floor(Math.random() * modeFiltered.length)];
    setSelectedEventId(random.id);

    // Haptic feedback
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(15);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, mode, setSelectedEventId]);

  return (
    <button
      onClick={handleRandomEvent}
      disabled={!hasEvents}
      aria-label={hasEvents ? "Open a random event" : "No events available in this mode"}
      title={hasEvents ? "Surprise me — random event" : "No events in this mode"}
      className={`neo-brutalist-btn flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
        isCrimeline
          ? "bg-purple-900/40 text-purple-300 border-purple-700 hover:bg-purple-900/60 hover:text-purple-200"
          : "bg-teal-50 text-teal-700 border-teal-300 hover:bg-teal-100"
      }`}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
        />
      </svg>
      <span>Random</span>
    </button>
  );
}
