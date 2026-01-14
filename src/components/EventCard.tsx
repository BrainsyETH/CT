"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useModeStore } from "@/store/mode-store";
import { ShareButton } from "./ShareButton";
import { MediaPreview } from "./MediaCarousel";
import { formatDate, formatCurrency, formatFundsLost } from "@/lib/formatters";
import { getMediaItems } from "@/lib/media-utils";
import { FALLBACK_IMAGES } from "@/lib/constants";
import type { Event } from "@/lib/types";

interface EventCardProps {
  event: Event;
  index: number;
}

export function EventCard({ event, index }: EventCardProps) {
  const { mode, setSelectedEventId } = useModeStore();
  const isCrimeline = mode === "crimeline";
  // In "both" mode, use crimeline styling for events that have crimeline data
  const useCrimelineStyle = isCrimeline || (mode === "both" && event.crimeline);
  const isLeft = index % 2 === 0;
  const prefersReducedMotion = useReducedMotion();

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open modal if clicking on share button
    const target = e.target as HTMLElement;
    if (target.closest('[data-share-button]')) {
      return;
    }
    setSelectedEventId(event.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedEventId(event.id);
    }
  };

  const animationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, x: isLeft ? -20 : 20 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.4, delay: Math.min(index * 0.05, 0.5) },
      };

  return (
    <motion.div
      {...animationProps}
      className={`relative flex ${isLeft ? "md:justify-start" : "md:justify-end"} justify-start`}
    >
      {/* Timeline dot */}
      <div
        className={`absolute left-0 md:left-1/2 w-4 h-4 rounded-full -translate-x-1/2 z-10 transition-colors duration-300 ${
          useCrimelineStyle ? "bg-purple-500 shadow-purple-500/50" : "bg-teal-500 shadow-teal-500/50"
        } shadow-lg`}
      />

      {/* Card */}
      <div
        className={`ml-6 md:ml-0 w-full md:w-[calc(50%-2rem)] ${
          isLeft ? "md:mr-8" : "md:ml-8"
        }`}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={handleCardClick}
          onKeyDown={handleKeyDown}
          className={`w-full text-left focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg transition-all duration-300 cursor-pointer group ${
            useCrimelineStyle ? "focus:ring-purple-500" : "focus:ring-teal-500"
          }`}
        >
          <div
            className={`rounded-lg transition-all duration-300 overflow-hidden ${
              isCrimeline
                ? "bg-gray-900 border-2 border-purple-900/40 shadow-[6px_6px_0_rgba(124,58,237,0.35)] group-hover:border-purple-600/60 group-hover:shadow-[6px_6px_0_rgba(124,58,237,0.55)]"
                : useCrimelineStyle
                ? "bg-white border-2 border-gray-200 shadow-[6px_6px_0_rgba(15,23,42,0.12)] group-hover:border-purple-400 group-hover:shadow-[6px_6px_0_rgba(124,58,237,0.25)]"
                : "bg-white border-2 border-gray-200 shadow-[6px_6px_0_rgba(15,23,42,0.12)] group-hover:border-teal-400 group-hover:shadow-[6px_6px_0_rgba(20,184,166,0.25)]"
            }`}
          >
            {/* Header Section - Date, Share, Title */}
            <div className="p-4 pb-3">
              <div className="flex items-start justify-between">
                <time
                  className={`text-sm font-medium transition-colors duration-300 ${
                    isCrimeline ? "text-purple-400" : "text-teal-600"
                  }`}
                >
                  {formatDate(event.date)}
                </time>
                <ShareButton event={event} />
              </div>

              {/* Title */}
              <h3
                className={`mt-1 text-lg font-bold transition-colors duration-300 ${
                  isCrimeline
                    ? "text-white group-hover:text-purple-300"
                    : useCrimelineStyle
                    ? "text-gray-900 group-hover:text-purple-600"
                    : "text-gray-900 group-hover:text-teal-700"
                }`}
              >
                {event.title}
              </h3>
            </div>

            {/* Media Section - Middle */}
            {(() => {
              const mediaItems = getMediaItems(event);
              if (mediaItems.length > 0) {
                return (
                  <MediaPreview
                    media={mediaItems}
                    event={event}
                    isCrimeline={isCrimeline}
                  />
                );
              }
              // Fallback for events with no media
              return (
                <div className="relative w-full aspect-[16/9] overflow-hidden">
                  <Image
                    src={isCrimeline ? FALLBACK_IMAGES.CRIMELINE : FALLBACK_IMAGES.TIMELINE}
                    alt={event.title}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div
                    className={`absolute inset-0 ${
                      isCrimeline
                        ? "bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent"
                        : "bg-gradient-to-t from-white via-white/20 to-transparent"
                    }`}
                  />
                </div>
              );
            })()}

            {/* Content Section - Below Media */}
            <div className="p-4 pt-3">
              {/* Summary - Improved contrast */}
              <p
                className={`text-sm leading-relaxed transition-colors duration-300 line-clamp-2 ${
                  isCrimeline ? "text-gray-200" : "text-gray-700"
                }`}
              >
                {event.summary}
              </p>

              {/* Metrics - Only show for Bitcoin category events */}
              {event.metrics && (Array.isArray(event.category) ? event.category.includes("Bitcoin") : event.category === "Bitcoin") && (
                <div
                  className={`mt-3 pt-3 border-t transition-colors duration-300 ${
                    isCrimeline ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <div className="flex flex-wrap gap-3 text-xs">
                    {event.metrics.btc_price_usd !== undefined && (
                      <div>
                        <span className={isCrimeline ? "text-gray-400" : "text-gray-500"}>
                          BTC:{" "}
                        </span>
                        <span className={isCrimeline ? "text-gray-200" : "text-gray-800"}>
                          {formatCurrency(event.metrics.btc_price_usd)}
                        </span>
                      </div>
                    )}
                    {event.metrics.market_cap_usd !== undefined && (
                      <div>
                        <span className={isCrimeline ? "text-gray-400" : "text-gray-500"}>
                          MCap:{" "}
                        </span>
                        <span className={isCrimeline ? "text-gray-200" : "text-gray-800"}>
                          {formatCurrency(event.metrics.market_cap_usd)}
                        </span>
                      </div>
                    )}
                    {event.metrics.tvl_usd !== undefined && (
                      <div>
                        <span className={isCrimeline ? "text-gray-400" : "text-gray-500"}>
                          TVL:{" "}
                        </span>
                        <span className={isCrimeline ? "text-gray-200" : "text-gray-800"}>
                          {formatCurrency(event.metrics.tvl_usd)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Crimeline-specific details */}
              {isCrimeline && event.crimeline && (
                <div className="mt-3 pt-3 border-t border-purple-900/40">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    {/* Type and Status */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-1 text-xs font-bold bg-purple-900/50 text-purple-200 rounded">
                        {event.crimeline.type}
                      </span>
                      {event.crimeline.status && (
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            event.crimeline.status === "Funds recovered"
                              ? "bg-green-900/50 text-green-200"
                              : event.crimeline.status === "Partial recovery"
                              ? "bg-yellow-900/50 text-yellow-200"
                              : event.crimeline.status === "Total loss"
                              ? "bg-purple-900/50 text-purple-200"
                              : "bg-gray-700 text-gray-200"
                          }`}
                        >
                          {event.crimeline.status}
                        </span>
                      )}
                    </div>

                    {/* Funds Lost */}
                    <span className="text-purple-400 text-sm font-bold">
                      {formatFundsLost(event.crimeline.funds_lost_usd)} Lost
                    </span>
                  </div>
                </div>
              )}

              {/* Click hint - visible on mobile/focus and hover on desktop */}
              <div
                className={`mt-3 text-xs font-medium transition-opacity duration-200 ${
                  useCrimelineStyle ? "text-purple-400" : "text-teal-600"
                } opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100`}
              >
                <span className="inline-flex items-center gap-1">
                  View details
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
