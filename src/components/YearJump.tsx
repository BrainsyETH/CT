"use client";

import { useModeStore } from "@/store/mode-store";

interface YearJumpProps {
  years: number[];
}

export function YearJump({ years }: YearJumpProps) {
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
          ? "bg-gray-900/80 border border-red-900/30"
          : "bg-white/80 border border-gray-200"
      } backdrop-blur-sm`}
      aria-label="Jump to year"
    >
      <span
        className={`text-xs font-bold uppercase tracking-wider mb-2 transition-colors duration-300 ${
          isCrimeline ? "text-red-400" : "text-teal-600"
        }`}
      >
        Years
      </span>
      {years.map((year) => (
        <button
          key={year}
          onClick={() => scrollToYear(year)}
          className={`px-3 py-1.5 text-sm font-medium rounded transition-all duration-200 text-left ${
            isCrimeline
              ? "text-gray-400 hover:text-white hover:bg-red-900/50"
              : "text-gray-600 hover:text-gray-900 hover:bg-teal-100"
          }`}
        >
          {year}
        </button>
      ))}
    </nav>
  );
}
