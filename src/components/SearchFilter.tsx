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

export function SearchFilter() {
  const {
    mode,
    searchQuery,
    setSearchQuery,
    selectedTags,
    toggleTag,
    clearTags,
    sortOrder,
    toggleSortOrder,
  } = useModeStore();

  const isCrimeline = mode === "crimeline";

  return (
    <div
      className={`rounded-lg p-4 mb-6 transition-colors duration-300 ${
        isCrimeline
          ? "bg-gray-900/80 border border-red-900/30"
          : "bg-white border border-gray-200"
      }`}
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
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                isCrimeline
                  ? "text-gray-500 hover:text-gray-300"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Sort Toggle */}
        <button
          onClick={toggleSortOrder}
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
      </div>

      {/* Tag Filters */}
      <div className="flex flex-wrap gap-2">
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
        {selectedTags.length > 0 && (
          <button
            onClick={clearTags}
            className={`px-2 py-1 text-xs font-medium transition-colors duration-200 ${
              isCrimeline
                ? "text-red-400 hover:text-red-300"
                : "text-teal-600 hover:text-teal-500"
            }`}
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
