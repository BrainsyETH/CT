"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModeStore } from "@/store/mode-store";
import { EventCard } from "./EventCard";
import { YearJump } from "./YearJump";
import { getYear } from "@/lib/formatters";
import type { Event } from "@/lib/types";

interface TimelineProps {
  events: Event[];
}

interface GroupedEvents {
  year: number;
  events: Event[];
}

export function Timeline({ events }: TimelineProps) {
  const { mode } = useModeStore();
  const isCrimeline = mode === "crimeline";

  // Filter events based on current mode
  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => {
        if (mode === "timeline") {
          return event.mode.includes("timeline");
        }
        return event.mode.includes("crimeline") && event.crimeline;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, mode]);

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

    return Array.from(groups.entries())
      .map(([year, events]) => ({ year, events }))
      .sort((a, b) => a.year - b.year);
  }, [filteredEvents]);

  const years = useMemo(
    () => groupedEvents.map((g) => g.year),
    [groupedEvents]
  );

  // Track card index for alternating sides
  let cardIndex = 0;

  return (
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
            key={mode}
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
          <div className="flex items-center justify-center py-20">
            <p
              className={`text-lg ${
                isCrimeline ? "text-gray-500" : "text-gray-400"
              }`}
            >
              No events found for this mode.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
