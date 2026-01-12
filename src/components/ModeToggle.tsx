"use client";

import { useModeStore } from "@/store/mode-store";
import type { Mode } from "@/lib/types";

interface ModeToggleProps {
  compact?: boolean;
}

export function ModeToggle({ compact = false }: ModeToggleProps) {
  const { mode, setMode } = useModeStore();
  const isCrimelineMode = mode === "crimeline";

  const segments: { value: Mode; label: string }[] = [
    { value: "timeline", label: "Timeline" },
    { value: "crimeline", label: "Crimeline" },
    { value: "both", label: "Both" },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Select view mode"
      className={`inline-flex ${compact ? 'gap-1 p-0.5' : 'gap-1.5 p-1'} bg-gray-200 dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-700 ${
        isCrimelineMode ? "shadow-[2px_2px_0_rgba(124,58,237,0.35)]" : "shadow-[2px_2px_0_rgba(15,23,42,0.18)]"
      }`}
    >
      {segments.map((segment) => {
        const isActive = mode === segment.value;
        const isTimeline = segment.value === "timeline";
        const isCrimeline = segment.value === "crimeline";
        const isBoth = segment.value === "both";

        return (
          <button
            key={segment.value}
            onClick={() => setMode(segment.value)}
            role="radio"
            aria-checked={isActive}
            className={`
              ${compact ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
              font-medium rounded-md
              transition-all duration-300 ease-out
              focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-gray-200 dark:focus:ring-offset-gray-800
              ${
                isActive
                  ? isTimeline
                    ? "bg-teal-500 text-white shadow-md scale-[1.02] focus:ring-teal-400"
                    : isCrimeline
                    ? "bg-purple-600 text-white shadow-md scale-[1.02] focus:ring-purple-400"
                    : "bg-gradient-to-r from-teal-500 to-purple-600 text-white shadow-md scale-[1.02] focus:ring-purple-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-300/50 dark:hover:bg-gray-700/50 hover:scale-[1.01]"
              }
            `}
          >
            {segment.label}
          </button>
        );
      })}
      <span className="sr-only" aria-live="polite">
        {mode === "timeline"
          ? "Timeline mode active"
          : mode === "crimeline"
          ? "Crimeline mode active"
          : "Both modes active"}
      </span>
    </div>
  );
}
