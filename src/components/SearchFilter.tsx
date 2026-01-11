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
      className={`rounded-lg p-3 sm:p-4 transition-colors duration-300 ${
        isCrimeline
          ? "bg-gray-900/80 border border-red-900/30"
          : "bg-white border border-gray-200"
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
                ? "bg-red-900/50 border border-red-800 text-red-300"
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
                  ? "bg-red-500 text-white"
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
                ? "bg-red-900/50 border border-red-800 text-red-300 hover:bg-red-900/70"
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
                            ? "bg-red-900/50 text-red-300"
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
                            ? "bg-red-900/50 text-red-300"
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
                              isCrimeline ? "focus:ring-red-500" : "focus:ring-teal-500"
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
                                      ? "bg-red-900 text-red-200 border border-red-700"
                                      : "bg-teal-500 text-white border border-teal-600"
                                    : isCrimeline
                                    ? "bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600"
                                    : "bg-gray-100 text-gray-600 border border-gray-200 hover:border-gray-300"
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
                      isCrimeline ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      Incident Types
                      {selectedCrimelineTypes.length > 0 && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            isCrimeline
                              ? "bg-red-900/50 text-red-300"
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
                                      ? "bg-red-900 text-red-200 border border-red-700"
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
                          className={`ml-0.5 p-0.5 rounded-full hover:bg-opacity-20 ${
                            isCrimeline ? "hover:bg-red-500" : "hover:bg-teal-500"
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
                            ? "bg-red-900/50 text-red-300 border border-red-800"
                            : "bg-teal-100 text-teal-700 border border-teal-300"
                        }`}
                      >
                        {category}
                        <button
                          onClick={() => toggleCategory(category)}
                          aria-label={`Remove ${category} filter`}
                          className={`ml-0.5 p-0.5 rounded-full hover:bg-opacity-20 ${
                            isCrimeline ? "hover:bg-red-500" : "hover:bg-teal-500"
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
                            ? "bg-red-900/50 text-red-300 border border-red-800"
                            : "bg-teal-100 text-teal-700 border border-teal-300"
                        }`}
                      >
                        {type}
                        <button
                          onClick={() => toggleCrimelineType(type)}
                          aria-label={`Remove ${type} filter`}
                          className={`ml-0.5 p-0.5 rounded-full hover:bg-opacity-20 ${
                            isCrimeline ? "hover:bg-red-500" : "hover:bg-teal-500"
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
