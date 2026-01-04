import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Mode, EventTag } from "@/lib/types";

type SortOrder = "asc" | "desc";

interface ModeState {
  mode: Mode;
  searchQuery: string;
  selectedTags: EventTag[];
  sortOrder: SortOrder;
  selectedEventId: string | null;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
  setSearchQuery: (query: string) => void;
  toggleTag: (tag: EventTag) => void;
  clearTags: () => void;
  setSortOrder: (order: SortOrder) => void;
  toggleSortOrder: () => void;
  setSelectedEventId: (id: string | null) => void;
}

export const useModeStore = create<ModeState>()(
  persist(
    (set) => ({
      mode: "timeline",
      searchQuery: "",
      selectedTags: [],
      sortOrder: "asc",
      selectedEventId: null,
      setMode: (mode) => set({ mode }),
      toggleMode: () =>
        set((state) => ({
          mode: state.mode === "timeline" ? "crimeline" : "timeline",
        })),
      setSearchQuery: (query) => set({ searchQuery: query }),
      toggleTag: (tag) =>
        set((state) => ({
          selectedTags: state.selectedTags.includes(tag)
            ? state.selectedTags.filter((t) => t !== tag)
            : [...state.selectedTags, tag],
        })),
      clearTags: () => set({ selectedTags: [] }),
      setSortOrder: (order) => set({ sortOrder: order }),
      toggleSortOrder: () =>
        set((state) => ({
          sortOrder: state.sortOrder === "asc" ? "desc" : "asc",
        })),
      setSelectedEventId: (id) => set({ selectedEventId: id }),
    }),
    {
      name: "crypto-timeline-mode",
      partialize: (state) => ({ mode: state.mode, sortOrder: state.sortOrder }),
    }
  )
);
