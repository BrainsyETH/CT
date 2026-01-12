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
      className={`hidden lg:flex flex-col gap-1 p-3 rounded-lg transition-colors duration-300 ${
        isCrimeline
          ? "bg-gray-900/80 border-2 border-purple-900/40 shadow-[4px_4px_0_rgba(124,58,237,0.35)]"
          : "bg-white/80 border-2 border-gray-200 shadow-[4px_4px_0_rgba(15,23,42,0.12)]"
      } backdrop-blur-sm`}
      aria-label="Jump to year"
    >
      <span
        className={`text-xs font-bold uppercase tracking-wider mb-2 transition-colors duration-300 ${
          isCrimeline ? "text-purple-400" : "text-teal-600"
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
            className={`px-3 py-1.5 text-sm font-medium rounded transition-all duration-200 text-left ${
              isActive
                ? isCrimeline
                  ? "bg-purple-900/70 text-purple-300 border-l-2 border-purple-500"
                  : "bg-teal-100 text-teal-700 border-l-2 border-teal-500"
                : isCrimeline
                ? "text-gray-400 hover:text-white hover:bg-purple-900/50"
                : "text-gray-600 hover:text-gray-900 hover:bg-teal-100"
            }`}
          >
            {year}
          </button>
        );
      })}
    </nav>
  );
}
