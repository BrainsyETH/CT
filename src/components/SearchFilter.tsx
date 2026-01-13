"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModeStore } from "@/store/mode-store";
import type { EventTag, CrimelineType } from "@/lib/types";

// Classic Twitter Bird Icon
function TwitterBirdIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
    </svg>
  );
}

// ZachXBT Icon
function ZachXBTIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M 161.522 85.792 L 161.522 116.72 L 220.034 116.72 L 220.034 85.792 L 247.69 85.792 L 247.69 116.72 L 300.166 116.72 L 300.166 138.918 L 247.69 138.918 L 247.69 171.656 L 220.034 171.656 L 220.034 138.918 L 161.522 138.918 L 161.522 171.656 L 133.866 171.656 L 133.866 116.72 L 102.938 116.72 L 102.938 171.656 L 75.282 171.656 L 75.282 116.72 L 75.282 94.522 L 133.866 94.522 L 133.866 85.792 Z M 324.718 171.656 L 324.718 193.854 L 300.166 193.854 L 300.166 171.656 Z M 75.282 193.854 L 102.938 193.854 L 102.938 226.592 L 161.522 226.592 L 161.522 193.854 L 220.034 193.854 L 220.034 259.33 L 300.166 259.33 L 300.166 215.98 L 247.69 215.98 L 247.69 193.854 L 324.718 193.854 L 324.718 281.528 L 220.034 281.528 L 220.034 248.718 L 161.522 248.718 L 161.522 281.528 L 133.866 281.528 L 133.866 248.718 L 102.938 248.718 L 102.938 281.528 L 75.282 281.528 Z M 247.69 281.528 L 247.69 314.266 L 220.034 314.266 L 220.034 281.528 Z" />
    </svg>
  );
}

// Premium categories that get special styling
const PREMIUM_CATEGORIES = ["CT Lore", "ZachXBT"];

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

const ALL_CATEGORIES = [
  "CT Lore",
  "ZachXBT",
  "Bitcoin",
  "Centralized Exchange",
  "Memecoins",
  "DeFi Protocol",
  "DeFi",
  "Market Structure",
  "Ethereum",
  "Lending",
  "Regulation",
  "Bull Runs",
  "Dances",
  "NFTs",
  "Bridge",
  "Culture",
  "Wallet/Key Compromise",
  "Security",
  "Stablecoin",
  "Privacy",
  "Scam",
  "Other",
  "ETFs",
];

const ALL_CRIMELINE_TYPES: CrimelineType[] = [
  "EXCHANGE HACK",
  "PROTOCOL EXPLOIT",
  "BRIDGE HACK",
  "ORACLE MANIPULATION",
  "RUG PULL",
  "FRAUD",
  "CUSTODY FAILURE",
  "LEVERAGE COLLAPSE",
  "GOVERNANCE ATTACK",
  "REGULATORY SEIZURE",
  "SOCIAL MEDIA HACK",
  "OTHER",
];

