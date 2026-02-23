"use client";

import Image from "next/image";
import { useRef, useCallback, useMemo } from "react";
import { useModeStore } from "@/store/mode-store";
import { formatDate } from "@/lib/formatters";
import { FALLBACK_IMAGES } from "@/lib/constants";
import type { Event } from "@/lib/types";

interface WeeklyEventsProps {
  events: Event[];
}

export function WeeklyEvents({ events }: WeeklyEventsProps) {
  const { mode, setSelectedEventId } = useModeStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter events by current mode
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const eventModes = Array.isArray(event.mode) ? event.mode : [event.mode];
      if (mode === "timeline") {
        return eventModes.includes("timeline");
      } else if (mode === "crimeline") {
        return eventModes.includes("crimeline") && !!event.crimeline;
      }
      // mode === "both" shows all
      return true;
    });
  }, [events, mode]);

  const scroll = useCallback((direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.75;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  // Don't render if no events match
  if (filteredEvents.length === 0) return null;

  const isCrimeline = mode === "crimeline";

  // Compute the week range label (Sun - Sat)
  const now = new Date();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - now.getDay());
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const weekLabel = sunday.getMonth() === saturday.getMonth()
    ? `${monthNames[sunday.getMonth()]} ${sunday.getDate()}–${saturday.getDate()}`
    : `${monthNames[sunday.getMonth()]} ${sunday.getDate()} – ${monthNames[saturday.getMonth()]} ${saturday.getDate()}`;

  return (
    <section className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2
            className={`text-lg font-bold tracking-tight ${
              isCrimeline ? "text-purple-300" : "text-gray-800"
            }`}
          >
            On This Week
          </h2>
          <span
            className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${
              isCrimeline
                ? "bg-purple-900/60 text-purple-300 border border-purple-700"
                : "bg-teal-50 text-teal-700 border border-teal-200"
            }`}
          >
            {weekLabel}
          </span>
        </div>

        {/* Scroll arrows - hidden on mobile where swipe is natural */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className={`p-1.5 rounded-lg border transition-colors ${
              isCrimeline
                ? "border-purple-800 text-purple-400 hover:bg-purple-900/50"
                : "border-gray-200 text-gray-500 hover:bg-gray-100"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className={`p-1.5 rounded-lg border transition-colors ${
              isCrimeline
                ? "border-purple-800 text-purple-400 hover:bg-purple-900/50"
                : "border-gray-200 text-gray-500 hover:bg-gray-100"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {filteredEvents.map((event) => {
          const eventModes = Array.isArray(event.mode) ? event.mode : [event.mode];
          const useCrimelineStyle = isCrimeline || (mode === "both" && eventModes.includes("crimeline") && !!event.crimeline);

          return (
            <button
              key={event.id}
              onClick={() => setSelectedEventId(event.id)}
              className="flex-none snap-start w-[260px] sm:w-[280px] text-left group focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
            >
              <div
                className={`neo-brutalist-card ${
                  isCrimeline
                    ? "neo-brutalist-card-crimeline group-hover:border-purple-400"
                    : useCrimelineStyle
                    ? "neo-brutalist-card-crimeline-light group-hover:border-purple-400"
                    : "neo-brutalist-card-timeline group-hover:border-teal-400"
                }`}
              >
                {/* Thumbnail */}
                <div className={`relative w-full aspect-[16/9] overflow-hidden ${
                  isCrimeline ? "bg-gray-900" : "bg-gray-100"
                }`}>
                  <Image
                    src={event.image || (isCrimeline ? FALLBACK_IMAGES.CRIMELINE : FALLBACK_IMAGES.TIMELINE)}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="280px"
                  />
                  <div
                    className={`absolute inset-0 ${
                      isCrimeline
                        ? "bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent"
                        : "bg-gradient-to-t from-white via-white/20 to-transparent"
                    }`}
                  />
                  {/* Year badge */}
                  <div
                    className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold ${
                      useCrimelineStyle
                        ? "bg-purple-900/80 text-purple-200 border border-purple-700"
                        : "bg-teal-600/90 text-white"
                    }`}
                  >
                    {event.date.slice(0, 4)}
                  </div>
                </div>

                <div className="p-3">
                  {/* Date */}
                  <time
                    className={`text-xs font-medium ${
                      isCrimeline
                        ? "text-purple-400"
                        : useCrimelineStyle
                        ? "text-purple-600"
                        : "text-teal-600"
                    }`}
                  >
                    {formatDate(event.date)}
                  </time>

                  {/* Title */}
                  <h3
                    className={`mt-1 text-sm font-bold leading-snug line-clamp-2 transition-colors duration-200 ${
                      isCrimeline
                        ? "text-gray-100 group-hover:text-purple-300"
                        : "text-gray-800 group-hover:text-teal-700"
                    }`}
                  >
                    {event.title}
                  </h3>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
