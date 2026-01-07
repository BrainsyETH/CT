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
  const { mode, searchQuery, selectedTags, sortOrder, clearAllFilters } = useModeStore();
  const isCrimeline = mode === "crimeline";
  const prefersReducedMotion = useReducedMotion();
  const [currentVisibleYear, setCurrentVisibleYear] = useState<number | null>(null);
  const [isFilterSticky, setIsFilterSticky] = useState(false);

  // Filter events based on current mode, search, and tags
  const filteredEvents = useMemo(() => {
    let filtered = events.filter((event) => {
      // Mode filter
      if (mode === "timeline") {
        if (!event.mode.includes("timeline")) return false;
      } else {
        if (!event.mode.includes("crimeline") || !event.crimeline) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = event.title.toLowerCase().includes(query);
        const matchesSummary = event.summary.toLowerCase().includes(query);
        const matchesCategory = event.category.toLowerCase().includes(query);
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

      return true;
    });

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return filtered;
  }, [events, mode, searchQuery, selectedTags, sortOrder]);

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

  // Track scroll for sticky filter behavior and current year
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Make filter sticky after scrolling past initial position
      setIsFilterSticky(scrollY > 150);

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
  }, [years]);

  // Calculate stats for crimeline mode
  const totalLost = useMemo(() => {
    if (!isCrimeline) return 0;
    const crimelineEvents = events.filter(
      (e) => e.mode.includes("crimeline") && e.crimeline
    );
    return crimelineEvents.reduce(
      (sum, e) => sum + (e.crimeline?.funds_lost_usd || 0),
      0
    );
  }, [events, isCrimeline]);

  const hasActiveFilters = searchQuery.trim() || selectedTags.length > 0 || sortOrder !== "asc";

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

      {/* Sticky Filter Bar */}
      <div
        className={`transition-all duration-300 ${
          isFilterSticky
            ? "fixed top-[72px] left-0 right-0 z-40 px-4"
            : ""
        }`}
      >
        <div className={isFilterSticky ? "max-w-6xl mx-auto" : ""}>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
            <div className="flex-1">
              <SearchFilter isSticky={isFilterSticky} />
            </div>
            <MobileYearSelector years={years} currentYear={currentYear} />
          </div>
        </div>
      </div>

      {/* Spacer when filter is sticky */}
      {isFilterSticky && <div className="h-32 sm:h-28" />}

      {/* Amount Lost Stats (Crimeline only) */}
      {isCrimeline && (
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg bg-gradient-to-r from-gray-900 via-red-950/30 to-gray-900 border border-red-900/50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💀</span>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total Amount Lost</p>
                <p className="text-2xl font-bold text-red-400">
                  {formatCurrency(totalLost)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">across</p>
              <p className="text-lg font-bold text-white">
                {events.filter((e) => e.mode.includes("crimeline") && e.crimeline).length} incidents
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results count */}
      <div
        className={`mb-4 text-sm ${
          isCrimeline ? "text-gray-400" : "text-gray-500"
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
              isCrimeline ? "bg-red-900" : "bg-teal-200"
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
                          ? "bg-red-900/50 text-red-300 border border-red-800"
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
                      ? "bg-red-900/50 text-red-300 hover:bg-red-900/70 border border-red-800"
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
