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
const LOGO_URL = "https://xcxqku1c8gojqt7x.public.blob.vercel-storage.com/chain_of_events_small.png";

// Extract first sentence from summary
const getFirstSentence = (text: string): string => {
  const match = text.match(/^[^.!?]+[.!?]/);
  return match ? match[0].trim() : text.split(' ').slice(0, 15).join(' ') + '...';
};

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

  const firstSentence = getFirstSentence(event.summary);

  return (
    <motion.div
      {...animationProps}
      className={`relative flex ${isLeft ? "md:justify-start" : "md:justify-end"} justify-start`}
    >
      {/* Timeline dot */}
      <div
        className={`absolute left-0 md:left-1/2 w-4 h-4 rounded-full -translate-x-1/2 z-10 transition-colors duration-300 ${
          isCrimeline ? "bg-red-500 shadow-red-500/50" : "bg-teal-500 shadow-teal-500/50"
        } shadow-lg`}
      />

      {/* Card - Neo-Brutalist Design */}
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
          className={`w-full text-left focus:outline-none cursor-pointer group`}
        >
          {/* Neo-Brutalist Card with thick border and bold shadow */}
          <div
            className={`relative border-4 border-black transition-all duration-300 overflow-visible ${
              isCrimeline
                ? "bg-red-500 group-hover:translate-x-1 group-hover:-translate-y-1"
                : "bg-yellow-300 group-hover:translate-x-1 group-hover:-translate-y-1"
            }`}
            style={{
              boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
            }}
          >
            {/* Image Container - Full Display */}
            <div className="relative w-full bg-black overflow-hidden" style={{ minHeight: '300px' }}>
              <div className="relative w-full h-full" style={{ minHeight: '300px' }}>
                <Image
                  src={event.image || (isCrimeline ? FALLBACK_IMAGE_CRIMELINE : FALLBACK_IMAGE_TIMELINE)}
                  alt={event.title}
                  fill
                  unoptimized
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Chain of Events Logo - Top Left */}
              <div className="absolute top-4 left-4 w-16 h-16 md:w-20 md:h-20 bg-white border-4 border-black p-2 rotate-[-5deg] z-20">
                <Image
                  src={LOGO_URL}
                  alt="Chain of Events"
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>

              {/* First Sentence Overlay - Creative Positioning */}
              <div
                className="absolute bottom-8 right-6 max-w-[80%] bg-white border-4 border-black px-4 py-3 rotate-[2deg] z-20"
                style={{
                  boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)',
                }}
              >
                <p className="text-sm md:text-base font-bold text-black leading-tight">
                  {firstSentence}
                </p>
              </div>

              {/* Date - Large and Prominent - Top Right */}
              <div
                className={`absolute top-4 right-4 border-4 border-black px-4 py-2 rotate-[3deg] z-20 ${
                  isCrimeline ? "bg-red-500" : "bg-yellow-300"
                }`}
                style={{
                  boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                }}
              >
                <time className="text-xl md:text-2xl font-black text-black uppercase tracking-tight">
                  {formatDate(event.date)}
                </time>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 bg-white border-t-4 border-black">
              {/* Tags */}
              <div className="mb-4">
                <TagPills tags={event.tags} />
              </div>

              {/* Metrics - Only show for Bitcoin category events */}
              {event.metrics && event.category.includes("Bitcoin") && (
                <div className="mb-4 pb-4 border-b-4 border-black">
                  <div className="flex flex-wrap gap-4 text-sm font-bold">
                    {event.metrics.btc_price_usd !== undefined && (
                      <div className="bg-yellow-200 border-2 border-black px-3 py-1">
                        <span className="text-black">
                          BTC: {formatCurrency(event.metrics.btc_price_usd)}
                        </span>
                      </div>
                    )}
                    {event.metrics.market_cap_usd !== undefined && (
                      <div className="bg-yellow-200 border-2 border-black px-3 py-1">
                        <span className="text-black">
                          MCap: {formatCurrency(event.metrics.market_cap_usd)}
                        </span>
                      </div>
                    )}
                    {event.metrics.tvl_usd !== undefined && (
                      <div className="bg-yellow-200 border-2 border-black px-3 py-1">
                        <span className="text-black">
                          TVL: {formatCurrency(event.metrics.tvl_usd)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Crimeline-specific details */}
              {isCrimeline && event.crimeline && (
                <div className="mb-4 pb-4 border-b-4 border-black">
                  {/* Type and Status */}
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="px-3 py-1 text-sm font-black bg-black text-white border-2 border-black uppercase">
                      {event.crimeline.type}
                    </span>
                    {event.crimeline.status && (
                      <span
                        className={`px-3 py-1 text-sm font-bold border-2 border-black uppercase ${
                          event.crimeline.status === "Funds recovered"
                            ? "bg-green-400 text-black"
                            : event.crimeline.status === "Partial recovery"
                            ? "bg-yellow-400 text-black"
                            : event.crimeline.status === "Total loss"
                            ? "bg-red-400 text-white"
                            : "bg-gray-400 text-black"
                        }`}
                      >
                        {event.crimeline.status}
                      </span>
                    )}
                  </div>

                  {/* Funds Lost */}
                  <div className="bg-red-500 border-2 border-black px-3 py-2 inline-block">
                    <span className="text-white text-base font-black uppercase">
                      {formatFundsLost(event.crimeline.funds_lost_usd)} Lost
                    </span>
                  </div>
                </div>
              )}

              {/* Share Button - Bottom Right */}
              <div className="flex justify-end">
                <ShareButton event={event} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
