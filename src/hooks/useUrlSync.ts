"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useModeStore } from "@/store/mode-store";
import type { Mode, EventTag, CrimelineType } from "@/lib/types";

/**
 * Hook to synchronize URL search params with mode store state
 * Enables shareable URLs with filters
 */
export function useUrlSync() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    mode,
    searchQuery,
    selectedTags,
    selectedCategories,
    selectedCrimelineTypes,
    sortOrder,
    selectedEventId,
    setMode,
    setSearchQuery,
    toggleTag,
    toggleCategory,
    toggleCrimelineType,
    setSortOrder,
    setSelectedEventId,
  } = useModeStore();

  const isInitialMount = useRef(true);
  const isUpdatingFromUrl = useRef(false);
  const hasInitializedFromUrl = useRef(false);
  const [isStoreHydrated, setIsStoreHydrated] = useState(false);
  const previousStateRef = useRef<{
    mode: Mode;
    searchQuery: string;
    tagsString: string;
    categoriesString: string;
    typesString: string;
    sortOrder: "asc" | "desc";
    selectedEventId: string | null;
  } | null>(null);

  // Create a stable representation for dependency tracking
  // Use length and sorted string to detect actual changes, not just reference changes
  const tagsKey = `${selectedTags.length}:${[...selectedTags].sort().join(",")}`;
  const categoriesKey = `${selectedCategories.length}:${[...selectedCategories].sort().join(",")}`;
  const typesKey = `${selectedCrimelineTypes.length}:${[...selectedCrimelineTypes].sort().join(",")}`;

  // Wait for Zustand store to hydrate before doing anything
  useEffect(() => {
    if (isStoreHydrated) return;

    const rehydrateResult = useModeStore.persist.rehydrate();
    if (rehydrateResult instanceof Promise) {
      rehydrateResult.then(() => {
        setIsStoreHydrated(true);
      });
    } else {
      // If rehydrate is synchronous, set hydrated immediately
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
    const urlCategories = searchParams.get("cat");
    const urlTypes = searchParams.get("type");
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

    // Reconcile a multi-select store list with the comma-separated URL param.
    // Uses getState-provided current values to avoid stale closures; batched in
    // setTimeout so the updates complete before URL sync re-runs.
    const reconcileListParam = <T extends string>(
      urlValue: string | null,
      getCurrent: () => T[],
      toggle: (value: T) => void
    ) => {
      if (!urlValue) return;
      const values = urlValue.split(",").filter(Boolean) as T[];
      const current = getCurrent();
      const currentString = [...current].sort().join(",");
      const urlString = [...values].sort().join(",");

      if (currentString !== urlString) {
        setTimeout(() => {
          current.forEach((value) => {
            if (!values.includes(value)) {
              toggle(value);
            }
          });
          values.forEach((value) => {
            if (!current.includes(value)) {
              toggle(value);
            }
          });
        }, 0);
      }
    };

    reconcileListParam<EventTag>(
      urlTags,
      () => useModeStore.getState().selectedTags,
      toggleTag
    );
    reconcileListParam<string>(
      urlCategories,
      () => useModeStore.getState().selectedCategories,
      toggleCategory
    );
    reconcileListParam<CrimelineType>(
      urlTypes,
      () => useModeStore.getState().selectedCrimelineTypes,
      toggleCrimelineType
    );

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
    // Skip if store not hydrated, still in initial mount, updating from URL, or haven't initialized yet
    if (!isStoreHydrated || isInitialMount.current || isUpdatingFromUrl.current || !hasInitializedFromUrl.current) {
      return;
    }

    // Compute list strings inside effect to avoid dependency issues
    const tagsString = [...selectedTags].sort().join(",");
    const categoriesString = [...selectedCategories].sort().join(",");
    const typesString = [...selectedCrimelineTypes].sort().join(",");

    // Check if state actually changed
    const currentState = {
      mode,
      searchQuery,
      tagsString,
      categoriesString,
      typesString,
      sortOrder,
      selectedEventId,
    };

    if (previousStateRef.current) {
      const prev = previousStateRef.current;
      if (
        prev.mode === currentState.mode &&
        prev.searchQuery === currentState.searchQuery &&
        prev.tagsString === currentState.tagsString &&
        prev.categoriesString === currentState.categoriesString &&
        prev.typesString === currentState.typesString &&
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

    // Add categories to URL
    if (selectedCategories.length > 0) {
      params.set("cat", categoriesString);
    }

    // Add crimeline incident types to URL
    if (selectedCrimelineTypes.length > 0) {
      params.set("type", typesString);
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
  }, [mode, searchQuery, tagsKey, categoriesKey, typesKey, sortOrder, selectedEventId, pathname, router]);
}
