import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Mode, EventTag, CrimelineType, FeedbackType } from "@/lib/types";

type SortOrder = "asc" | "desc";

interface FeedbackModalState {
  isOpen: boolean;
  type: FeedbackType;
  eventId: string | null;
}

interface ModeState {
  mode: Mode;
  searchQuery: string;
  selectedTags: EventTag[];
  selectedCategories: string[];
  selectedCrimelineTypes: CrimelineType[];
  sortOrder: SortOrder;
  selectedEventId: string | null;
  feedbackModal: FeedbackModalState;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
  setSearchQuery: (query: string) => void;
  toggleTag: (tag: EventTag) => void;
  toggleCategory: (category: string) => void;
  toggleCrimelineType: (type: CrimelineType) => void;
  clearTags: () => void;
  clearCategories: () => void;
  clearCrimelineTypes: () => void;
  clearAllFilters: () => void;
  setSortOrder: (order: SortOrder) => void;
  toggleSortOrder: () => void;
  setSelectedEventId: (id: string | null) => void;
  openFeedbackModal: (type: FeedbackType, eventId?: string | null) => void;
  closeFeedbackModal: () => void;
}

export const useModeStore = create<ModeState>()(
  persist(
    (set) => ({
      mode: "timeline",
      searchQuery: "",
      selectedTags: [],
      selectedCategories: [],
      selectedCrimelineTypes: [],
      sortOrder: "desc",
      selectedEventId: null,
      feedbackModal: { isOpen: false, type: "general", eventId: null },
      setMode: (mode) => set({ mode }),
      toggleMode: () =>
        set((state) => ({
          mode:
            state.mode === "timeline"
              ? "crimeline"
              : state.mode === "crimeline"
              ? "both"
              : "timeline",
        })),
      setSearchQuery: (query) => set({ searchQuery: query }),
      toggleTag: (tag) =>
        set((state) => ({
          selectedTags: state.selectedTags.includes(tag)
            ? state.selectedTags.filter((t) => t !== tag)
            : [...state.selectedTags, tag],
        })),
      toggleCategory: (category) =>
        set((state) => ({
          selectedCategories: state.selectedCategories.includes(category)
            ? state.selectedCategories.filter((c) => c !== category)
            : [...state.selectedCategories, category],
        })),
      toggleCrimelineType: (type) =>
        set((state) => ({
          selectedCrimelineTypes: state.selectedCrimelineTypes.includes(type)
            ? state.selectedCrimelineTypes.filter((t) => t !== type)
            : [...state.selectedCrimelineTypes, type],
        })),
      clearTags: () => set({ selectedTags: [] }),
      clearCategories: () => set({ selectedCategories: [] }),
      clearCrimelineTypes: () => set({ selectedCrimelineTypes: [] }),
      clearAllFilters: () =>
        set({
          searchQuery: "",
          selectedTags: [],
          selectedCategories: [],
          selectedCrimelineTypes: []
        }),
      setSortOrder: (order) => set({ sortOrder: order }),
      toggleSortOrder: () =>
        set((state) => ({
          sortOrder: state.sortOrder === "asc" ? "desc" : "asc",
        })),
      setSelectedEventId: (id) => set({ selectedEventId: id }),
      openFeedbackModal: (type, eventId = null) =>
        set({ feedbackModal: { isOpen: true, type, eventId } }),
      closeFeedbackModal: () =>
        set({ feedbackModal: { isOpen: false, type: "general", eventId: null } }),
    }),
    {
      name: "chain-of-events-mode",
      partialize: (state) => ({ mode: state.mode, sortOrder: state.sortOrder }),
    }
  )
);
