"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModeStore } from "@/store/mode-store";

interface MobileYearSelectorProps {
  years: number[];
  currentYear: number | null;
}

export function MobileYearSelector({ years, currentYear }: MobileYearSelectorProps) {
  const { mode } = useModeStore();
  const [isOpen, setIsOpen] = useState(false);
  const isCrimeline = mode === "crimeline";

  const scrollToYear = (year: number) => {
    const element = document.getElementById(`year-${year}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsOpen(false);
  };

  return (
    <div className="relative z-30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-300 border-2 ${
          isCrimeline
            ? "bg-gray-900 border-red-900/50 text-gray-300"
            : "bg-[#fffaf2] border-[#1f1f1f]/20 text-gray-800"
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="tabular-nums">{currentYear || "Year"}</span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99]"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`absolute top-full left-0 mt-2 w-48 max-h-64 overflow-y-auto rounded-xl shadow-lg z-[100] border-2 ${
                isCrimeline
                  ? "bg-gray-900 border-red-900/50"
                  : "bg-[#fffaf2] border-[#1f1f1f]/20"
              }`}
            >
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => scrollToYear(year)}
                  className={`w-full px-4 py-2 text-left text-sm font-medium transition-colors duration-200 ${
                    year === currentYear
                      ? isCrimeline
                        ? "bg-red-900/50 text-red-300"
                        : "bg-[#d6f4ee] text-[#1f1f1f]"
                      : isCrimeline
                      ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                      : "text-gray-700 hover:bg-[#eafaf6] hover:text-gray-900"
                  }`}
                >
                  {year}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
