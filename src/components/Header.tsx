"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useModeStore } from "@/store/mode-store";
import { ModeToggle } from "./ModeToggle";

export function Header() {
  const { mode } = useModeStore();
  const isCrimeline = mode === "crimeline";
  const prefersReducedMotion = useReducedMotion();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isCrimeline
          ? "bg-gray-950/95 border-b border-red-900/30"
          : "bg-white/95 border-b border-gray-200"
      } backdrop-blur-sm`}
    >
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo / Title */}
        <div className="flex items-center gap-3">
          <motion.div
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${
              isCrimeline ? "bg-red-900" : "bg-teal-500"
            }`}
            animate={
              prefersReducedMotion
                ? {}
                : {
                    rotate: isCrimeline ? [0, -5, 5, -5, 0] : 0,
                  }
            }
            transition={
              prefersReducedMotion
                ? {}
                : {
                    duration: 0.5,
                    repeat: isCrimeline ? Infinity : 0,
                    repeatDelay: 3,
                  }
            }
          >
            <span className="text-white font-bold text-sm">
              {isCrimeline ? "💀" : "₿"}
            </span>
          </motion.div>
          <div>
            <h1
              className={`text-xl font-bold transition-colors duration-300 ${
                isCrimeline ? "text-white" : "text-gray-900"
              }`}
            >
              {isCrimeline ? "Chain of Crimes" : "Chain of Events"}
            </h1>
            <p
              className={`text-xs transition-colors duration-300 ${
                isCrimeline ? "text-red-400" : "text-teal-600"
              }`}
            >
              {isCrimeline
                ? "The dark history of cryptocurrency"
                : "The history of cryptocurrency"}
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <ModeToggle />
      </div>

      {/* Glitch line effect for crimeline mode */}
      {isCrimeline && !prefersReducedMotion && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent"
          animate={{
            opacity: [0.3, 1, 0.3],
            scaleX: [1, 1.02, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Static glitch line for reduced motion */}
      {isCrimeline && prefersReducedMotion && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-70" />
      )}
    </header>
  );
}
