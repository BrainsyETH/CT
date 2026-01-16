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
    { value: "both", label: "All" },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Select view mode"
      className={`neo-brutalist-toggle ${
        isCrimelineMode ? "neo-brutalist-toggle-crimeline" : ""
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
              neo-brutalist-btn
              ${compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-1.5 text-sm'}
              rounded-md
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-1
              ${
                isActive
                  ? isTimeline
                    ? "neo-brutalist-btn-timeline focus:ring-teal-400"
                    : isCrimeline
                    ? "neo-brutalist-btn-crimeline focus:ring-purple-400"
                    : "neo-brutalist-btn-both focus:ring-purple-400"
                  : "neo-brutalist-btn-inactive"
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
