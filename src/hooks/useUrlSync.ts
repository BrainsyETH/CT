"use client";

import { useEffect, useRef } from "react";
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

  // Read URL params on mount and initialize store
  useEffect(() => {
    if (!isInitialMount.current) return;
    isInitialMount.current = false;

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

    // Set tags from URL
    if (urlTags) {
      const tags = urlTags.split(",") as EventTag[];
      tags.forEach((tag) => {
        if (!selectedTags.includes(tag)) {
          toggleTag(tag);
        }
      });
    }

    // Set sort order from URL
    if (urlSort === "asc" || urlSort === "desc") {
      setSortOrder(urlSort);
    }

    // Set selected event from URL
    if (urlEvent) {
      setSelectedEventId(urlEvent);
    }
  }, []); // Only run on mount

  // Sync store state to URL whenever it changes
  useEffect(() => {
    if (isInitialMount.current) return; // Skip initial mount

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
      params.set("tags", selectedTags.join(","));
    }

    // Add sort order to URL (only if desc, asc is default)
    if (sortOrder === "asc") {
      params.set("sort", sortOrder);
    }

    // Add selected event to URL
    if (selectedEventId) {
      params.set("event", selectedEventId);
    }

    // Update URL without page reload
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [mode, searchQuery, selectedTags, sortOrder, selectedEventId, pathname, router]);
}
