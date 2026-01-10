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
      className={`hidden lg:flex flex-col gap-1 p-3 rounded-xl transition-colors duration-300 border-2 ${
        isCrimeline
          ? "bg-gray-900/80 border-red-900/50"
          : "bg-[#fffaf2]/90 border-[#1f1f1f]/20"
      } backdrop-blur-sm`}
      aria-label="Jump to year"
    >
      <span
        className={`text-xs font-bold uppercase tracking-wider mb-2 transition-colors duration-300 ${
          isCrimeline ? "text-red-400" : "text-[#2fb7a0]"
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
                  ? "bg-red-900/70 text-red-300 border-l-2 border-red-500"
                  : "bg-[#d6f4ee] text-[#1f1f1f] border-l-2 border-[#2fb7a0]"
                : isCrimeline
                ? "text-gray-400 hover:text-white hover:bg-red-900/50"
                : "text-gray-700 hover:text-gray-900 hover:bg-[#eafaf6]"
            }`}
          >
            {year}
          </button>
        );
      })}
    </nav>
  );
}
