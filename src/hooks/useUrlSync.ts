"use client";

import { useEffect, useRef, useState } from "react";
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
  const [isStoreHydrated, setIsStoreHydrated] = useState(false);
  const previousStateRef = useRef<{
    mode: Mode;
    searchQuery: string;
    tagsString: string;
    sortOrder: "asc" | "desc";
    selectedEventId: string | null;
  } | null>(null);
  
  // #region agent log
  const urlSyncRenderCount = useRef(0);
  urlSyncRenderCount.current += 1;
  fetch('http://127.0.0.1:7242/ingest/08e3f140-63dc-44a7-84db-5d9804078e97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useUrlSync.ts:render',message:'useUrlSync render',data:{renderCount:urlSyncRenderCount.current,isStoreHydrated,isInitialMount:isInitialMount.current,hasInitialized:hasInitializedFromUrl.current,mode,searchQuery,tagsLen:selectedTags.length,sortOrder,selectedEventId},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  // Create a stable representation for dependency tracking
  // Use length and sorted string to detect actual changes, not just reference changes
  const tagsKey = `${selectedTags.length}:${[...selectedTags].sort().join(",")}`;

  // Wait for Zustand store to hydrate before doing anything
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/08e3f140-63dc-44a7-84db-5d9804078e97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useUrlSync.ts:hydrateEffect',message:'useUrlSync hydrate effect',data:{isStoreHydrated},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (isStoreHydrated) return;
    
    const rehydrateResult = useModeStore.persist.rehydrate();
    if (rehydrateResult instanceof Promise) {
      rehydrateResult.then(() => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/08e3f140-63dc-44a7-84db-5d9804078e97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useUrlSync.ts:hydrateComplete',message:'useUrlSync rehydrate complete (async)',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        setIsStoreHydrated(true);
      });
    } else {
      // If rehydrate is synchronous, set hydrated immediately
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/08e3f140-63dc-44a7-84db-5d9804078e97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useUrlSync.ts:hydrateSync',message:'useUrlSync rehydrate complete (sync)',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      setIsStoreHydrated(true);
    }
  }, [isStoreHydrated]);

  // Read URL params on mount and initialize store (only after hydration)
  useEffect(() => {
    if (!isInitialMount.current || !isStoreHydrated) return;
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
        // Batch tag updates using setTimeout to ensure they complete before URL sync
        setTimeout(() => {
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
        }, 0);
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
    // Use multiple requestAnimationFrames and setTimeout to ensure all state updates have been processed
    // This gives time for any batched tag updates to complete (they run in setTimeout with 0ms delay)
    setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            hasInitializedFromUrl.current = true;
            isUpdatingFromUrl.current = false;
          });
        });
      });
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStoreHydrated]); // Only run on mount and after hydration

  // Sync store state to URL whenever it changes
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/08e3f140-63dc-44a7-84db-5d9804078e97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useUrlSync.ts:urlSyncEffect',message:'URL sync effect triggered',data:{isStoreHydrated,isInitialMount:isInitialMount.current,isUpdatingFromUrl:isUpdatingFromUrl.current,hasInitialized:hasInitializedFromUrl.current,mode,searchQuery,tagsKey,sortOrder,selectedEventId,pathname},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    // Skip if store not hydrated, still in initial mount, updating from URL, or haven't initialized yet
    if (!isStoreHydrated || isInitialMount.current || isUpdatingFromUrl.current || !hasInitializedFromUrl.current) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/08e3f140-63dc-44a7-84db-5d9804078e97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useUrlSync.ts:urlSyncSkipped',message:'URL sync skipped (guards)',data:{isStoreHydrated,isInitialMount:isInitialMount.current,isUpdatingFromUrl:isUpdatingFromUrl.current,hasInitialized:hasInitializedFromUrl.current},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      return;
    }

    // Compute tags string inside effect to avoid dependency issues
    const tagsString = [...selectedTags].sort().join(",");

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
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/08e3f140-63dc-44a7-84db-5d9804078e97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useUrlSync.ts:urlSyncNoChange',message:'URL sync skipped (no state change)',data:{prev,currentState},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        return;
      }
    }

    // Update previous state
    previousStateRef.current = currentState;

    const params = new URLSearchParams();

    // Add mode to URL (only if not the default "both")
    if (mode !== "both") {
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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/08e3f140-63dc-44a7-84db-5d9804078e97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useUrlSync.ts:routerReplace',message:'Calling router.replace',data:{newUrl,currentUrl},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      router.replace(newUrl, { scroll: false });
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/08e3f140-63dc-44a7-84db-5d9804078e97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useUrlSync.ts:urlSyncSameUrl',message:'URL sync skipped (same URL)',data:{newUrl,currentUrl},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
    }
  }, [mode, searchQuery, tagsKey, sortOrder, selectedEventId, pathname, router]);
}
