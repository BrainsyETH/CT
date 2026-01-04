import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Mode } from "@/lib/types";

interface ModeState {
  mode: Mode;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
}

export const useModeStore = create<ModeState>()(
  persist(
    (set) => ({
      mode: "timeline",
      setMode: (mode) => set({ mode }),
      toggleMode: () =>
        set((state) => ({
          mode: state.mode === "timeline" ? "crimeline" : "timeline",
        })),
    }),
    {
      name: "crypto-timeline-mode",
    }
  )
);
