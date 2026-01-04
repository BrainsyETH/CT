"use client";

import { motion } from "framer-motion";
import { useModeStore } from "@/store/mode-store";
import { TagPills } from "./TagPills";
import { ShareButton } from "./ShareButton";
import { formatDate, formatCurrency } from "@/lib/formatters";
import type { Event } from "@/lib/types";

interface EventCardProps {
  event: Event;
  index: number;
}

export function EventCard({ event, index }: EventCardProps) {
  const { mode, setSelectedEventId } = useModeStore();
  const isCrimeline = mode === "crimeline";
  const isLeft = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
      className={`relative flex ${isLeft ? "md:justify-start" : "md:justify-end"} justify-start`}
    >
      {/* Timeline dot */}
      <div
        className={`absolute left-0 md:left-1/2 w-4 h-4 rounded-full -translate-x-1/2 z-10 transition-colors duration-300 ${
          isCrimeline ? "bg-red-500 shadow-red-500/50" : "bg-teal-500 shadow-teal-500/50"
        } shadow-lg`}
      />

      {/* Card */}
      <div
        className={`ml-6 md:ml-0 w-full md:w-[calc(50%-2rem)] ${
          isLeft ? "md:mr-8" : "md:ml-8"
        }`}
      >
        <button
          onClick={() => setSelectedEventId(event.id)}
          className={`w-full text-left focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg transition-all duration-300 group ${
            isCrimeline ? "focus:ring-red-500" : "focus:ring-teal-500"
          }`}
        >
          <div
            className={`p-4 rounded-lg shadow-lg transition-all duration-300 ${
              isCrimeline
                ? "bg-gray-900 border border-red-900/30 shadow-red-900/20 group-hover:border-red-700/50 group-hover:shadow-red-900/40"
                : "bg-white border border-gray-200 shadow-gray-200/50 group-hover:border-teal-300 group-hover:shadow-teal-200/50"
            }`}
          >
            {/* Header with Date and Share */}
            <div className="flex items-start justify-between">
              <time
                className={`text-sm font-medium transition-colors duration-300 ${
                  isCrimeline ? "text-red-400" : "text-teal-600"
                }`}
              >
                {formatDate(event.date)}
              </time>
              <ShareButton event={event} />
            </div>

            {/* Title */}
            <h3
              className={`mt-1 text-lg font-bold transition-colors duration-300 ${
                isCrimeline ? "text-white group-hover:text-red-300" : "text-gray-900 group-hover:text-teal-700"
              }`}
            >
              {event.title}
            </h3>

            {/* Summary */}
            <p
              className={`mt-2 text-sm leading-relaxed transition-colors duration-300 line-clamp-2 ${
                isCrimeline ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {event.summary}
            </p>

            {/* Tags */}
            <div className="mt-3">
              <TagPills tags={event.tags} />
            </div>

            {/* Metrics */}
            {event.metrics && (
              <div
                className={`mt-3 pt-3 border-t transition-colors duration-300 ${
                  isCrimeline ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <div className="flex flex-wrap gap-3 text-xs">
                  {event.metrics.btc_price_usd !== undefined && (
                    <div>
                      <span className={isCrimeline ? "text-gray-500" : "text-gray-400"}>
                        BTC:{" "}
                      </span>
                      <span className={isCrimeline ? "text-gray-300" : "text-gray-700"}>
                        {formatCurrency(event.metrics.btc_price_usd)}
                      </span>
                    </div>
                  )}
                  {event.metrics.market_cap_usd !== undefined && (
                    <div>
                      <span className={isCrimeline ? "text-gray-500" : "text-gray-400"}>
                        MCap:{" "}
                      </span>
                      <span className={isCrimeline ? "text-gray-300" : "text-gray-700"}>
                        {formatCurrency(event.metrics.market_cap_usd)}
                      </span>
                    </div>
                  )}
                  {event.metrics.tvl_usd !== undefined && (
                    <div>
                      <span className={isCrimeline ? "text-gray-500" : "text-gray-400"}>
                        TVL:{" "}
                      </span>
                      <span className={isCrimeline ? "text-gray-300" : "text-gray-700"}>
                        {formatCurrency(event.metrics.tvl_usd)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Crimeline-specific details */}
            {isCrimeline && event.crimeline && (
              <div className="mt-3 pt-3 border-t border-red-900/30">
                {/* Type and Status */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2 py-1 text-xs font-bold bg-red-900/50 text-red-300 rounded">
                    {event.crimeline.type}
                  </span>
                  {event.crimeline.status && (
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        event.crimeline.status === "Funds recovered"
                          ? "bg-green-900/50 text-green-300"
                          : event.crimeline.status === "Partial recovery"
                          ? "bg-yellow-900/50 text-yellow-300"
                          : event.crimeline.status === "Total loss"
                          ? "bg-red-900/50 text-red-300"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {event.crimeline.status}
                    </span>
                  )}
                </div>

                {/* Funds Lost */}
                {event.crimeline.funds_lost_usd !== undefined && (
                  <div className="mb-2">
                    <span className="text-red-400 text-sm font-bold">
                      {formatCurrency(event.crimeline.funds_lost_usd)} Lost
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Click hint */}
            <div
              className={`mt-3 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                isCrimeline ? "text-red-400" : "text-teal-600"
              }`}
            >
              Click for details →
            </div>
          </div>
        </button>
      </div>
    </motion.div>
  );
}
