"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModeStore } from "@/store/mode-store";
import { TagPills } from "./TagPills";
import { formatDate, formatCurrency } from "@/lib/formatters";
import type { Event } from "@/lib/types";

interface EventDetailModalProps {
  events: Event[];
}

export function EventDetailModal({ events }: EventDetailModalProps) {
  const { mode, selectedEventId, setSelectedEventId } = useModeStore();
  const isCrimeline = mode === "crimeline";

  const event = events.find((e) => e.id === selectedEventId);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedEventId(null);
      }
    };

    if (selectedEventId) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedEventId, setSelectedEventId]);

  return (
    <AnimatePresence>
      {event && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEventId(null)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[80vh] overflow-y-auto z-50 rounded-xl shadow-2xl"
          >
            <div
              className={`p-6 ${
                isCrimeline
                  ? "bg-gray-900 border border-red-900/50"
                  : "bg-white border border-gray-200"
              }`}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedEventId(null)}
                className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
                  isCrimeline
                    ? "text-gray-400 hover:text-white hover:bg-gray-800"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Date */}
              <time
                className={`text-sm font-medium ${
                  isCrimeline ? "text-red-400" : "text-teal-600"
                }`}
              >
                {formatDate(event.date)}
              </time>

              {/* Title */}
              <h2
                className={`mt-2 text-2xl font-bold ${
                  isCrimeline ? "text-white" : "text-gray-900"
                }`}
              >
                {event.title}
              </h2>

              {/* Category */}
              <p
                className={`mt-1 text-sm ${
                  isCrimeline ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {event.category}
              </p>

              {/* Tags */}
              <div className="mt-4">
                <TagPills tags={event.tags} />
              </div>

              {/* Summary */}
              <p
                className={`mt-4 text-base leading-relaxed ${
                  isCrimeline ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {event.summary}
              </p>

              {/* Metrics */}
              {event.metrics && (
                <div
                  className={`mt-6 p-4 rounded-lg ${
                    isCrimeline ? "bg-gray-800" : "bg-gray-50"
                  }`}
                >
                  <h3
                    className={`text-sm font-semibold mb-3 ${
                      isCrimeline ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Market Context
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {event.metrics.btc_price_usd !== undefined && (
                      <div>
                        <p className={`text-xs ${isCrimeline ? "text-gray-500" : "text-gray-400"}`}>
                          BTC Price
                        </p>
                        <p className={`text-lg font-bold ${isCrimeline ? "text-white" : "text-gray-900"}`}>
                          {formatCurrency(event.metrics.btc_price_usd)}
                        </p>
                      </div>
                    )}
                    {event.metrics.market_cap_usd !== undefined && (
                      <div>
                        <p className={`text-xs ${isCrimeline ? "text-gray-500" : "text-gray-400"}`}>
                          Market Cap
                        </p>
                        <p className={`text-lg font-bold ${isCrimeline ? "text-white" : "text-gray-900"}`}>
                          {formatCurrency(event.metrics.market_cap_usd)}
                        </p>
                      </div>
                    )}
                    {event.metrics.tvl_usd !== undefined && (
                      <div>
                        <p className={`text-xs ${isCrimeline ? "text-gray-500" : "text-gray-400"}`}>
                          TVL
                        </p>
                        <p className={`text-lg font-bold ${isCrimeline ? "text-white" : "text-gray-900"}`}>
                          {formatCurrency(event.metrics.tvl_usd)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Crimeline Details */}
              {event.crimeline && (
                <div className="mt-6 p-4 rounded-lg bg-red-950/30 border border-red-900/30">
                  <h3 className="text-sm font-semibold text-red-400 mb-3">
                    Incident Details
                  </h3>

                  <div className="space-y-3">
                    {/* Type and Status */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 text-sm font-bold bg-red-900/50 text-red-300 rounded">
                        {event.crimeline.type}
                      </span>
                      {event.crimeline.status && (
                        <span
                          className={`px-3 py-1 text-sm font-medium rounded ${
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
                      <div>
                        <p className="text-xs text-gray-500">Funds Lost</p>
                        <p className="text-2xl font-bold text-red-400">
                          {formatCurrency(event.crimeline.funds_lost_usd)}
                        </p>
                        {event.crimeline.victims_estimated && (
                          <p className="text-sm text-gray-400">
                            Estimated {event.crimeline.victims_estimated} victims
                          </p>
                        )}
                      </div>
                    )}

                    {/* Root Causes */}
                    {event.crimeline.root_cause && event.crimeline.root_cause.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Root Causes</p>
                        <div className="flex flex-wrap gap-2">
                          {event.crimeline.root_cause.map((cause, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 text-sm bg-gray-800 text-gray-300 rounded-full"
                            >
                              {cause}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Aftermath */}
                    {event.crimeline.aftermath && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Aftermath</p>
                        <p className="text-sm text-gray-300">{event.crimeline.aftermath}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Links */}
              {event.links && event.links.length > 0 && (
                <div className="mt-6">
                  <h3
                    className={`text-sm font-semibold mb-3 ${
                      isCrimeline ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Sources
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {event.links.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          isCrimeline
                            ? "bg-gray-800 text-red-400 hover:bg-gray-700"
                            : "bg-gray-100 text-teal-600 hover:bg-gray-200"
                        }`}
                      >
                        {link.label}
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
