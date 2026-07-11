"use client";

import { useRef, useEffect } from "react";
import { useModeStore } from "@/store/mode-store";

interface MobileYearSelectorProps {
  years: number[];
  currentYear: number | null;
  onJump: (year: number) => void;
}

export function MobileYearSelector({ years, currentYear, onJump }: MobileYearSelectorProps) {
  const { mode } = useModeStore();
  const isCrimeline = mode === "crimeline";
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll active year into view
  useEffect(() => {
    if (!currentYear || !scrollRef.current) return;
    const activeBtn = scrollRef.current.querySelector(`[data-year="${currentYear}"]`) as HTMLElement;
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [currentYear]);

  // Nothing to scrub when filters produce no results - don't render an empty bar
  if (years.length === 0) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t backdrop-blur-md transition-colors duration-300 ${
        isCrimeline
          ? "bg-gray-950/95 border-purple-900/40"
          : "bg-white/95 border-gray-200"
      }`}
    >
      <div
        ref={scrollRef}
        className="year-scrubber flex items-center gap-1 px-3 py-2 overflow-x-auto"
      >
        {years.map((year) => {
          const isActive = year === currentYear;
          return (
            <button
              key={year}
              data-year={year}
              onClick={() => {
                onJump(year);
                // Haptic feedback
                if (typeof navigator !== "undefined" && "vibrate" in navigator) {
                  navigator.vibrate(10);
                }
              }}
              className={`flex-none px-3 py-1.5 text-xs font-bold rounded-full transition-all duration-200 ${
                isActive
                  ? isCrimeline
                    ? "bg-purple-600 text-white shadow-[0_0_8px_rgba(124,58,237,0.5)]"
                    : "bg-teal-500 text-white shadow-[0_0_8px_rgba(20,184,166,0.5)]"
                  : isCrimeline
                  ? "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
                  : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {year}
            </button>
          );
        })}
      </div>
    </div>
  );
}
