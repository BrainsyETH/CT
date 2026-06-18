"use client";

import { useMemo, useState } from "react";
import { FallbackImage } from "./FallbackImage";
import { motion, AnimatePresence } from "framer-motion";
import { useModeStore } from "@/store/mode-store";
import { formatDate } from "@/lib/formatters";
import { FALLBACK_IMAGES } from "@/lib/constants";
import type { Event } from "@/lib/types";

interface OnThisDayCardProps {
  events: Event[];
}

export function OnThisDayCard({ events }: OnThisDayCardProps) {
  const { mode, setSelectedEventId } = useModeStore();
  const isCrimeline = mode === "crimeline";
  const [isExpanded, setIsExpanded] = useState(false);

  const todayEvents = useMemo(() => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const todayMD = `-${month}-${day}`;

    return events.filter((event) => {
      const eventModes = Array.isArray(event.mode) ? event.mode : [event.mode];
      const matchesMode =
        mode === "both" ||
        (mode === "timeline" && eventModes.includes("timeline")) ||
        (mode === "crimeline" && eventModes.includes("crimeline") && !!event.crimeline);

      return event.date.endsWith(todayMD) && matchesMode;
    });
  }, [events, mode]);

  if (todayEvents.length === 0) return null;

  // Pick the most significant event (prefer ones with images)
  const featured = todayEvents.find((e) => e.image) || todayEvents[0];
  const yearsAgo = new Date().getFullYear() - parseInt(featured.date.slice(0, 4));

  // The remaining events that share today's calendar date, newest first
  const otherEvents = todayEvents
    .filter((e) => e.id !== featured.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`mb-6 rounded-xl border-2 overflow-hidden transition-colors duration-300 ${
        isCrimeline
          ? "border-purple-700 bg-gradient-to-r from-purple-950/40 via-gray-950 to-purple-950/40 shadow-[4px_4px_0_rgba(124,58,237,0.25)]"
          : "border-teal-400 bg-gradient-to-r from-teal-50 via-white to-teal-50 shadow-[4px_4px_0_rgba(20,184,166,0.2)]"
      }`}
    >
      <button
        onClick={() => setSelectedEventId(featured.id)}
        className="w-full text-left group focus:outline-none focus:ring-2 focus:ring-inset rounded-xl"
      >
        <div className="flex flex-col sm:flex-row items-stretch">
          {/* Image */}
          {featured.image && (
            <div className="relative w-full sm:w-48 h-32 sm:h-auto flex-shrink-0 overflow-hidden">
              <FallbackImage
                src={featured.image || (isCrimeline ? FALLBACK_IMAGES.CRIMELINE : FALLBACK_IMAGES.TIMELINE)}
                fallbackSrc={isCrimeline ? FALLBACK_IMAGES.CRIMELINE : FALLBACK_IMAGES.TIMELINE}
                alt={featured.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="192px"
              />
              <div
                className={`absolute inset-0 ${
                  isCrimeline
                    ? "bg-gradient-to-r from-transparent to-gray-950/80 hidden sm:block"
                    : "bg-gradient-to-r from-transparent to-white/80 hidden sm:block"
                }`}
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-xs font-bold uppercase tracking-widest ${
                  isCrimeline ? "text-purple-400" : "text-teal-600"
                }`}
              >
                On This Day
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  isCrimeline
                    ? "bg-purple-900/60 text-purple-300 border border-purple-700"
                    : "bg-teal-100 text-teal-700 border border-teal-300"
                }`}
              >
                {yearsAgo} year{yearsAgo !== 1 ? "s" : ""} ago
              </span>
              {otherEvents.length > 0 && (
                <span
                  className={`text-xs ${isCrimeline ? "text-gray-500" : "text-gray-400"}`}
                >
                  +{otherEvents.length} more
                </span>
              )}
            </div>

            <h3
              className={`text-base sm:text-lg font-bold leading-snug transition-colors duration-200 ${
                isCrimeline
                  ? "text-white group-hover:text-purple-300"
                  : "text-gray-900 group-hover:text-teal-700"
              }`}
            >
              {featured.title}
            </h3>

            <p
              className={`mt-1 text-sm line-clamp-2 ${
                isCrimeline ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {featured.summary}
            </p>

            <time
              className={`mt-2 block text-xs font-medium ${
                isCrimeline ? "text-purple-400" : "text-teal-600"
              }`}
            >
              {formatDate(featured.date)}
            </time>
          </div>
        </div>
      </button>

      {/* Other events that happened on this calendar day */}
      {otherEvents.length > 0 && (
        <div className={`border-t ${isCrimeline ? "border-purple-900/40" : "border-teal-200"}`}>
          <button
            onClick={() => setIsExpanded((v) => !v)}
            aria-expanded={isExpanded}
            className={`w-full flex items-center justify-between gap-2 px-4 sm:px-5 py-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-inset ${
              isCrimeline
                ? "text-purple-300 hover:bg-purple-950/40"
                : "text-teal-700 hover:bg-teal-50"
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-widest">
              {isExpanded
                ? "Show less"
                : `Show ${otherEvents.length} more from this day`}
            </span>
            <svg
              className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <ul className="flex flex-col gap-2 px-4 sm:px-5 pb-4">
                  {otherEvents.map((e) => {
                    const eventYearsAgo =
                      new Date().getFullYear() - parseInt(e.date.slice(0, 4));
                    return (
                      <li key={e.id}>
                        <button
                          onClick={() => setSelectedEventId(e.id)}
                          className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                            isCrimeline
                              ? "bg-gray-800/50 hover:bg-gray-800 border border-gray-700"
                              : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-semibold truncate ${
                                isCrimeline ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {e.title}
                            </p>
                            <p
                              className={`text-xs mt-0.5 ${
                                isCrimeline ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              {formatDate(e.date)} · {eventYearsAgo} year
                              {eventYearsAgo !== 1 ? "s" : ""} ago
                            </p>
                          </div>
                          <svg
                            className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                              isCrimeline ? "text-purple-400" : "text-teal-500"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.section>
  );
}
