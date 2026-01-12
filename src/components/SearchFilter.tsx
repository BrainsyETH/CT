"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModeStore } from "@/store/mode-store";
import type { EventTag, CrimelineType } from "@/lib/types";

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
  "Bitcoin",
  "CT Lore",
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
      className={`rounded-xl p-4 sm:p-5 transition-colors duration-300 ${
        isCrimeline
          ? "bg-gray-900/80 border-2 border-purple-900/40 shadow-[4px_4px_0_rgba(124,58,237,0.35)]"
          : "soft-card"
      }`}
    >
      {/* Main Controls Row */}
      <div className="flex items-center gap-2">
        {/* Search Input */}
        <div className="flex-1 relative min-w-0">
          <svg
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
              isCrimeline ? "text-gray-500" : "text-[color:var(--muted)]"
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
            className={`w-full pl-9 pr-8 py-2 rounded-full text-sm transition-colors duration-300 ${
              isCrimeline
                ? "bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500"
                : "bg-[color:var(--white)] border border-[color:var(--clay)] text-[color:var(--ink)] placeholder-[color:var(--muted)] focus:border-[color:var(--sage)]"
            } focus:outline-none focus:ring-1 ${
              isCrimeline ? "focus:ring-purple-500" : "focus:ring-[color:var(--sage)]"
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-0.5 ${
                isCrimeline
                  ? "text-gray-500 hover:text-gray-300"
                  : "text-[color:var(--muted)] hover:text-[color:var(--ink)]"
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
          className={`flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap hover:scale-[1.02] ${
            isCrimeline
              ? "bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700"
              : "bg-transparent border border-[color:var(--clay)] text-[color:var(--ink)] hover:bg-[color:var(--white)]"
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
          className={`relative flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-[1.02] ${
            isFiltersExpanded || hasActiveFilters
              ? isCrimeline
                ? "bg-purple-900/50 border border-purple-800 text-purple-300"
                : "bg-[color:var(--ink)] border border-[color:var(--ink)] text-[color:var(--white)]"
              : isCrimeline
              ? "bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700"
              : "bg-transparent border border-[color:var(--clay)] text-[color:var(--ink)] hover:bg-[color:var(--white)]"
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
                  : "bg-[color:var(--sage)] text-[color:var(--white)]"
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
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-[1.02] ${
              isCrimeline
                ? "bg-purple-900/50 border border-purple-800 text-purple-300 hover:bg-purple-900/70"
                : "bg-transparent border border-[color:var(--clay)] text-[color:var(--ink)] hover:bg-[color:var(--white)]"
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
            <div className="pt-4 mt-4 border-t border-[color:var(--clay)] dark:border-gray-700 space-y-4">
              {/* Tags Section */}
              <div>
                <button
                  onClick={() => toggleSection("tags")}
                  className={`flex items-center justify-between w-full text-left text-sm font-medium mb-2 ${
                    isCrimeline ? "text-gray-300" : "text-[color:var(--ink)]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    Tags
                    {selectedTags.length > 0 && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          isCrimeline
                            ? "bg-purple-900/50 text-purple-300"
                            : "bg-[color:var(--sage)] text-[color:var(--white)]"
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
                                    : "bg-[color:var(--ink)] text-[color:var(--white)] border border-[color:var(--ink)]"
                                  : isCrimeline
                                  ? "bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600"
                                  : "bg-[color:var(--white)] text-[color:var(--muted)] border border-[color:var(--clay)] hover:border-[color:var(--sage)]"
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
                    isCrimeline ? "text-gray-300" : "text-[color:var(--ink)]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    Categories
                    {selectedCategories.length > 0 && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          isCrimeline
                            ? "bg-purple-900/50 text-purple-300"
                            : "bg-[color:var(--sage)] text-[color:var(--white)]"
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
                            className={`w-full px-3 py-1.5 text-xs rounded-full transition-colors ${
                              isCrimeline
                                ? "bg-gray-800 border border-gray-700 text-white placeholder-gray-500"
                                : "bg-[color:var(--white)] border border-[color:var(--clay)] text-[color:var(--ink)] placeholder-[color:var(--muted)]"
                            } focus:outline-none focus:ring-1 ${
                              isCrimeline ? "focus:ring-purple-500" : "focus:ring-[color:var(--sage)]"
                            }`}
                          />
                        </div>
                        {/* Category List - Max height with scroll */}
                        <div className="max-h-48 overflow-y-auto flex flex-wrap gap-2">
                          {filteredCategories.map((category) => {
                            const isSelected = selectedCategories.includes(category);
                            return (
                              <button
                                key={category}
                                onClick={() => toggleCategory(category)}
                                aria-pressed={isSelected}
                                className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                                isSelected
                                  ? isCrimeline
                                      ? "bg-purple-900 text-purple-200 border border-purple-700"
                                      : "bg-[color:var(--ink)] text-[color:var(--white)] border border-[color:var(--ink)]"
                                    : isCrimeline
                                    ? "bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600"
                                    : "bg-[color:var(--white)] text-[color:var(--muted)] border border-[color:var(--clay)] hover:border-[color:var(--sage)]"
                                }`}
                              >
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
                      isCrimeline ? "text-gray-300" : "text-[color:var(--ink)]"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      Incident Types
                      {selectedCrimelineTypes.length > 0 && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            isCrimeline
                              ? "bg-purple-900/50 text-purple-300"
                              : "bg-[color:var(--sage)] text-[color:var(--white)]"
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
                                      : "bg-[color:var(--ink)] text-[color:var(--white)] border border-[color:var(--ink)]"
                                    : isCrimeline
                                    ? "bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600"
                                    : "bg-[color:var(--white)] text-[color:var(--muted)] border border-[color:var(--clay)] hover:border-[color:var(--sage)]"
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
                <div className="mt-4 pt-4 border-t border-[color:var(--clay)] dark:border-gray-700">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span
                      className={`text-xs font-medium ${
                        isCrimeline ? "text-gray-500" : "text-[color:var(--muted)]"
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
                            : "bg-[color:var(--white)] text-[color:var(--ink)] border border-[color:var(--clay)]"
                        }`}
                      >
                        &quot;{searchQuery}&quot;
                        <button
                          onClick={() => setSearchQuery("")}
                          aria-label={`Remove search filter: ${searchQuery}`}
                          className={`ml-0.5 p-0.5 rounded-full hover:bg-opacity-20 ${
                            isCrimeline ? "hover:bg-purple-500" : "hover:bg-[color:var(--sage)]"
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
                              : "bg-[color:var(--white)] text-[color:var(--ink)] border border-[color:var(--clay)]"
                          }`}
                        >
                        {tag}
                        <button
                          onClick={() => toggleTag(tag)}
                          aria-label={`Remove ${tag} filter`}
                          className={`ml-0.5 p-0.5 rounded-full hover:bg-opacity-20 ${
                            isCrimeline ? "hover:bg-purple-500" : "hover:bg-[color:var(--sage)]"
                          }`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}

                    {/* Category Chips */}
                    {selectedCategories.map((category) => (
                      <span
                        key={category}
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                            isCrimeline
                              ? "bg-purple-900/50 text-purple-300 border border-purple-800"
                              : "bg-[color:var(--white)] text-[color:var(--ink)] border border-[color:var(--clay)]"
                          }`}
                        >
                        {category}
                        <button
                          onClick={() => toggleCategory(category)}
                          aria-label={`Remove ${category} filter`}
                          className={`ml-0.5 p-0.5 rounded-full hover:bg-opacity-20 ${
                            isCrimeline ? "hover:bg-purple-500" : "hover:bg-[color:var(--sage)]"
                          }`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}

                    {/* Crimeline Type Chips */}
                    {selectedCrimelineTypes.map((type) => (
                      <span
                        key={type}
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                            isCrimeline
                              ? "bg-purple-900/50 text-purple-300 border border-purple-800"
                              : "bg-[color:var(--white)] text-[color:var(--ink)] border border-[color:var(--clay)]"
                          }`}
                        >
                        {type}
                        <button
                          onClick={() => toggleCrimelineType(type)}
                          aria-label={`Remove ${type} filter`}
                          className={`ml-0.5 p-0.5 rounded-full hover:bg-opacity-20 ${
                            isCrimeline ? "hover:bg-purple-500" : "hover:bg-[color:var(--sage)]"
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
                          : "text-[color:var(--ink)] border border-[color:var(--clay)] hover:bg-[color:var(--white)]"
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