export function SearchFilter() {
  const {
    mode,
    searchQuery,
    setSearchQuery,
    selectedTags,
    toggleTag,
    selectedCategories,
    toggleCategory,
    selectedCrimelineTypes,
    toggleCrimelineType,
    clearAllFilters,
    sortOrder,
    toggleSortOrder,
  } = useModeStore();

  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const isCrimeline = mode === "crimeline";
  const showCrimelineTypes = mode === "crimeline" || mode === "both";

  const activeFilterCount =
    selectedTags.length +
    selectedCategories.length +
    selectedCrimelineTypes.length +
    (searchQuery.trim() ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return ALL_CATEGORIES;
    const query = categorySearch.toLowerCase();
    return ALL_CATEGORIES.filter((cat) =>
      cat.toLowerCase().includes(query)
    );
  }, [categorySearch]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div
      className={`rounded-lg p-3 sm:p-4 transition-colors duration-300 ${
        isCrimeline
          ? "bg-gray-900/80 border-2 border-purple-900/40 shadow-[4px_4px_0_rgba(124,58,237,0.35)]"
          : "bg-white border-2 border-gray-200 shadow-[4px_4px_0_rgba(15,23,42,0.12)]"
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
            className={`w-full pl-9 pr-8 py-2 rounded-lg text-sm transition-colors duration-300 ${
              isCrimeline
                ? "bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500"
                : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500"
            } focus:outline-none focus:ring-1 ${
              isCrimeline ? "focus:ring-purple-500" : "focus:ring-teal-500"
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
          className={`flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300 whitespace-nowrap ${
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
          <span className="hidden sm:inline">{sortOrder === "asc" ? "Oldest" : "Newest"}</span>
        </button>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
          aria-expanded={isFiltersExpanded}
          aria-label={`${isFiltersExpanded ? "Hide" : "Show"} filters${activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ""}`}
          className={`relative flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
            isFiltersExpanded || hasActiveFilters
              ? isCrimeline
                ? "bg-purple-900/50 border border-purple-800 text-purple-300"
                : "bg-teal-100 border border-teal-300 text-teal-700"
              : isCrimeline
              ? "bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700"
              : "bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100"
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
                  ? "bg-purple-500 text-white"
                  : "bg-teal-500 text-white"
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
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
              isCrimeline
                ? "bg-purple-900/50 border border-purple-800 text-purple-300 hover:bg-purple-900/70"
                : "bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100"
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
            <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
              {/* Tags Section */}
              <div>
                <button
                  onClick={() => toggleSection("tags")}
                  className={`flex items-center justify-between w-full text-left text-sm font-medium mb-2 ${
                    isCrimeline ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    Tags
                    {selectedTags.length > 0 && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          isCrimeline
                            ? "bg-purple-900/50 text-purple-300"
                            : "bg-teal-100 text-teal-700"
                        }`}
                      >
                        {selectedTags.length}
                      </span>
                    )}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      expandedSection === "tags" ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence>
                  {expandedSection === "tags" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap gap-2">
                        {ALL_TAGS.map((tag) => {
                          const isSelected = selectedTags.includes(tag);
                          return (
                            <button
                              key={tag}
                              onClick={() => toggleTag(tag)}
                              aria-pressed={isSelected}
                              className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                                isSelected
                                  ? isCrimeline
                                    ? "bg-purple-900 text-purple-200 border border-purple-700"
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Categories Section */}
              <div>
                <button
                  onClick={() => toggleSection("categories")}
                  className={`flex items-center justify-between w-full text-left text-sm font-medium mb-2 ${
                    isCrimeline ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    Categories
                    {selectedCategories.length > 0 && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          isCrimeline
                            ? "bg-purple-900/50 text-purple-300"
                            : "bg-teal-100 text-teal-700"
                        }`}
                      >
                        {selectedCategories.length}
                      </span>
                    )}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      expandedSection === "categories" ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence>
                  {expandedSection === "categories" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2">
                        {/* Category Search */}
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search categories..."
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            className={`w-full px-3 py-1.5 text-xs rounded-md transition-colors ${
                              isCrimeline
                                ? "bg-gray-800 border border-gray-700 text-white placeholder-gray-500"
                                : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400"
                            } focus:outline-none focus:ring-1 ${
                              isCrimeline ? "focus:ring-purple-500" : "focus:ring-teal-500"
                            }`}
                          />
                        </div>
                        {/* Category List - Max height with scroll */}
                        <div className="max-h-48 overflow-y-auto flex flex-wrap gap-2">
                          {filteredCategories.map((category) => {
                            const isSelected = selectedCategories.includes(category);
                            const isPremium = PREMIUM_CATEGORIES.includes(category);
                            const isCtLore = category === "CT Lore";
                            const isZachXBT = category === "ZachXBT";

                            // CT Lore gets light blue styling
                            const ctLoreStyles = isCtLore
                              ? isSelected
                                ? "bg-sky-100 text-sky-900 border-2 border-emerald-400 shadow-[0_0_0_1px_rgb(20,184,166),0_0_12px_rgba(16,185,129,0.6)]"
                                : "bg-sky-100 text-sky-700 border border-sky-200 hover:bg-sky-200"
                              : "";

                            // ZachXBT gets blackish/gray styling
                            const zachStyles = isZachXBT
                              ? isSelected
                                ? "bg-gray-900 text-white border-2 border-emerald-400 shadow-[0_0_0_1px_rgb(20,184,166),0_0_12px_rgba(16,185,129,0.6)]"
                                : "bg-gray-800 text-gray-100 border border-gray-600 hover:bg-gray-700"
                              : "";

                            return (
                              <button
                                key={category}
                                onClick={() => toggleCategory(category)}
                                aria-pressed={isSelected}
                                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                                  isCtLore
                                    ? ctLoreStyles
                                    : isZachXBT
                                      ? zachStyles
                                      : isSelected
                                        ? isCrimeline
                                          ? "bg-purple-900 text-purple-200 border border-purple-700"
                                          : "bg-teal-500 text-white border border-teal-600"
                                        : isCrimeline
                                          ? "bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600"
                                          : "bg-gray-100 text-gray-600 border border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                {isCtLore && <TwitterBirdIcon className="w-3 h-3" />}
                                {isZachXBT && <ZachXBTIcon className="w-3 h-3" />}
                                {category}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Crimeline Types Section - Only show in crimeline or both mode */}
              {showCrimelineTypes && (
                <div>
                  <button
                    onClick={() => toggleSection("crimelineTypes")}
                    className={`flex items-center justify-between w-full text-left text-sm font-medium mb-2 ${
                      isCrimeline ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      Incident Types
                      {selectedCrimelineTypes.length > 0 && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            isCrimeline
                              ? "bg-purple-900/50 text-purple-300"
                              : "bg-teal-100 text-teal-700"
                          }`}
                        >
                          {selectedCrimelineTypes.length}
                        </span>
                      )}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        expandedSection === "crimelineTypes" ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <AnimatePresence>
                    {expandedSection === "crimelineTypes" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-wrap gap-2">
                          {ALL_CRIMELINE_TYPES.map((type) => {
                            const isSelected = selectedCrimelineTypes.includes(type);
                            return (
                              <button
                                key={type}
                                onClick={() => toggleCrimelineType(type)}
                                aria-pressed={isSelected}
                                className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                                isSelected
                                  ? isCrimeline
                                      ? "bg-purple-900 text-purple-200 border border-purple-700"
                                      : "bg-teal-500 text-white border border-teal-600"
                                    : isCrimeline
                                    ? "bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600"
                                    : "bg-gray-100 text-gray-600 border border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                {type}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

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
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                          isCrimeline
                            ? "bg-gray-800 text-gray-300 border border-gray-700"
                            : "bg-gray-100 text-gray-700 border border-gray-300"
                        }`}
                      >
                        &quot;{searchQuery}&quot;
                        <button
                          onClick={() => setSearchQuery("")}
                          aria-label={`Remove search filter: ${searchQuery}`}
                          className={`ml-0.5 p-0.5 rounded-full hover:bg-opacity-20 ${
                            isCrimeline ? "hover:bg-purple-500" : "hover:bg-teal-500"
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
                              ? "bg-purple-900/50 text-purple-300 border border-purple-800"
                              : "bg-teal-100 text-teal-700 border border-teal-300"
                          }`}
                        >
                        {tag}
                        <button
                          onClick={() => toggleTag(tag)}
                          aria-label={`Remove ${tag} filter`}
                          className={`ml-0.5 p-0.5 rounded-full hover:bg-opacity-20 ${
                            isCrimeline ? "hover:bg-purple-500" : "hover:bg-teal-500"
                          }`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}

                    {/* Category Chips */}
                    {selectedCategories.map((category) => {
                      const isCtLore = category === "CT Lore";
                      const isZachXBT = category === "ZachXBT";

                      return (
                        <span
                          key={category}
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                            isCtLore
                              ? "bg-sky-100 text-sky-700 border border-sky-300"
                              : isZachXBT
                                ? "bg-gray-800 text-gray-100 border border-gray-600"
                                : isCrimeline
                                  ? "bg-purple-900/50 text-purple-300 border border-purple-800"
                                  : "bg-teal-100 text-teal-700 border border-teal-300"
                          }`}
                        >
                          {isCtLore && <TwitterBirdIcon className="w-3 h-3" />}
                          {isZachXBT && <ZachXBTIcon className="w-3 h-3" />}
                          {category}
                          <button
                            onClick={() => toggleCategory(category)}
                            aria-label={`Remove ${category} filter`}
                            className={`ml-0.5 p-0.5 rounded-full hover:bg-opacity-20 ${
                              isCtLore ? "hover:bg-sky-500" : isZachXBT ? "hover:bg-gray-500" : isCrimeline ? "hover:bg-purple-500" : "hover:bg-teal-500"
                            }`}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      );
                    })}

                    {/* Crimeline Type Chips */}
                    {selectedCrimelineTypes.map((type) => (
                      <span
                        key={type}
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                            isCrimeline
                              ? "bg-purple-900/50 text-purple-300 border border-purple-800"
                              : "bg-teal-100 text-teal-700 border border-teal-300"
                          }`}
                        >
                        {type}
                        <button
                          onClick={() => toggleCrimelineType(type)}
                          aria-label={`Remove ${type} filter`}
                          className={`ml-0.5 p-0.5 rounded-full hover:bg-opacity-20 ${
                            isCrimeline ? "hover:bg-purple-500" : "hover:bg-teal-500"
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
                          ? "text-purple-400 hover:bg-purple-900/30"
                          : "text-teal-600 hover:bg-teal-50"
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
