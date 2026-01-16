"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModeStore } from "@/store/mode-store";
import { isMobile } from "@/lib/utils";

interface StickyFilterButtonProps {
  isFilterVisible: boolean;
  activeFilterCount: number;
  onScrollToTop: () => void;
}

export function StickyFilterButton({
  isFilterVisible,
  activeFilterCount,
  onScrollToTop,
}: StickyFilterButtonProps) {
  const { mode, sortOrder, toggleSortOrder } = useModeStore();
  const isCrimeline = mode === "crimeline";
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    setIsMobileDevice(isMobile());
    const handleResize = () => setIsMobileDevice(isMobile());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Only show on mobile when filter is hidden
  if (!isMobileDevice || isFilterVisible) {
    return null;
  }

  const handleClick = () => {
    onScrollToTop();
    // Small delay to ensure scroll completes before filter panel expands
    setTimeout(() => {
      // Trigger filter panel expansion by dispatching a custom event
      // The SearchFilter component will listen for this
      window.dispatchEvent(new CustomEvent("expandFilters"));
    }, 300);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2"
      >
        {/* Sort Toggle Button */}
        <button
          onClick={toggleSortOrder}
          aria-label={`Sort by ${sortOrder === "asc" ? "oldest" : "newest"} first`}
          className={`neo-brutalist-btn flex items-center justify-center w-12 h-12 rounded-lg text-sm ${
            isCrimeline
              ? "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
              : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${
              sortOrder === "desc" ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
            />
          </svg>
        </button>

        {/* Filter Button */}
        <button
          onClick={handleClick}
          aria-label={`Show filters${activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ""}`}
          className={`neo-brutalist-btn relative flex items-center justify-center w-12 h-12 rounded-lg text-sm ${
            activeFilterCount > 0
              ? isCrimeline
                ? "bg-purple-900/50 border-purple-600 text-purple-300"
                : "bg-teal-100 border-teal-400 text-teal-700"
              : isCrimeline
              ? "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
              : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          {activeFilterCount > 0 && (
            <span
              className={`absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full ${
                isCrimeline ? "bg-purple-500 text-white" : "bg-teal-500 text-white"
              }`}
            >
              {activeFilterCount}
            </span>
          )}
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
