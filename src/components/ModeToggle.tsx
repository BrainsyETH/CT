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
      className={`inline-flex ${compact ? 'gap-1 p-0.5' : 'gap-1.5 p-1'} rounded-full border transition-colors duration-300 ${
        isCrimelineMode
          ? "bg-gray-900 border-gray-700 shadow-[2px_2px_0_rgba(124,58,237,0.35)]"
          : "bg-[color:var(--white)] border-[color:var(--clay)] shadow-sm"
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
              font-medium rounded-full
              transition-all duration-300 ease-out
              focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[color:var(--white)]
              ${
                isActive
                  ? isTimeline
                    ? "bg-[color:var(--ink)] text-[color:var(--white)] shadow-md scale-[1.02] focus:ring-[color:var(--sage)]"
                    : isCrimeline
                    ? "bg-purple-600 text-white shadow-md scale-[1.02] focus:ring-purple-400"
                    : "bg-[color:var(--sage)] text-[color:var(--white)] shadow-md scale-[1.02] focus:ring-[color:var(--sage)]"
                  : "text-[color:var(--ink)] hover:bg-[color:var(--oatmeal)] hover:scale-[1.01]"
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
