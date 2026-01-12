"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useModeStore } from "@/store/mode-store";
import { TagPills } from "./TagPills";
import { ShareButton } from "./ShareButton";
import { formatDate, formatCurrency, formatFundsLost } from "@/lib/formatters";
import type { Event } from "@/lib/types";

const FALLBACK_IMAGE_TIMELINE = "https://xcxqku1c8gojqt7x.public.blob.vercel-storage.com/chain_of_events_small.png";
const FALLBACK_IMAGE_CRIMELINE = "https://xcxqku1c8gojqt7x.public.blob.vercel-storage.com/CoE_Crimeline.png";

interface EventCardProps {
  event: Event;
  index: number;
}

export function EventCard({ event, index }: EventCardProps) {
  const { mode, setSelectedEventId } = useModeStore();
  const isCrimeline = mode === "crimeline";
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
      className={`group relative flex ${isLeft ? "md:justify-start" : "md:justify-end"} justify-start`}
    >
      {/* Timeline dot */}
      <div
        className={`absolute left-0 md:left-1/2 w-[9px] h-[9px] rounded-full -translate-x-1/2 z-10 transition-colors duration-300 ${
          isCrimeline
            ? "bg-purple-500 shadow-purple-500/50"
            : "bg-[color:var(--oatmeal)] border border-[color:var(--sage)] group-hover:bg-[color:var(--sage)]"
        } ${isCrimeline ? "shadow-lg" : ""}`}
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
            isCrimeline ? "focus:ring-purple-500" : "focus:ring-[color:var(--sage)]"
          }`}
        >
          <div
            className={`rounded-xl overflow-hidden ${
              isCrimeline
                ? "transition-all duration-300 bg-gray-900 border-2 border-purple-900/40 shadow-[6px_6px_0_rgba(124,58,237,0.35)] group-hover:border-purple-600/60 group-hover:shadow-[6px_6px_0_rgba(124,58,237,0.55)]"
                : "soft-card group-hover:border-[color:var(--sage)] group-hover:shadow-xl"
            }`}
          >
            {/* Event Image */}
            <div className="relative w-full aspect-[16/9] overflow-hidden">
              <Image
                src={event.image || (isCrimeline ? FALLBACK_IMAGE_CRIMELINE : FALLBACK_IMAGE_TIMELINE)}
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
                    : "bg-gradient-to-t from-[color:var(--white)] via-[color:var(--white)]/20 to-transparent"
                }`}
              />
            </div>

            <div className="p-5">
              {/* Header with Date and Share */}
              <div className="flex items-start justify-between">
                <time
                  className={`text-sm font-medium transition-colors duration-300 ${
                    isCrimeline ? "text-purple-400" : "text-[color:var(--sage)]"
                  }`}
                >
                  {formatDate(event.date)}
                </time>
                <ShareButton event={event} />
              </div>

              {/* Title */}
              <h3
                className={`mt-1 text-lg font-bold transition-colors duration-300 font-display ${
                  isCrimeline ? "text-white group-hover:text-purple-300" : "text-[color:var(--ink)] group-hover:text-[color:var(--sage)]"
                }`}
              >
                {event.title}
              </h3>

              {/* Summary - Improved contrast */}
              <p
                className={`mt-2 text-sm leading-relaxed transition-colors duration-300 line-clamp-2 ${
                  isCrimeline ? "text-gray-200" : "text-[color:var(--muted)]"
                }`}
              >
                {event.summary}
              </p>

              {/* Tags */}
              <div className="mt-3">
                <TagPills tags={event.tags} />
              </div>

              {/* Metrics - Only show for Bitcoin category events */}
              {event.metrics && (Array.isArray(event.category) ? event.category.includes("Bitcoin") : event.category === "Bitcoin") && (
                <div
                  className={`mt-3 pt-3 border-t transition-colors duration-300 ${
                    isCrimeline ? "border-gray-700" : "border-[color:var(--clay)]"
                  }`}
                >
                  <div className="flex flex-wrap gap-3 text-xs">
                    {event.metrics.btc_price_usd !== undefined && (
                      <div>
                        <span className={`${isCrimeline ? "text-gray-400" : "text-[color:var(--muted)]"} data-label`}>
                          BTC:{" "}
                        </span>
                        <span className={isCrimeline ? "text-gray-200" : "text-[color:var(--ink)]"}>
                          {formatCurrency(event.metrics.btc_price_usd)}
                        </span>
                      </div>
                    )}
                    {event.metrics.market_cap_usd !== undefined && (
                      <div>
                        <span className={`${isCrimeline ? "text-gray-400" : "text-[color:var(--muted)]"} data-label`}>
                          MCap:{" "}
                        </span>
                        <span className={isCrimeline ? "text-gray-200" : "text-[color:var(--ink)]"}>
                          {formatCurrency(event.metrics.market_cap_usd)}
                        </span>
                      </div>
                    )}
                    {event.metrics.tvl_usd !== undefined && (
                      <div>
                        <span className={`${isCrimeline ? "text-gray-400" : "text-[color:var(--muted)]"} data-label`}>
                          TVL:{" "}
                        </span>
                        <span className={isCrimeline ? "text-gray-200" : "text-[color:var(--ink)]"}>
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
                  isCrimeline ? "text-purple-400" : "text-[color:var(--sage)]"
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
