"use client";

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

interface SearchFilterProps {
  isSticky?: boolean;
}

export function SearchFilter({ isSticky = false }: SearchFilterProps) {
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

  const isCrimeline = mode === "crimeline";
  const hasActiveFilters = searchQuery.trim() || selectedTags.length > 0 || sortOrder !== "asc";

  return (
    <div
      className={`rounded-lg p-4 transition-colors duration-300 ${
        isCrimeline
          ? "bg-gray-900/80 border border-red-900/30"
          : "bg-white border border-gray-200"
      } ${isSticky ? "shadow-lg backdrop-blur-sm" : ""}`}
    >
      {/* Search and Sort Row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search Input */}
        <div className="flex-1 relative">
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
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search events"
            className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm transition-colors duration-300 ${
              isCrimeline
                ? "bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-red-500"
                : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500"
            } focus:outline-none focus:ring-1 ${
              isCrimeline ? "focus:ring-red-500" : "focus:ring-teal-500"
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${
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

        {/* Sort Toggle */}
        <button
          onClick={toggleSortOrder}
          aria-label={`Sort by ${sortOrder === "asc" ? "oldest" : "newest"} first`}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
            isCrimeline
              ? "bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700"
              : "bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100"
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
          {sortOrder === "asc" ? "Oldest First" : "Newest First"}
        </button>

        {/* Clear All Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            aria-label="Clear all filters"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
              isCrimeline
                ? "bg-red-900/50 border border-red-800 text-red-300 hover:bg-red-900/70"
                : "bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear all
          </button>
        )}
      </div>

      {/* Tag Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span
          className={`text-xs font-medium ${
            isCrimeline ? "text-gray-500" : "text-gray-400"
          }`}
        >
          Filter:
        </span>
        {ALL_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              aria-pressed={isSelected}
              className={`px-2 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                isSelected
                  ? isCrimeline
                    ? "bg-red-900 text-red-200 border border-red-700"
                    : "bg-teal-500 text-white border border-teal-600"
                  : isCrimeline
                  ? "bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600"
                  : "bg-gray-100 text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t flex flex-wrap gap-2 items-center border-gray-200 dark:border-gray-700">
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
              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                isCrimeline
                  ? "bg-gray-800 text-gray-300 border border-gray-700"
                  : "bg-gray-100 text-gray-700 border border-gray-300"
              }`}
            >
              Search: &quot;{searchQuery}&quot;
              <button
                onClick={() => setSearchQuery("")}
                aria-label={`Remove search filter: ${searchQuery}`}
                className={`ml-1 p-0.5 rounded-full hover:bg-opacity-20 ${
                  isCrimeline ? "hover:bg-red-500" : "hover:bg-teal-500"
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
              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                isCrimeline
                  ? "bg-red-900/50 text-red-300 border border-red-800"
                  : "bg-teal-100 text-teal-700 border border-teal-300"
              }`}
            >
              {tag}
              <button
                onClick={() => toggleTag(tag)}
                aria-label={`Remove ${tag} filter`}
                className={`ml-1 p-0.5 rounded-full hover:bg-opacity-20 ${
                  isCrimeline ? "hover:bg-red-500" : "hover:bg-teal-500"
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}

          {/* Sort Order Chip (only if not default) */}
          {sortOrder !== "asc" && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                isCrimeline
                  ? "bg-gray-800 text-gray-300 border border-gray-700"
                  : "bg-gray-100 text-gray-700 border border-gray-300"
              }`}
            >
              Newest First
              <button
                onClick={toggleSortOrder}
                aria-label="Reset to oldest first"
                className={`ml-1 p-0.5 rounded-full hover:bg-opacity-20 ${
                  isCrimeline ? "hover:bg-red-500" : "hover:bg-teal-500"
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
