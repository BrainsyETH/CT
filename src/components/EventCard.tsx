"use client";

import Image from "next/image";
import { motion, useReducedMotion, PanInfo } from "framer-motion";
import { memo, useState, useEffect, useRef } from "react";
import { useModeStore } from "@/store/mode-store";
import { ShareButton } from "./ShareButton";
import { formatDate, formatCurrency, formatFundsLost } from "@/lib/formatters";
import { getMediaItems } from "@/lib/media-utils";
import { FALLBACK_IMAGES } from "@/lib/constants";
import { isMobile } from "@/lib/utils";
import { preloadTwitterScript } from "./TwitterEmbed";
import type { Event } from "@/lib/types";

interface EventCardProps {
  event: Event;
  index: number;
}

function EventCardBase({ event, index }: EventCardProps) {
  const { mode, setSelectedEventId } = useModeStore();
  const isCrimeline = mode === "crimeline";
  // In "both" mode, use crimeline styling for events that have crimeline data
  const useCrimelineStyle = isCrimeline || (mode === "both" && event.crimeline);
  const isLeft = index % 2 === 0;
  const prefersReducedMotion = useReducedMotion();
  const [mobile, setMobile] = useState(false);
  const dragOccurredRef = useRef(false);

  // Check if mobile after mount to avoid SSR issues
  useEffect(() => {
    setMobile(isMobile());
  }, []);

  // Preload first media item when card is near viewport
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const mediaItems = getMediaItems(event);
    if (mediaItems.length === 0) return;

    const firstItem = mediaItems[0];
    
    // Only preload videos and tweets (images are already lazy loaded by Next.js)
    if (firstItem.type !== "video" && firstItem.type !== "twitter") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Preload first media item
            if (firstItem.type === "twitter" && firstItem.twitter) {
              // Preload Twitter script
              preloadTwitterScript();
            } else if (firstItem.type === "video" && firstItem.video) {
              // For videos, we can preload the poster image (already handled by Next.js Image)
              // The actual video will be loaded when modal opens
            }
            // Disconnect after first intersection
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: isMobile() ? "600px" : "1200px", // 2-3 viewport heights
        threshold: 0.1,
      }
    );

    observer.observe(card);

    return () => {
      observer.disconnect();
    };
  }, [event, mobile]);


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedEventId(event.id);
    }
  };

  // Handle swipe gesture on mobile - only trigger if significant horizontal swipe
  const handleDragStart = () => {
    dragOccurredRef.current = false;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/08e3f140-63dc-44a7-84db-5d9804078e97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'EventCard.tsx:handleDragStart',message:'Drag started',data:{eventId:event.id,mobile},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
  };
  
  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!mobile) return;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/08e3f140-63dc-44a7-84db-5d9804078e97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'EventCard.tsx:handleDrag',message:'Drag in progress',data:{eventId:event.id,offsetX:info.offset.x,offsetY:info.offset.y,velocityX:info.velocity.x,velocityY:info.velocity.y,point:{x:info.point.x,y:info.point.y}},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
  };
  
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!mobile) return;
    
    const swipeThreshold = 80; // Increased threshold to avoid accidental triggers
    const velocityThreshold = 800; // Increased velocity threshold
    
    // Check if it's a horizontal swipe (not vertical scroll)
    // Require horizontal movement to be at least 2x the vertical movement
    const isHorizontalSwipe = Math.abs(info.offset.x) > Math.abs(info.offset.y) * 2;
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/08e3f140-63dc-44a7-84db-5d9804078e97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'EventCard.tsx:handleDragEnd',message:'Drag ended',data:{eventId:event.id,offsetX:info.offset.x,offsetY:info.offset.y,velocityX:info.velocity.x,velocityY:info.velocity.y,isHorizontalSwipe,willTrigger:isHorizontalSwipe && (Math.abs(info.offset.x) > swipeThreshold || Math.abs(info.velocity.x) > velocityThreshold)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    if (isHorizontalSwipe && (Math.abs(info.offset.x) > swipeThreshold || Math.abs(info.velocity.x) > velocityThreshold)) {
      dragOccurredRef.current = true;
      // Swipe detected - open modal
      setSelectedEventId(event.id);
    }
  };
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open modal if clicking on share button
    const target = e.target as HTMLElement;
    if (target.closest('[data-share-button]')) {
      return;
    }
    // Prevent click if drag just occurred
    if (dragOccurredRef.current) {
      dragOccurredRef.current = false;
      return;
    }
    setSelectedEventId(event.id);
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
      ref={cardRef}
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
        <motion.div
          drag={mobile ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          dragDirectionLock={true}
          dragPropagation={false}
          dragMomentum={false}
          whileDrag={{ scale: 0.98 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          role="button"
          tabIndex={0}
          onClick={handleCardClick}
          onKeyDown={handleKeyDown}
          className={`w-full text-left focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg transition-all duration-300 cursor-pointer group ${
            useCrimelineStyle ? "focus:ring-purple-500" : "focus:ring-teal-500"
          }`}
          style={{ touchAction: mobile ? "pan-x pan-y" : "auto" }}
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
            {/* Event Image */}
            <div className="relative w-full aspect-[16/9] overflow-hidden">
              <Image
                src={event.video?.poster_url || event.image || (isCrimeline ? FALLBACK_IMAGES.CRIMELINE : FALLBACK_IMAGES.TIMELINE)}
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
              {/* Video Play Icon Overlay */}
              {event.video && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/60 rounded-full p-4 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4">
              {/* Header with Date and Share */}
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

              {/* Summary - Improved contrast */}
              <p
                className={`mt-2 text-sm leading-relaxed transition-colors duration-300 line-clamp-2 ${
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
        </motion.div>
      </div>
    </motion.div>
  );
}

export const EventCard = memo(EventCardBase);
