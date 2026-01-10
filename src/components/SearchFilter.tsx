"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModeStore } from "@/store/mode-store";
import type { EventTag } from "@/lib/types";

const ALL_TAGS: EventTag[] = [
  "TECH",
  "ECONOMIC",
  "REGULATORY",
  "CULTURAL",
  "SECURITY",
  "FAILURE",
  "MILESTONE",
  "ATH",
];

export function SearchFilter() {
  const {
    mode,
    searchQuery,
    setSearchQuery,
    selectedTags,
    toggleTag,
    clearAllFilters,
    sortOrder,
    toggleSortOrder,
  } = useModeStore();

  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const isCrimeline = mode === "crimeline";
  const activeFilterCount = selectedTags.length + (searchQuery.trim() ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div
      className={`rounded-2xl p-3 sm:p-4 transition-colors duration-300 border-2 ${
        isCrimeline
          ? "bg-gray-900/80 border-red-900/50"
          : "bg-[#fffaf2] border-[#1f1f1f]/20"
      }`}
    >
      {/* Main Controls Row */}
      <div className="flex items-center gap-2">
        {/* Search Input */}
        <div className="flex-1 relative min-w-0">
          <svg
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
              isCrimeline ? "text-gray-500" : "text-gray-400"
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search events"
            className={`w-full pl-9 pr-8 py-2 rounded-xl text-sm transition-colors duration-300 border-2 ${
              isCrimeline
                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-red-500"
                : "bg-white border-[#1f1f1f]/30 text-gray-900 placeholder-gray-400 focus:border-[#2fb7a0]"
            } focus:outline-none focus:ring-1 ${
              isCrimeline ? "focus:ring-red-500" : "focus:ring-[#2fb7a0]"
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-0.5 ${
                isCrimeline
                  ? "text-gray-500 hover:text-gray-300"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Sort Toggle - Compact on mobile */}
        <button
          onClick={toggleSortOrder}
          aria-label={`Sort by ${sortOrder === "asc" ? "oldest" : "newest"} first`}
          className={`flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-300 whitespace-nowrap border-2 ${
            isCrimeline
              ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
              : "bg-white border-[#1f1f1f]/20 text-gray-800 hover:bg-[#eafaf6]"
          }`}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
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
          <span className="hidden sm:inline">{sortOrder === "asc" ? "Oldest" : "Newest"}</span>
        </button>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
          aria-expanded={isFiltersExpanded}
          aria-label={`${isFiltersExpanded ? "Hide" : "Show"} filters${activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ""}`}
          className={`relative flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-300 border-2 ${
            isFiltersExpanded || hasActiveFilters
              ? isCrimeline
                ? "bg-red-900/50 border-red-800 text-red-300"
                : "bg-[#d6f4ee] border-[#2fb7a0] text-[#1f1f1f]"
              : isCrimeline
              ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
              : "bg-white border-[#1f1f1f]/20 text-gray-800 hover:bg-[#eafaf6]"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="hidden sm:inline">Filter</span>
          {activeFilterCount > 0 && (
            <span
              className={`absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full ${
                isCrimeline
                  ? "bg-red-500 text-white"
                  : "bg-[#2fb7a0] text-white"
              }`}
            >
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Clear All - Only on larger screens when filters active */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            aria-label="Clear all filters"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-300 border-2 ${
              isCrimeline
                ? "bg-red-900/50 border-red-800 text-red-300 hover:bg-red-900/70"
                : "bg-[#d6f4ee] border-[#2fb7a0] text-[#1f1f1f] hover:bg-[#bdece1]"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        )}
      </div>

      {/* Expandable Filter Section */}
      <AnimatePresence>
        {isFiltersExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
              {/* Tag Filters */}
              <div className="flex flex-wrap gap-2 items-center">
                <span
                  className={`text-xs font-medium ${
                    isCrimeline ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Tags:
                </span>
                {ALL_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      aria-pressed={isSelected}
                      className={`px-2 py-1 text-xs font-medium rounded-md transition-all duration-200 border-2 ${
                        isSelected
                          ? isCrimeline
                            ? "bg-red-900 text-red-200 border-red-700"
                            : "bg-[#2fb7a0] text-white border-[#2fb7a0]"
                          : isCrimeline
                          ? "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600"
                          : "bg-white text-gray-700 border-[#1f1f1f]/20 hover:border-[#1f1f1f]/40"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              {/* Active Filters Summary & Clear on Mobile */}
              {hasActiveFilters && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span
                      className={`text-xs font-medium ${
                        isCrimeline ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      Active:
                    </span>

                    {/* Search Query Chip */}
                    {searchQuery.trim() && (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border-2 ${
                          isCrimeline
                            ? "bg-gray-800 text-gray-300 border-gray-700"
                            : "bg-white text-gray-700 border-[#1f1f1f]/30"
                        }`}
                      >
                        &quot;{searchQuery}&quot;
                        <button
                          onClick={() => setSearchQuery("")}
                          aria-label={`Remove search filter: ${searchQuery}`}
                          className={`ml-0.5 p-0.5 rounded-full hover:bg-opacity-20 ${
                            isCrimeline ? "hover:bg-red-500" : "hover:bg-[#2fb7a0]"
                          }`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )}

                    {/* Tag Chips */}
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border-2 ${
                          isCrimeline
                            ? "bg-red-900/50 text-red-300 border-red-800"
                            : "bg-[#d6f4ee] text-[#1f1f1f] border-[#2fb7a0]"
                        }`}
                      >
                        {tag}
                        <button
                          onClick={() => toggleTag(tag)}
                          aria-label={`Remove ${tag} filter`}
                          className={`ml-0.5 p-0.5 rounded-full hover:bg-opacity-20 ${
                            isCrimeline ? "hover:bg-red-500" : "hover:bg-[#2fb7a0]"
                          }`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}

                    {/* Clear All - Mobile */}
                    <button
                      onClick={clearAllFilters}
                      className={`sm:hidden ml-auto px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                        isCrimeline
                          ? "text-red-400 hover:bg-red-900/30"
                          : "text-[#2fb7a0] hover:bg-[#eafaf6]"
                      }`}
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
