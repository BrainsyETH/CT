"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useModeStore } from "@/store/mode-store";
import { EventCard } from "./EventCard";
import { YearJump } from "./YearJump";
import { MobileYearSelector } from "./MobileYearSelector";
import { SearchFilter } from "./SearchFilter";
import { ScrollProgress } from "./ScrollProgress";
import { StatsPanel } from "./StatsPanel";
import { getYear, formatCurrency } from "@/lib/formatters";
import type { Event } from "@/lib/types";

interface TimelineProps {
  events: Event[];
}

export function Timeline({ events }: TimelineProps) {
  const {
    mode,
    searchQuery,
    selectedTags,
    selectedCategories,
    selectedCrimelineTypes,
    sortOrder,
    clearAllFilters
  } = useModeStore();
  const isCrimeline = mode === "crimeline";
  const isBoth = mode === "both";
  const prefersReducedMotion = useReducedMotion();
  const [currentVisibleYear, setCurrentVisibleYear] = useState<number | null>(null);
  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Filter events based on current mode, search, and tags
  const filteredEvents = useMemo(() => {
    let filtered = events.filter((event) => {
      // Mode filter - handle both string and array formats
      const eventModes = Array.isArray(event.mode) ? event.mode : [event.mode];
      if (mode === "timeline") {
        if (!eventModes.includes("timeline")) return false;
      } else if (mode === "crimeline") {
        if (!eventModes.includes("crimeline") || !event.crimeline) return false;
      }
      // mode === "both" shows all events (no filtering by mode)

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = event.title.toLowerCase().includes(query);
        const matchesSummary = event.summary.toLowerCase().includes(query);
        const categories = Array.isArray(event.category) ? event.category : [event.category];
        const matchesCategory = categories.some((cat) =>
          cat.toLowerCase().includes(query)
        );
        const matchesTags = event.tags.some((tag) =>
          tag.toLowerCase().includes(query)
        );
        if (!matchesTitle && !matchesSummary && !matchesCategory && !matchesTags) {
          return false;
        }
      }

      // Tag filter
      if (selectedTags.length > 0) {
        const hasMatchingTag = selectedTags.some((tag) =>
          event.tags.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }

      // Category filter
      if (selectedCategories.length > 0) {
        const categories = Array.isArray(event.category) ? event.category : [event.category];
        const hasMatchingCategory = categories.some((cat) =>
          selectedCategories.includes(cat)
        );
        if (!hasMatchingCategory) return false;
      }

      // Crimeline Type filter
      if (selectedCrimelineTypes.length > 0) {
        if (!event.crimeline || !selectedCrimelineTypes.includes(event.crimeline.type)) {
          return false;
        }
      }

      return true;
    });

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return filtered;
  }, [events, mode, searchQuery, selectedTags, selectedCategories, selectedCrimelineTypes, sortOrder]);

  // Group events by year
  const groupedEvents = useMemo(() => {
    const groups: Map<number, Event[]> = new Map();

    filteredEvents.forEach((event) => {
      const year = getYear(event.date);
      if (!groups.has(year)) {
        groups.set(year, []);
      }
      groups.get(year)!.push(event);
    });

    const result = Array.from(groups.entries())
      .map(([year, events]) => ({ year, events }))
      .sort((a, b) => (sortOrder === "asc" ? a.year - b.year : b.year - a.year));

    return result;
  }, [filteredEvents, sortOrder]);

  const years = useMemo(
    () => groupedEvents.map((g) => g.year),
    [groupedEvents]
  );

  const currentYear = years.length > 0 ? years[0] : null;

  // Track scroll for filter visibility (hide on scroll down, show on scroll up - like X/Twitter)
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Show filter if at the top, or if scrolling up
      if (scrollY < 100) {
        setIsFilterVisible(true);
      } else if (scrollY < lastScrollY) {
        // Scrolling up - show filter
        setIsFilterVisible(true);
      } else if (scrollY > lastScrollY + 10) {
        // Scrolling down (with threshold to avoid micro-movements) - hide filter
        setIsFilterVisible(false);
      }

      setLastScrollY(scrollY);

      // Track current visible year
      for (let i = years.length - 1; i >= 0; i--) {
        const yearElement = document.getElementById(`year-${years[i]}`);
        if (yearElement) {
          const rect = yearElement.getBoundingClientRect();
          if (rect.top <= 200) {
            setCurrentVisibleYear(years[i]);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [years, lastScrollY]);

  // Calculate stats for crimeline mode - exclude unknown/NaN amounts
  const crimelineStats = useMemo(() => {
    if (mode === "timeline") return { totalLost: 0, incidentCount: 0 };
    const crimelineEvents = events.filter(
      (e) => (Array.isArray(e.mode) ? e.mode.includes("crimeline") : e.mode === "crimeline") && e.crimeline
    );
    // Only sum valid numeric amounts (exclude undefined, null, NaN)
    const totalLost = crimelineEvents.reduce((sum, e) => {
      const amount = e.crimeline?.funds_lost_usd;
      if (typeof amount === "number" && !isNaN(amount) && isFinite(amount)) {
        return sum + amount;
      }
      return sum;
    }, 0);
    return { totalLost, incidentCount: crimelineEvents.length };
  }, [events, mode]);

  // Sort order is not considered an "active filter" for the CTA button
  const hasActiveFilters =
    searchQuery.trim() ||
    selectedTags.length > 0 ||
    selectedCategories.length > 0 ||
    selectedCrimelineTypes.length > 0;

  // Track card index for alternating sides
  let cardIndex = 0;

  const animationProps = prefersReducedMotion
    ? { initial: {}, animate: {}, exit: {}, transition: { duration: 0 } }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.3 },
      };

  return (
    <>
      <ScrollProgress years={years} currentVisibleYear={currentVisibleYear} />

      {/* Filter Bar - slides up/down based on scroll direction */}
      <div
        className={`relative z-40 transition-all duration-300 ease-in-out pt-[34px] sm:pt-0 ${
          isFilterVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        {/* Search and Filter */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex-1 min-w-0">
              <SearchFilter />
            </div>
            {mode === "crimeline" && crimelineStats.totalLost > 0 && (
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                className="w-full lg:w-[320px] shrink-0 p-4 rounded-lg bg-gradient-to-r from-gray-900 via-purple-950/30 to-gray-900 border-2 border-purple-900/50 shadow-[4px_4px_0_rgba(124,58,237,0.35)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💀</span>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Total Estimated Loss</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {formatCurrency(crimelineStats.totalLost)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Ongoing</p>
                    <p className="text-lg font-bold text-white">
                      {crimelineStats.incidentCount} incidents
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
            {/* Year Selector - visible on mobile/tablet, hidden on desktop */}
            <div className="lg:hidden shrink-0">
              <MobileYearSelector years={years} currentYear={currentYear} />
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div
        className={`mb-4 text-sm ${
          isCrimeline ? "text-gray-400" : isBoth ? "text-gray-400" : "text-gray-500"
        }`}
      >
        {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""} found
        {searchQuery && ` for "${searchQuery}"`}
        {selectedTags.length > 0 && ` with tags: ${selectedTags.join(", ")}`}
      </div>

      <div className="flex gap-6">
        {/* Year Jump Sidebar */}
        <aside className="hidden lg:block sticky top-24 h-fit">
          <YearJump years={years} currentYear={currentVisibleYear} />
        </aside>

        {/* Timeline Content */}
        <div className="flex-1 relative">
          {/* Central Timeline Line */}
          <div
            className={`absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 transition-colors duration-300 ${
              isCrimeline ? "bg-purple-900" : isBoth ? "bg-gradient-to-b from-teal-500 via-purple-500 to-purple-700" : "bg-teal-200"
            }`}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={`${mode}-${sortOrder}`}
              {...animationProps}
              className="relative space-y-12 py-8"
            >
              {groupedEvents.map(({ year, events: yearEvents }) => (
                <div key={year} id={`year-${year}`} className="scroll-mt-44">
                  {/* Year Header */}
                  <div className="flex items-center justify-center mb-8">
                    <motion.div
                      initial={prefersReducedMotion ? {} : { scale: 0.8, opacity: 0 }}
                      animate={prefersReducedMotion ? {} : { scale: 1, opacity: 1 }}
                      className={`px-6 py-2 rounded-full font-bold text-lg transition-colors duration-300 ${
                        isCrimeline
                          ? "bg-gray-950 text-purple-300 border-2 border-purple-800"
                          : "bg-teal-100 text-teal-700 border border-teal-200"
                      }`}
                    >
                      {year}
                    </motion.div>
                  </div>

                  {/* Events for this year */}
                  <div className="space-y-6">
                    {yearEvents.map((event) => {
                      const currentIndex = cardIndex++;
                      return (
                        <EventCard
                          key={event.id}
                          event={event}
                          index={currentIndex}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Empty State */}
          {filteredEvents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div
                className={`text-6xl mb-4 ${
                  isCrimeline ? "opacity-30" : "opacity-20"
                }`}
              >
                {isCrimeline ? "🔍" : "📅"}
              </div>
              <p
                className={`text-lg font-medium ${
                  isCrimeline ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No events found
              </p>
              <p
                className={`text-sm mt-1 mb-4 ${
                  isCrimeline ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Try adjusting your search or filters
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    isCrimeline
                      ? "bg-purple-900/50 text-purple-300 hover:bg-purple-900/70 border-2 border-purple-800"
                      : "bg-teal-500 text-white hover:bg-teal-600"
                  }`}
                >
                  Show all events
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
