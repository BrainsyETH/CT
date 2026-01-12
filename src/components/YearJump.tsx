"use client";

import { useModeStore } from "@/store/mode-store";

interface YearJumpProps {
  years: number[];
  currentYear?: number | null;
}

export function YearJump({ years, currentYear }: YearJumpProps) {
  const { mode } = useModeStore();
  const isCrimeline = mode === "crimeline";

  const scrollToYear = (year: number) => {
    const element = document.getElementById(`year-${year}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav
      className={`hidden lg:flex flex-col gap-1 p-4 rounded-xl transition-colors duration-300 ${
        isCrimeline
          ? "bg-gray-900/80 border-2 border-purple-900/40 shadow-[4px_4px_0_rgba(124,58,237,0.35)]"
          : "soft-card"
      } backdrop-blur-sm`}
      aria-label="Jump to year"
    >
      <span
        className={`text-xs font-bold uppercase tracking-wider mb-2 transition-colors duration-300 data-label ${
          isCrimeline ? "text-purple-400" : "text-[color:var(--sage)]"
        }`}
      >
        Years
      </span>
      {years.map((year) => {
        const isActive = year === currentYear;
        return (
          <button
            key={year}
            onClick={() => scrollToYear(year)}
            aria-current={isActive ? "true" : undefined}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 text-left ${
              isActive
                ? isCrimeline
                  ? "bg-purple-900/70 text-purple-300 border-l-2 border-purple-500"
                  : "bg-[color:var(--oatmeal)] text-[color:var(--ink)] border-l-2 border-[color:var(--sage)]"
                : isCrimeline
                ? "text-gray-400 hover:text-white hover:bg-purple-900/50"
                : "text-[color:var(--muted)] hover:text-[color:var(--ink)] hover:bg-[color:var(--oatmeal)]"
            }`}
          >
            {year}
          </button>
        );
      })}
    </nav>
  );
}
