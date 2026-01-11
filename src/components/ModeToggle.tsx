"use client";

import { useModeStore } from "@/store/mode-store";
import type { Mode } from "@/lib/types";

interface ModeToggleProps {
  compact?: boolean;
}

export function ModeToggle({ compact = false }: ModeToggleProps) {
  const { mode, setMode } = useModeStore();

  const segments: { value: Mode; label: string }[] = [
    { value: "timeline", label: "Timeline" },
    { value: "crimeline", label: "Crimeline" },
    { value: "both", label: "Both" },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Select view mode"
      className={`inline-flex rounded-lg ${compact ? 'p-0.5' : 'p-1'} bg-gray-200 dark:bg-gray-800`}
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
              ${compact ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm'} font-medium rounded-md transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-200 dark:focus:ring-offset-gray-800
              ${
                isActive
                  ? isTimeline
                    ? "bg-teal-500 text-white shadow-md focus:ring-teal-400"
                    : isCrimeline
                    ? "bg-red-600 text-white shadow-md focus:ring-red-400"
                    : "bg-gradient-to-r from-teal-500 to-red-600 text-white shadow-md focus:ring-purple-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
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
