"use client";

import { useEffect, useRef, useMemo } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useModeStore } from "@/store/mode-store";
import type { Mode, EventTag } from "@/lib/types";

/**
 * Hook to synchronize URL search params with mode store state
 * Enables shareable URLs with filters
 */
export function useUrlSync() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { mode, searchQuery, selectedTags, sortOrder, selectedEventId, setMode, setSearchQuery, toggleTag, setSortOrder, setSelectedEventId } = useModeStore();

  const isInitialMount = useRef(true);
  const isUpdatingFromUrl = useRef(false);
  const hasInitializedFromUrl = useRef(false);
  const previousStateRef = useRef<{
    mode: Mode;
    searchQuery: string;
    tagsString: string;
    sortOrder: "asc" | "desc";
    selectedEventId: string | null;
  } | null>(null);

  // Create a stable string representation of tags for comparison
  const tagsString = useMemo(() => [...selectedTags].sort().join(","), [selectedTags]);

  // Read URL params on mount and initialize store
  useEffect(() => {
    if (!isInitialMount.current) return;
    isInitialMount.current = false;
    isUpdatingFromUrl.current = true;

    const urlMode = searchParams.get("mode") as Mode | null;
    const urlQuery = searchParams.get("q");
    const urlTags = searchParams.get("tags");
    const urlSort = searchParams.get("sort");
    const urlEvent = searchParams.get("event");

    // Set mode from URL
    if (urlMode && (urlMode === "timeline" || urlMode === "crimeline" || urlMode === "both")) {
      setMode(urlMode);
    }

    // Set search query from URL
    if (urlQuery) {
      setSearchQuery(urlQuery);
    }

    // Set tags from URL - use getState to get current tags and update accordingly
    if (urlTags) {
      const tags = urlTags.split(",").filter(Boolean) as EventTag[];
      // Get current tags from store to avoid stale closure
      const currentTags = useModeStore.getState().selectedTags;
      const currentTagsString = [...currentTags].sort().join(",");
      const urlTagsString = [...tags].sort().join(",");
      
      // Only update if tags are different
      if (currentTagsString !== urlTagsString) {
        // Remove tags that aren't in URL
        currentTags.forEach((tag) => {
          if (!tags.includes(tag)) {
            toggleTag(tag);
          }
        });
        // Add tags that are in URL but not in current
        tags.forEach((tag) => {
          if (!currentTags.includes(tag)) {
            toggleTag(tag);
          }
        });
      }
    }

    // Set sort order from URL
    if (urlSort === "asc" || urlSort === "desc") {
      setSortOrder(urlSort);
    }

    // Set selected event from URL
    if (urlEvent) {
      setSelectedEventId(urlEvent);
    }

    // Mark as initialized and reset flag after store updates complete
    // Use requestAnimationFrame to ensure all state updates have been processed
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        hasInitializedFromUrl.current = true;
        isUpdatingFromUrl.current = false;
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Sync store state to URL whenever it changes
  useEffect(() => {
    // Skip if we're still in initial mount, updating from URL, or haven't initialized yet
    if (isInitialMount.current || isUpdatingFromUrl.current || !hasInitializedFromUrl.current) {
      return;
    }

    // Check if state actually changed
    const currentState = {
      mode,
      searchQuery,
      tagsString,
      sortOrder,
      selectedEventId,
    };

    if (previousStateRef.current) {
      const prev = previousStateRef.current;
      if (
        prev.mode === currentState.mode &&
        prev.searchQuery === currentState.searchQuery &&
        prev.tagsString === currentState.tagsString &&
        prev.sortOrder === currentState.sortOrder &&
        prev.selectedEventId === currentState.selectedEventId
      ) {
        // State hasn't changed, skip URL update
        return;
      }
    }

    // Update previous state
    previousStateRef.current = currentState;

    const params = new URLSearchParams();

    // Add mode to URL
    if (mode !== "timeline") {
      params.set("mode", mode);
    }

    // Add search query to URL
    if (searchQuery.trim()) {
      params.set("q", searchQuery);
    }

    // Add tags to URL
    if (selectedTags.length > 0) {
      params.set("tags", tagsString);
    }

    // Add sort order to URL (only if desc, asc is default)
    if (sortOrder === "asc") {
      params.set("sort", sortOrder);
    }

    // Add selected event to URL
    if (selectedEventId) {
      params.set("event", selectedEventId);
    }

    // Build new URL and update
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    const currentUrl = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
    
    // Only update if URL actually changed
    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [mode, searchQuery, tagsString, sortOrder, selectedEventId, pathname, router]);
}
