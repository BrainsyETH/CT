"use client";

import { useModeStore } from "@/store/mode-store";
import { motion, useReducedMotion } from "framer-motion";

export function ModeToggle() {
  const { mode, toggleMode } = useModeStore();
  const isCrimeline = mode === "crimeline";
  const prefersReducedMotion = useReducedMotion();

  return (
    <button
      onClick={toggleMode}
      className="relative flex items-center gap-3 px-4 py-2 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent"
      style={{
        backgroundColor: isCrimeline
          ? "rgba(127, 29, 29, 0.5)"
          : "rgba(47, 183, 160, 0.18)",
      }}
      role="switch"
      aria-checked={isCrimeline}
      aria-label={`Switch to ${isCrimeline ? "Timeline" : "Crimeline"} mode`}
    >
      <span
        className={`text-sm font-medium transition-colors duration-300 ${
          isCrimeline ? "text-gray-400" : "text-[#1f1f1f]"
        }`}
      >
        Timeline
      </span>

      <div
        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
          isCrimeline ? "bg-red-900" : "bg-[#2fb7a0]"
        }`}
      >
        <motion.div
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
          animate={{
            left: isCrimeline ? "calc(100% - 20px)" : "4px",
          }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 500, damping: 30 }
          }
        />
      </div>

      <span
        className={`text-sm font-medium transition-colors duration-300 ${
          isCrimeline ? "text-red-400" : "text-gray-400"
        }`}
      >
        Crimeline
      </span>

      <span className="sr-only" aria-live="polite">
        {isCrimeline ? "Crimeline mode active" : "Timeline mode active"}
      </span>
    </button>
  );
}
