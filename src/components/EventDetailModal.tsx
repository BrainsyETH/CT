"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useModeStore } from "@/store/mode-store";
import { CategoryPills } from "./CategoryPills";
import { ShareButton } from "./ShareButton";
import { MediaCarousel } from "./MediaCarousel";
import { formatDate, formatCurrency, formatFundsLost } from "@/lib/formatters";
import { getMediaItems } from "@/lib/media-utils";
import { FALLBACK_IMAGES } from "@/lib/constants";
import { preloadTwitterScript } from "./TwitterEmbed";
import { isMobile } from "@/lib/utils";
import { isDebugEnabled } from "@/lib/debug";
import type { Event } from "@/lib/types";

interface EventDetailModalProps {
  events: Event[];
}

export function EventDetailModal({ events }: EventDetailModalProps) {
  const { mode, selectedEventId, setSelectedEventId, openFeedbackModal } = useModeStore();
  const isCrimeline = mode === "crimeline";
  const prefersReducedMotion = useReducedMotion();
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setMobile(isMobile());
    // #region agent log
    if (!isDebugEnabled()) return;
    const logViewportInfo = () => {
      const visualViewport = typeof window !== 'undefined' && (window as any).visualViewport;
      const viewportInfo: any = {
        innerHeight: window.innerHeight,
        innerWidth: window.innerWidth,
        visualViewportHeight: visualViewport?.height,
        visualViewportWidth: visualViewport?.width,
        visualViewportScale: visualViewport?.scale,
        devicePixelRatio: window.devicePixelRatio,
        scrollY: window.scrollY,
        documentWidth: document.documentElement.clientWidth,
        documentHeight: document.documentElement.clientHeight
      };
      if (modalRef.current) {
        const rect = modalRef.current.getBoundingClientRect();
        viewportInfo.modalRect = {
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height
        };
      }
      fetch('http://127.0.0.1:7242/ingest/08e3f140-63dc-44a7-84db-5d9804078e97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'EventDetailModal.tsx:29',message:'Viewport info on mount/resize',data:viewportInfo,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    };
    logViewportInfo();
    window.addEventListener('resize', logViewportInfo);
    const visualViewport = typeof window !== 'undefined' && (window as any).visualViewport;
    if (visualViewport) {
      visualViewport.addEventListener('resize', logViewportInfo);
      visualViewport.addEventListener('scroll', logViewportInfo);
    }
    return () => {
      window.removeEventListener('resize', logViewportInfo);
      if (visualViewport) {
        visualViewport.removeEventListener('resize', logViewportInfo);
        visualViewport.removeEventListener('scroll', logViewportInfo);
      }
    };
    // #endregion
  }, []);

  const event = events.find((e) => e.id === selectedEventId);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [expandedImageUrl, setExpandedImageUrl] = useState<string>("");
  const [isIncidentDetailsExpanded, setIsIncidentDetailsExpanded] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  // Get media items, with fallback to event.image if no media
  const mediaItems = event
    ? (() => {
        const items = getMediaItems(event);
        // If no media items found, use event.image as fallback
        if (items.length === 0 && event.image) {
          return [{ type: "image" as const, image: { url: event.image, alt: event.title } }];
        }
        return items;
      })()
    : [];

  // Preload Twitter script if modal has Twitter embeds
  useEffect(() => {
    if (selectedEventId && mediaItems.some(item => item.type === "twitter")) {
      preloadTwitterScript();
    }
  }, [selectedEventId, mediaItems]);

  // Reset expanded states when event changes or modal closes
  useEffect(() => {
    setIsIncidentDetailsExpanded(false);
    setIsSummaryExpanded(false);
    setIsImageExpanded(false);
    setExpandedImageUrl("");
  }, [selectedEventId]);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [canDrag, setCanDrag] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const touchStartScrollTop = useRef<number | null>(null);
  const scrollPositionRef = useRef<{ isAtTop: boolean; isAtBottom: boolean }>({ isAtTop: false, isAtBottom: false });
  const isScrollingRef = useRef(false);

  // Close modal handler
  const closeModal = useCallback(() => {
    setSelectedEventId(null);
  }, [setSelectedEventId]);

  // Calculate relative swipe thresholds based on modal height
  const getSwipeThresholds = useCallback(() => {
    if (!modalRef.current || !mobile) {
      return { swipeThreshold: 100, velocityThreshold: 500 };
    }
    const modalHeight = modalRef.current.offsetHeight;
    const viewportHeight = window.innerHeight;
    // #region agent log
    if (isDebugEnabled()) {
      const visualViewport = typeof window !== 'undefined' && (window as any).visualViewport;
      const modalRect = modalRef.current.getBoundingClientRect();
      fetch('http://127.0.0.1:7242/ingest/08e3f140-63dc-44a7-84db-5d9804078e97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'EventDetailModal.tsx:71',message:'Modal viewport calculations',data:{modalHeight,viewportHeight,visualViewportHeight:visualViewport?.height,visualViewportWidth:visualViewport?.width,visualViewportScale:visualViewport?.scale,modalRectTop:modalRect.top,modalRectBottom:modalRect.bottom,devicePixelRatio:window.devicePixelRatio},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    }
    // #endregion
    // Use 15% of modal height or viewport height, whichever is smaller, with a minimum of 80px
    const swipeThreshold = Math.max(80, Math.min(modalHeight * 0.15, viewportHeight * 0.15));
    // Velocity threshold scales with height but has a minimum
    const velocityThreshold = Math.max(400, modalHeight * 0.5);
    return { swipeThreshold, velocityThreshold };
  }, [mobile]);

  // Handle vertical swipe from MediaCarousel (for closing modal over embeds)
  const handleVerticalSwipe = useCallback((deltaY: number, velocity?: number) => {
    if (!mobile) return;
    const { swipeThreshold, velocityThreshold } = getSwipeThresholds();
    // Close on swipe in either direction (up or down)
    const absDeltaY = Math.abs(deltaY);
    const absVelocity = velocity ? Math.abs(velocity) : 0;
    if (absDeltaY > swipeThreshold || absVelocity > velocityThreshold) {
      closeModal();
    }
  }, [mobile, getSwipeThresholds, closeModal]);

  // Handle image expansion from MediaCarousel
  const handleImageExpand = useCallback((imageUrl: string) => {
    setExpandedImageUrl(imageUrl);
    setIsImageExpanded(true);
  }, []);

  // Check scroll position and handle touch events for smart drag detection
  useEffect(() => {
    if (!mobile || !modalRef.current) return;

    const checkScrollPosition = () => {
      const element = modalRef.current;
      if (!element) return;
      
      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight;
      const clientHeight = element.clientHeight;
      const isAtTop = scrollTop === 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1; // 1px tolerance
      
      // Store scroll position for touch handlers
      scrollPositionRef.current = { isAtTop, isAtBottom };
      
      // Only enable drag when at boundaries and not currently scrolling
      if (!isScrollingRef.current) {
        setCanDrag(isAtTop || isAtBottom);
      }
    };

    const element = modalRef.current;
    
    // Track scrolling state
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      isScrollingRef.current = true;
      setCanDrag(false); // Disable drag while scrolling
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrollingRef.current = false;
        checkScrollPosition(); // Re-enable drag if at boundaries
      }, 150); // Wait 150ms after scroll stops
      checkScrollPosition();
    };
    
    // Check on scroll
    element.addEventListener('scroll', handleScroll, { passive: true });
    
    // Handle touch start to detect direction
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch && element) {
        touchStartY.current = touch.clientY;
        touchStartScrollTop.current = element.scrollTop;
        isScrollingRef.current = false;
      }
      // Check scroll position at touch start
      requestAnimationFrame(checkScrollPosition);
    };
    
    // Handle touch move to detect if user is scrolling
    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null || touchStartScrollTop.current === null || !element) return;
      
      const touch = e.touches[0];
      if (!touch) return;
      
      const deltaY = touch.clientY - touchStartY.current;
      const currentScrollTop = element.scrollTop;
      const scrollDelta = Math.abs(currentScrollTop - touchStartScrollTop.current);
      
      // If scroll position changed, user is scrolling (not dragging)
      if (scrollDelta > 5) {
        isScrollingRef.current = true;
        setCanDrag(false);
      } else {
        // Check if we should allow drag based on position and direction
        const { isAtTop, isAtBottom } = scrollPositionRef.current;
        const shouldAllowDrag = (isAtTop && deltaY > 0) || (isAtBottom && deltaY < 0);
        if (!isScrollingRef.current) {
          setCanDrag(shouldAllowDrag && (isAtTop || isAtBottom));
        }
      }
    };
    
    const handleTouchEnd = () => {
      touchStartY.current = null;
      touchStartScrollTop.current = null;
      // Re-check scroll position after touch ends
      setTimeout(() => {
        isScrollingRef.current = false;
        requestAnimationFrame(checkScrollPosition);
      }, 100);
    };
    
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    checkScrollPosition(); // Initial check

    return () => {
      clearTimeout(scrollTimeout);
      element.removeEventListener('scroll', handleScroll);
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [mobile, selectedEventId, isIncidentDetailsExpanded]);


  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isImageExpanded) {
          setIsImageExpanded(false);
        } else {
          closeModal();
        }
      }
    };

    if (selectedEventId) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";

      // Focus the close button when modal opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";

      // Return focus to the triggering element when modal closes without scrolling
      if (previousActiveElement.current && !selectedEventId) {
        previousActiveElement.current.focus({ preventScroll: true });
      }
    };
  }, [selectedEventId, closeModal, isImageExpanded]);

  // Focus trap within modal
  useEffect(() => {
    if (!selectedEventId || !modalRef.current) return;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTabKey);
    return () => document.removeEventListener("keydown", handleTabKey);
  }, [selectedEventId]);

  const animationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 },
        transition: { type: "spring" as const, damping: 25, stiffness: 300 },
      };

  const backdropAnimationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };

  return (
    <AnimatePresence>
      {event && (
        <>
          {/* Backdrop */}
          <motion.div
            {...backdropAnimationProps}
            onClick={closeModal}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            {...animationProps}
            drag={mobile && canDrag ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              // Close on swipe in either direction (up or down) with threshold or velocity (mobile only)
              if (!mobile || !canDrag) return;
              const { swipeThreshold, velocityThreshold } = getSwipeThresholds();
              const absOffsetY = Math.abs(info.offset.y);
              const absVelocityY = Math.abs(info.velocity.y);
              if (absOffsetY > swipeThreshold || absVelocityY > velocityThreshold) {
                closeModal();
              }
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[90vh] overflow-y-auto z-50 rounded-xl shadow-[8px_8px_0_rgba(15,23,42,0.25)] touch-manipulation"
            style={{ touchAction: mobile ? "pan-y" : "auto" }}
          >
            <div
              className={`${
                isCrimeline
                  ? "bg-gray-900 border-2 border-purple-900/50"
                  : "bg-white border-2 border-gray-200"
              }`}
            >
              {/* Header Section - Sticky */}
              <div className={`sticky top-0 z-20 p-4 md:p-3 pb-3 md:pb-3 border-b backdrop-blur-md ${
                isCrimeline 
                  ? "bg-gray-900/95 border-gray-800" 
                  : "bg-white/95 border-gray-200"
              }`}>
                {/* Mobile: Close button top right, title and share on same row, categories below */}
                <div className="flex flex-col md:hidden gap-2">
                  {/* Top row: Close button and title/share */}
                  <div className="flex items-start justify-between gap-2">
                    {/* Title */}
                    <h2
                      id="modal-title"
                      className={`text-lg font-bold flex-1 min-w-0 ${
                        isCrimeline ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {event.title}
                    </h2>
                    {/* Right side: Share button and close button */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <ShareButton event={event} />
                      <button
                        ref={closeButtonRef}
                        onClick={closeModal}
                        aria-label="Close modal"
                        className={`p-1.5 rounded-lg transition-colors ${
                          isCrimeline
                            ? "text-gray-300 hover:text-purple-200 hover:bg-purple-900/40"
                            : "text-gray-500 hover:text-teal-700 hover:bg-teal-100"
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {/* Categories */}
                  <div>
                    <CategoryPills categories={Array.isArray(event.category) ? event.category : [event.category]} />
                  </div>
                </div>

                {/* Desktop: Title and Categories on left, Close button top right, Share buttons below title right-aligned */}
                <div className="hidden md:block">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    {/* Left side: Title and Categories */}
                    <div className="flex-1 min-w-0">
                      <h2
                        id="modal-title"
                        className={`text-xl md:text-2xl font-bold mb-1.5 ${
                          isCrimeline ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {event.title}
                      </h2>
                      <div className="flex items-center gap-3 flex-wrap">
                        <CategoryPills categories={Array.isArray(event.category) ? event.category : [event.category]} />
                        <ShareButton event={event} />
                      </div>
                    </div>

                    {/* Right side: Close button */}
                    <div className="flex-shrink-0">
                      <button
                        ref={closeButtonRef}
                        onClick={closeModal}
                        aria-label="Close modal"
                        className={`p-1.5 rounded-lg transition-colors ${
                          isCrimeline
                            ? "text-gray-300 hover:text-purple-200 hover:bg-purple-900/40"
                            : "text-gray-500 hover:text-teal-700 hover:bg-teal-100"
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Media Carousel */}
              {mediaItems.length > 0 && (
                <div className="relative w-full py-2 md:py-3">
                  <MediaCarousel
                    media={mediaItems}
                    event={event}
                    isCrimeline={isCrimeline}
                    onImageExpand={handleImageExpand}
                    isInModal={true}
                    onVerticalSwipe={handleVerticalSwipe}
                  />
                </div>
              )}

              {/* Content Section - Below Media */}
              <div className="p-4 md:p-5 pt-3 md:pt-4">

                {/* Summary */}
                <div>
                  <p
                    id="modal-description"
                    className={`text-sm md:text-base leading-relaxed whitespace-pre-line ${
                      isCrimeline ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {isSummaryExpanded || event.summary.length <= 300
                      ? event.summary
                      : `${event.summary.slice(0, 300)}...`}
                  </p>
                  {event.summary.length > 300 && (
                    <button
                      onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                      className={`mt-2 text-xs font-medium transition-colors ${
                        isCrimeline
                          ? "text-purple-400 hover:text-purple-300"
                          : "text-teal-600 hover:text-teal-700"
                      }`}
                    >
                      {isSummaryExpanded ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>

                {/* Crimeline Details */}
                {event.crimeline && (
                  <div className={`mt-4 md:mt-5 rounded-lg border-2 shadow-[4px_4px_0_rgba(124,58,237,0.35)] ${
                    isCrimeline
                      ? "bg-purple-950/30 border-purple-900/40"
                      : "bg-purple-100 border-purple-300"
                  }`}>
                    <button
                      onClick={() => setIsIncidentDetailsExpanded(!isIncidentDetailsExpanded)}
                      className={`w-full flex items-center justify-between p-3 md:p-4 text-left ${
                        isIncidentDetailsExpanded ? "" : "rounded-lg"
                      }`}
                      aria-expanded={isIncidentDetailsExpanded}
                    >
                      <h3 className={`text-xs md:text-sm font-semibold ${
                        isCrimeline ? "text-purple-400" : "text-purple-700"
                      }`}>
                        Incident Details
                      </h3>
                      <span className={`text-base md:text-lg font-medium ${
                        isCrimeline ? "text-purple-400" : "text-purple-700"
                      }`}>
                        {isIncidentDetailsExpanded ? "−" : "+"}
                      </span>
                    </button>

                    <AnimatePresence>
                      {isIncidentDetailsExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 md:px-4 pb-3 md:pb-4 space-y-2 md:space-y-3">
                            {/* Type and Status */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`px-3 py-1 text-sm font-bold rounded ${
                                isCrimeline
                                  ? "bg-purple-900/50 text-purple-300"
                                  : "bg-purple-200 text-purple-800"
                              }`}>
                                {event.crimeline.type}
                              </span>
                              {event.crimeline.status && (
                                <span
                                  className={`px-3 py-1 text-sm font-medium rounded ${
                                    event.crimeline.status === "Funds recovered"
                                      ? isCrimeline ? "bg-green-900/50 text-green-300" : "bg-green-200 text-green-800"
                                      : event.crimeline.status === "Partial recovery"
                                      ? isCrimeline ? "bg-yellow-900/50 text-yellow-300" : "bg-yellow-200 text-yellow-800"
                                      : event.crimeline.status === "Total loss"
                                      ? isCrimeline ? "bg-purple-900/50 text-purple-300" : "bg-purple-200 text-purple-800"
                                      : isCrimeline ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
                                  }`}
                                >
                                  {event.crimeline.status}
                                </span>
                              )}
                            </div>

                            {/* Funds Lost */}
                            <div>
                              <p className={`text-xs ${isCrimeline ? "text-gray-400" : "text-gray-600"}`}>Funds Lost</p>
                              <p className={`text-xl md:text-2xl font-bold ${isCrimeline ? "text-purple-400" : "text-purple-700"}`}>
                                {formatFundsLost(event.crimeline.funds_lost_usd)}
                              </p>
                            </div>

                            {/* Root Causes */}
                            {event.crimeline.root_cause && event.crimeline.root_cause.length > 0 && (
                              <div>
                                <p className={`text-xs mb-2 ${isCrimeline ? "text-gray-400" : "text-gray-600"}`}>Root Causes</p>
                                <div className="flex flex-wrap gap-2">
                                  {event.crimeline.root_cause.map((cause, i) => (
                                    <span
                                      key={i}
                                      className={`px-3 py-1 text-sm rounded-full ${
                                        isCrimeline
                                          ? "bg-gray-800 text-gray-300"
                                          : "bg-purple-200 text-purple-800"
                                      }`}
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
                                <p className={`text-xs mb-1 ${isCrimeline ? "text-gray-400" : "text-gray-600"}`}>Aftermath</p>
                                <p className={`text-sm ${isCrimeline ? "text-gray-300" : "text-gray-700"}`}>{event.crimeline.aftermath}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Links */}
                {event.links && event.links.length > 0 && (
                  <div className="mt-4 md:mt-5">
                    <h3
                      className={`text-xs md:text-sm font-semibold mb-2 md:mb-3 ${
                        isCrimeline ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Sources
                    </h3>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {event.links.map((link, i) => (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                            isCrimeline
                              ? "bg-gray-800 text-purple-400 hover:bg-gray-700"
                              : "bg-gray-100 text-teal-600 hover:bg-gray-200"
                          }`}
                        >
                          {link.label}
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggest Edit */}
                <div className={`mt-4 md:mt-5 pt-3 md:pt-4 border-t ${isCrimeline ? "border-gray-800" : "border-gray-200"}`}>
                  <button
                    onClick={() => {
                      openFeedbackModal("edit_event", event.id);
                    }}
                    className={`inline-flex items-center gap-1.5 text-xs transition-colors ${
                      isCrimeline
                        ? "text-gray-500 hover:text-purple-400"
                        : "text-gray-400 hover:text-teal-600"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Suggest Edit
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Image Lightbox */}
          <AnimatePresence>
            {isImageExpanded && expandedImageUrl && (
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0 }}
                animate={prefersReducedMotion ? {} : { opacity: 1 }}
                exit={prefersReducedMotion ? {} : { opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 cursor-zoom-out"
                onClick={() => {
                  setIsImageExpanded(false);
                  setExpandedImageUrl("");
                }}
              >
                <button
                  onClick={() => {
                    setIsImageExpanded(false);
                    setExpandedImageUrl("");
                  }}
                  aria-label="Close full image"
                  className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <motion.div
                  initial={prefersReducedMotion ? {} : { scale: 0.9 }}
                  animate={prefersReducedMotion ? {} : { scale: 1 }}
                  exit={prefersReducedMotion ? {} : { scale: 0.9 }}
                  className="relative max-w-[90vw] max-h-[90vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Image
                    src={expandedImageUrl}
                    alt={event.title}
                    width={1200}
                    height={800}
                    className="object-contain max-w-full max-h-[90vh] rounded-lg"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
