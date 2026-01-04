"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModeStore } from "@/store/mode-store";
import { EventCard } from "./EventCard";
import { YearJump } from "./YearJump";
import { MobileYearSelector } from "./MobileYearSelector";
import { SearchFilter } from "./SearchFilter";
import { StatsPanel } from "./StatsPanel";
import { ScrollProgress } from "./ScrollProgress";
import { getYear } from "@/lib/formatters";
import type { Event } from "@/lib/types";

interface TimelineProps {
  events: Event[];
}

export function Timeline({ events }: TimelineProps) {
  const { mode, searchQuery, selectedTags, sortOrder } = useModeStore();
  const isCrimeline = mode === "crimeline";

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

  // Track card index for alternating sides
  let cardIndex = 0;

  return (
    <>
      <ScrollProgress years={years} />

      {/* Stats Panel (crimeline only) */}
      <StatsPanel events={events} />

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
        <div className="flex-1">
          <SearchFilter />
        </div>
        <MobileYearSelector years={years} currentYear={currentYear} />
      </div>

      {/* Results count */}
      <div
        className={`mb-4 text-sm ${
          isCrimeline ? "text-gray-500" : "text-gray-400"
        }`}
      >
        {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""} found
        {searchQuery && ` for "${searchQuery}"`}
        {selectedTags.length > 0 && ` with tags: ${selectedTags.join(", ")}`}
      </div>

      <div className="flex gap-6">
        {/* Year Jump Sidebar */}
        <aside className="hidden lg:block sticky top-24 h-fit">
          <YearJump years={years} />
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative space-y-12 py-8"
            >
              {groupedEvents.map(({ year, events: yearEvents }) => (
                <div key={year} id={`year-${year}`} className="scroll-mt-24">
                  {/* Year Header */}
                  <div className="flex items-center justify-center mb-8">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
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
                className={`text-sm mt-1 ${
                  isCrimeline ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
