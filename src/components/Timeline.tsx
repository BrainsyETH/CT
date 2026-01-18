"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useModeStore } from "@/store/mode-store";
import { EventCard } from "./EventCard";
import { YearJump } from "./YearJump";
import { MobileYearSelector } from "./MobileYearSelector";
import { SearchFilter } from "./SearchFilter";
import { ScrollProgress } from "./ScrollProgress";
import { StatsPanel } from "./StatsPanel";
import { StickyFilterButton } from "./StickyFilterButton";
import { getYear, formatCurrency } from "@/lib/formatters";
import { throttle, isMobile } from "@/lib/utils";
import { isDebugEnabled } from "@/lib/debug";
import type { Event } from "@/lib/types";

interface TimelineProps {
  events: Event[];
}

export function Timeline({ events }: TimelineProps) {
  const {
    mode,
    searchQuery,
    selectedTags,
    selectedCategories,
    selectedCrimelineTypes,
    sortOrder,
    clearAllFilters
  } = useModeStore();

  const activeFilterCount =
    selectedCategories.length +
    selectedCrimelineTypes.length +
    (searchQuery.trim() ? 1 : 0);
  const isCrimeline = mode === "crimeline";
  const isBoth = mode === "both";
  const prefersReducedMotion = useReducedMotion();
  const [currentVisibleYear, setCurrentVisibleYear] = useState<number | null>(null);
  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  const isScrollingProgrammaticallyRef = useRef(false);
  const ESTIMATED_GROUP_HEIGHT = 760;
  const OVERSCAN_PX = 1200;

  // #region agent log
  if (isDebugEnabled()) {
    const timelineRenderCount = useRef(0);
    timelineRenderCount.current += 1;
    fetch('http://127.0.0.1:7242/ingest/08e3f140-63dc-44a7-84db-5d9804078e97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Timeline.tsx:render',message:'Timeline render',data:{renderCount:timelineRenderCount.current,mode,eventsLen:events.length,tagsLen:selectedTags.length,currentVisibleYear,isFilterVisible},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
  }
  // #endregion

  // Filter events based on current mode, search, and tags
  const filteredEvents = useMemo(() => {
    let filtered = events.filter((event) => {
      // Mode filter - handle both string and array formats
      const eventModes = Array.isArray(event.mode) ? event.mode : [event.mode];
      if (mode === "timeline") {
        if (!eventModes.includes("timeline")) return false;
      } else if (mode === "crimeline") {
        if (!eventModes.includes("crimeline") || !event.crimeline) return false;
      }
      // mode === "both" shows all events (no filtering by mode)

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = event.title.toLowerCase().includes(query);
        const matchesSummary = event.summary.toLowerCase().includes(query);
        const categories = Array.isArray(event.category) ? event.category : [event.category];
        const matchesCategory = categories.some((cat) =>
          cat.toLowerCase().includes(query)
        );
        const matchesTags = event.tags.some((tag) =>
          tag.toLowerCase().includes(query)
        );
        if (!matchesTitle && !matchesSummary && !matchesCategory && !matchesTags) {
          return false;
        }
      }

      // Tag filter
      if (selectedTags.length > 0) {
        const hasMatchingTag = selectedTags.some((tag) =>
          event.tags.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }

      // Category filter
      if (selectedCategories.length > 0) {
        const categories = Array.isArray(event.category) ? event.category : [event.category];
        const hasMatchingCategory = categories.some((cat) =>
          selectedCategories.includes(cat)
        );
        if (!hasMatchingCategory) return false;
      }

      // Crimeline Type filter
      if (selectedCrimelineTypes.length > 0) {
        if (!event.crimeline || !selectedCrimelineTypes.includes(event.crimeline.type)) {
          return false;
        }
      }

      return true;
    });

    // Sort by date (YYYY-MM-DD strings sort correctly)
    filtered.sort((a, b) => {
      const aDate = a.date ?? "";
      const bDate = b.date ?? "";
      return sortOrder === "asc"
        ? aDate.localeCompare(bDate)
        : bDate.localeCompare(aDate);
    });

    return filtered;
  }, [events, mode, searchQuery, selectedTags, selectedCategories, selectedCrimelineTypes, sortOrder]);

  // Group events by year
  const groupedEvents = useMemo(() => {
    const groups: Map<number, Event[]> = new Map();

    filteredEvents.forEach((event) => {
      const year = getYear(event.date);
      if (year === null) {
        return;
      }
      if (!groups.has(year)) {
        groups.set(year, []);
      }
      groups.get(year)!.push(event);
    });

    const result = Array.from(groups.entries())
      .map(([year, events]) => ({ year, events }))
      .sort((a, b) => (sortOrder === "asc" ? a.year - b.year : b.year - a.year));

    return result;
  }, [filteredEvents, sortOrder]);

  const years = useMemo(
    () => groupedEvents.map((g) => g.year),
    [groupedEvents]
  );

  const currentYear = years.length > 0 ? years[0] : null;
  const yearIndexMap = useMemo(() => {
    const map = new Map<number, number>();
    groupedEvents.forEach((group, index) => {
      map.set(group.year, index);
    });
    return map;
  }, [groupedEvents]);

  const eventIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    filteredEvents.forEach((event, index) => {
      map.set(event.id, index);
    });
    return map;
  }, [filteredEvents]);

  const [groupHeights, setGroupHeights] = useState<number[]>(
    () => new Array(groupedEvents.length).fill(ESTIMATED_GROUP_HEIGHT)
  );
  
  // Track which measurements are in progress to prevent infinite loops
  const measuringRef = useRef<Set<number>>(new Set());
  const measurementTimeoutRef = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    // #region agent log
    if (isDebugEnabled()) {
      fetch('http://127.0.0.1:7242/ingest/08e3f140-63dc-44a7-84db-5d9804078e97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Timeline.tsx:groupHeightsEffect',message:'groupHeights effect triggered',data:{groupedEventsLen:groupedEvents.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    }
    // #endregion
    setGroupHeights(new Array(groupedEvents.length).fill(ESTIMATED_GROUP_HEIGHT));
    measuringRef.current.clear();
    measurementTimeoutRef.current.clear();
    setVisibleRange({
      start: 0,
      end: Math.min(2, Math.max(0, groupedEvents.length - 1)),
    });
  }, [groupedEvents.length]);

  const groupOffsets = useMemo(() => {
    const offsets: number[] = [];
    let running = 0;
    groupedEvents.forEach((_, index) => {
      offsets[index] = running;
      running += groupHeights[index] ?? ESTIMATED_GROUP_HEIGHT;
    });
    return offsets;
  }, [groupHeights, groupedEvents, ESTIMATED_GROUP_HEIGHT]);

  const totalHeight = useMemo(() => {
    if (groupOffsets.length === 0) return 0;
    const lastIndex = groupOffsets.length - 1;
    return groupOffsets[lastIndex] + (groupHeights[lastIndex] ?? ESTIMATED_GROUP_HEIGHT);
  }, [groupOffsets, groupHeights, ESTIMATED_GROUP_HEIGHT]);

  const updateVisibleRange = useCallback(
    (scrollY: number) => {
      const container = timelineContainerRef.current;
      if (!container) return;

      if (groupOffsets.length === 0) {
        setVisibleRange((prev) => (prev.start === 0 && prev.end === 0 ? prev : { start: 0, end: 0 }));
        setCurrentVisibleYear((prev) => (prev === null ? prev : null));
        return;
      }

      const containerTop = container.getBoundingClientRect().top + window.scrollY;
      // #region agent log
      if (isDebugEnabled()) {
        const visualViewport = typeof window !== 'undefined' && (window as any).visualViewport;
        const viewportData = {
          innerHeight: window.innerHeight,
          innerWidth: window.innerWidth,
          visualViewportHeight: visualViewport?.height,
          visualViewportWidth: visualViewport?.width,
          visualViewportScale: visualViewport?.scale,
          scrollY: window.scrollY,
          containerTop,
          devicePixelRatio: window.devicePixelRatio
        };
        fetch('http://127.0.0.1:7242/ingest/08e3f140-63dc-44a7-84db-5d9804078e97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Timeline.tsx:204',message:'Viewport dimensions during updateVisibleRange',data:viewportData,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      }
      // #endregion
      const viewportTop = scrollY - containerTop;
      const viewportBottom = viewportTop + window.innerHeight;

      let startIndex = 0;
      while (
        startIndex < groupOffsets.length &&
        groupOffsets[startIndex] + (groupHeights[startIndex] ?? ESTIMATED_GROUP_HEIGHT) <
          viewportTop - OVERSCAN_PX
      ) {
        startIndex += 1;
      }

      if (startIndex >= groupOffsets.length) {
        startIndex = groupOffsets.length - 1;
      }

      let endIndex = startIndex;
      while (
        endIndex < groupOffsets.length &&
        groupOffsets[endIndex] < viewportBottom + OVERSCAN_PX
      ) {
        endIndex += 1;
      }

      endIndex = Math.max(startIndex, Math.min(groupOffsets.length - 1, endIndex));
      
      // Only update if values actually changed to prevent infinite re-renders
      setVisibleRange((prev) => {
        if (prev.start === startIndex && prev.end === endIndex) return prev;
        return { start: startIndex, end: endIndex };
      });

      const anchor = viewportTop + 200;
      let yearIndex = 0;
      for (let i = groupOffsets.length - 1; i >= 0; i -= 1) {
        if (groupOffsets[i] <= anchor) {
          yearIndex = i;
          break;
        }
      }
      const newYear = groupedEvents[yearIndex]?.year ?? null;
      setCurrentVisibleYear((prev) => (prev === newYear ? prev : newYear));
    },
    [groupOffsets, groupHeights, groupedEvents, ESTIMATED_GROUP_HEIGHT]
  );

  // Store updateVisibleRange in a ref to avoid effect dependency issues
  const updateVisibleRangeRef = useRef(updateVisibleRange);
  updateVisibleRangeRef.current = updateVisibleRange;

  // Only run on mount and when groupOffsets.length changes (not reference)
  const groupOffsetsLength = groupOffsets.length;
  useEffect(() => {
    updateVisibleRangeRef.current(window.scrollY);
  }, [groupOffsetsLength]);

  // Throttled scroll handler for filter visibility and year tracking
  // Use more aggressive throttling on mobile for better performance
  // Use state to avoid calling isMobile() during render
  const [scrollThrottleMs, setScrollThrottleMs] = useState(100);
  
  useEffect(() => {
    // #region agent log
    if (isDebugEnabled()) {
      fetch('http://127.0.0.1:7242/ingest/08e3f140-63dc-44a7-84db-5d9804078e97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Timeline.tsx:scrollThrottleEffect',message:'scrollThrottle effect triggered',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    }
    // #endregion
    setScrollThrottleMs(isMobile() ? 150 : 100);
  }, []);
  
  // Create throttled scroll handler once and use ref to access latest updateVisibleRange
  // Store in a ref so the effect doesn't re-run when throttleMs changes
  const handleScrollRef = useRef<() => void>(() => {});
  
  useEffect(() => {
    handleScrollRef.current = throttle(() => {
      // Skip all updates during programmatic scrolling to avoid interference
      if (isScrollingProgrammaticallyRef.current) {
        return;
      }

      const scrollY = window.scrollY;
      const lastScrollY = lastScrollYRef.current;

      // Show filter if at the top, or if scrolling up
      if (scrollY < 100) {
        setIsFilterVisible((prev) => prev === true ? prev : true);
      } else if (scrollY < lastScrollY) {
        // Scrolling up - show filter
        setIsFilterVisible((prev) => prev === true ? prev : true);
      } else if (scrollY > lastScrollY + 10) {
        // Scrolling down (with threshold to avoid micro-movements) - hide filter
        setIsFilterVisible((prev) => prev === false ? prev : false);
      }

      lastScrollYRef.current = scrollY;
      updateVisibleRangeRef.current(scrollY);
    }, scrollThrottleMs);
  }, [scrollThrottleMs]);

  // Track scroll for filter visibility (hide on scroll down, show on scroll up - like X/Twitter)
  useEffect(() => {
    const onScroll = () => handleScrollRef.current();
    window.addEventListener("scroll", onScroll, { passive: true });
    // Initial call handled by groupOffsetsLength effect
    return () => window.removeEventListener("scroll", onScroll);
  }, []); // Empty deps - only run once on mount

  // Handle resize - use ref to avoid dependency loop
  useEffect(() => {
    const handleResize = () => updateVisibleRangeRef.current(window.scrollY);
    window.addEventListener("resize", handleResize);
    // Don't call handleResize() here - the groupOffsetsLength effect handles initial call
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty deps - only run once on mount

  // Calculate stats for crimeline mode - exclude unknown/NaN amounts
  const crimelineStats = useMemo(() => {
    if (mode === "timeline") return { totalLost: 0, incidentCount: 0 };
    const crimelineEvents = events.filter(
      (e) => (Array.isArray(e.mode) ? e.mode.includes("crimeline") : e.mode === "crimeline") && e.crimeline
    );
    // Only sum valid numeric amounts (exclude undefined, null, NaN)
    const totalLost = crimelineEvents.reduce((sum, e) => {
      const amount = e.crimeline?.funds_lost_usd;
      if (typeof amount === "number" && !isNaN(amount) && isFinite(amount)) {
        return sum + amount;
      }
      return sum;
    }, 0);
    return { totalLost, incidentCount: crimelineEvents.length };
  }, [events, mode]);

  // Sort order is not considered an "active filter" for the CTA button
  const hasActiveFilters =
    searchQuery.trim() ||
    selectedTags.length > 0 ||
    selectedCategories.length > 0 ||
    selectedCrimelineTypes.length > 0;

  // Use a ref to track current heights to avoid dependency issues
  const groupHeightsRef = useRef<number[]>([]);
  useEffect(() => {
    groupHeightsRef.current = groupHeights;
  }, [groupHeights]);

  const handleGroupMeasure = useCallback(
    (index: number, node: HTMLDivElement | null) => {
      if (!node) {
        measuringRef.current.delete(index);
        const timeoutId = measurementTimeoutRef.current.get(index);
        if (timeoutId) {
          window.cancelAnimationFrame(timeoutId);
          measurementTimeoutRef.current.delete(index);
        }
        return;
      }
      
      // Prevent concurrent measurements for the same index
      if (measuringRef.current.has(index)) return;
      
      // Use requestAnimationFrame to batch measurements and avoid layout thrashing
      const timeoutId = window.requestAnimationFrame(() => {
        measuringRef.current.add(index);
        
        const nextHeight = node.getBoundingClientRect().height;
        const currentHeight = groupHeightsRef.current[index] ?? ESTIMATED_GROUP_HEIGHT;
        
        // Only update if the difference is significant (more than 1px) to avoid sub-pixel differences causing loops
        const heightDiff = Math.abs(nextHeight - currentHeight);
        if (heightDiff <= 1) {
          measuringRef.current.delete(index);
          return;
        }
        
        setGroupHeights((prev) => {
          // Double-check the height hasn't changed during the async update
          const prevHeight = prev[index] ?? ESTIMATED_GROUP_HEIGHT;
          if (Math.abs(nextHeight - prevHeight) <= 1) {
            measuringRef.current.delete(index);
            return prev;
          }
          
          const next = [...prev];
          next[index] = nextHeight;
          measuringRef.current.delete(index);
          return next;
        });
      });
      
      // Store timeout ID to allow cleanup
      const existingTimeout = measurementTimeoutRef.current.get(index);
      if (existingTimeout) {
        window.cancelAnimationFrame(existingTimeout);
      }
      measurementTimeoutRef.current.set(index, timeoutId);
    },
    [ESTIMATED_GROUP_HEIGHT]
  );

  const scrollToYear = useCallback(
    (year: number) => {
      const index = yearIndexMap.get(year);
      if (index === undefined) return;
      const container = timelineContainerRef.current;
      if (!container) return;

      // Set flag to prevent scroll handler from interfering
      isScrollingProgrammaticallyRef.current = true;

      // Use requestAnimationFrame to ensure DOM is ready and measurements are accurate
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Try to find the actual year element in the DOM first (more accurate)
          const yearElement = container.querySelector(`[data-year="${year}"]`) as HTMLElement;
          
          let targetTop: number;
          if (yearElement) {
            // Use the actual element's position
            const elementTop = yearElement.getBoundingClientRect().top + window.scrollY;
            targetTop = elementTop - 44; // Account for scroll-mt-44
          } else {
            // Fallback to calculated offset if element not in DOM (virtualized)
            const containerTop = container.getBoundingClientRect().top + window.scrollY;
            targetTop = containerTop + (groupOffsets[index] ?? 0);
          }
          
          // Scroll to the target position
          window.scrollTo({ top: targetTop, behavior: "smooth" });

          // Clear the flag after scroll completes (smooth scroll typically takes ~500ms)
          // Also listen for scrollend event if available, otherwise use timeout
          const clearFlag = () => {
            isScrollingProgrammaticallyRef.current = false;
            // Update visible range after scroll completes
            updateVisibleRangeRef.current(window.scrollY);
          };

          // Modern browsers support scrollend event
          if ('onscrollend' in window) {
            const handleScrollEnd = () => {
              clearFlag();
              window.removeEventListener('scrollend', handleScrollEnd);
            };
            window.addEventListener('scrollend', handleScrollEnd, { once: true });
          } else {
            // Fallback: clear after smooth scroll duration (typically 500ms)
            setTimeout(clearFlag, 600);
          }
        });
      });
    },
    [groupOffsets, yearIndexMap, updateVisibleRange]
  );

  const animationProps = prefersReducedMotion
    ? { initial: {}, animate: {}, exit: {}, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.4, ease: "easeOut" as const },
      };

  return (
    <>
      <ScrollProgress years={years} currentVisibleYear={currentVisibleYear} />

      {/* Filter Bar - slides up/down based on scroll direction */}
      <div
        className={`relative z-40 transition-all duration-300 ease-in-out pt-[90px] sm:pt-0 ${
          isFilterVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        {/* Search and Filter */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex-1 min-w-0">
              <SearchFilter isFilterVisible={isFilterVisible} />
            </div>
            {mode === "crimeline" && crimelineStats.totalLost > 0 && (
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                className="w-full lg:w-[320px] shrink-0 p-4 rounded-lg bg-gradient-to-r from-gray-900 via-purple-950/30 to-gray-900 border-2 border-purple-900/50 shadow-[4px_4px_0_rgba(124,58,237,0.35)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💀</span>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Total Estimated Loss</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {formatCurrency(crimelineStats.totalLost)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Ongoing</p>
                    <p className="text-lg font-bold text-white">
                      {crimelineStats.incidentCount} incidents
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
            {/* Year Selector - visible on mobile/tablet, hidden on desktop */}
            <div className="lg:hidden shrink-0">
              <MobileYearSelector
                years={years}
                currentYear={currentYear}
                onJump={scrollToYear}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Year Jump Sidebar */}
        <aside className="hidden lg:block sticky top-24 h-fit">
          <YearJump
            years={years}
            currentYear={currentVisibleYear}
            onJump={scrollToYear}
          />
        </aside>

        {/* Timeline Content */}
        <div className="flex-1 relative" ref={timelineContainerRef}>
          {/* Central Timeline Line */}
          <div
            className={`absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 transition-colors duration-300 ${
              isCrimeline ? "bg-purple-900" : isBoth ? "bg-gradient-to-b from-teal-500 via-purple-500 to-purple-700" : "bg-teal-200"
            }`}
            style={{ height: `${totalHeight}px` }}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={`${mode}-${sortOrder}`}
              {...animationProps}
              className="relative py-8"
              style={{ height: `${totalHeight}px` }}
            >
              {groupedEvents.slice(visibleRange.start, visibleRange.end + 1).map(({ year, events: yearEvents }, indexOffset) => {
                const index = visibleRange.start + indexOffset;
                const top = groupOffsets[index] ?? 0;
                return (
                  <div
                    key={year}
                    data-year={year}
                    className="scroll-mt-44 timeline-event-group"
                    style={{ position: "absolute", top: `${top}px`, left: 0, right: 0 }}
                    ref={(node) => {
                      // #region agent log
                      if (isDebugEnabled() && node && index > 0) {
                        const rect = node.getBoundingClientRect();
                        const prevGroup = node.parentElement?.querySelector(`[data-year="${groupedEvents[index - 1]?.year}"]`) as HTMLElement;
                        const prevRect = prevGroup?.getBoundingClientRect();
                        fetch('http://127.0.0.1:7242/ingest/08e3f140-63dc-44a7-84db-5d9804078e97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Timeline.tsx:yearGroup',message:'Year group positioning',data:{year,index,top,rectTop:rect.top,rectBottom:rect.bottom,prevYear:groupedEvents[index - 1]?.year,prevRectBottom:prevRect?.bottom,gap:prevRect ? rect.top - prevRect.bottom : null,isMobile:isMobile()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                      }
                      // #endregion
                      handleGroupMeasure(index, node);
                    }}
                  >
                  {/* Year Header */}
                  <div className={`flex items-center justify-center mb-8 ${index > 0 ? 'pt-8 md:pt-12' : ''}`}>
                    <motion.div
                      initial={prefersReducedMotion ? {} : { scale: 0.8, opacity: 0 }}
                      animate={prefersReducedMotion ? {} : { scale: 1, opacity: 1 }}
                      className={`px-6 py-2 rounded-full font-bold text-lg transition-colors duration-300 ${
                        isCrimeline
                          ? "bg-gray-950 text-purple-300 border-2 border-purple-800"
                          : "bg-teal-100 text-teal-700 border border-teal-200"
                      }`}
                    >
                      {year}
                    </motion.div>
                  </div>

                  {/* Events for this year */}
                  <div className="space-y-6">
                    {yearEvents.map((event) => {
                      const currentIndex = eventIndexMap.get(event.id) ?? 0;
                      return (
                        <div key={event.id} className="event-card">
                          <EventCard
                            event={event}
                            index={currentIndex}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Empty State */}
          {filteredEvents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div
                className={`text-6xl mb-4 ${
                  isCrimeline ? "opacity-30" : "opacity-20"
                }`}
              >
                {isCrimeline ? "🔍" : "📅"}
              </div>
              <p
                className={`text-lg font-medium ${
                  isCrimeline ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No events found
              </p>
              <p
                className={`text-sm mt-1 mb-4 ${
                  isCrimeline ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Try adjusting your search or filters
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    isCrimeline
                      ? "bg-purple-900/50 text-purple-300 hover:bg-purple-900/70 border-2 border-purple-800"
                      : "bg-teal-500 text-white hover:bg-teal-600"
                  }`}
                >
                  Show all events
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Filter Button - Mobile only, shows when filter bar is hidden */}
      <StickyFilterButton
        isFilterVisible={isFilterVisible}
        activeFilterCount={activeFilterCount}
        onScrollToTop={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </>
  );
}
