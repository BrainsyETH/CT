"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useModeStore } from "@/store/mode-store";
import { ModeToggle } from "./ModeToggle";

const LOGO_IMAGE = "https://xcxqku1c8gojqt7x.public.blob.vercel-storage.com/CoE%20Logo";

// Classic Twitter Bird Icon
function TwitterBirdIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
    </svg>
  );
}

export function Header() {
  const { mode, selectedCategories, toggleCategory } = useModeStore();
  const isCrimeline = mode === "crimeline";
  const prefersReducedMotion = useReducedMotion();
  const isCtLoreActive = selectedCategories.includes("CT Lore");

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isCrimeline
          ? "bg-gray-950/95 border-b border-purple-900/40 shadow-[0_4px_0_rgba(124,58,237,0.25)]"
          : "bg-[rgba(255,255,255,0.5)] border-b border-[color:var(--clay)] shadow-sm"
      } backdrop-blur-md`}
    >
      {/* Desktop Layout */}
      <div className="hidden md:block max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo / Title */}
          <div className="flex items-center gap-3 min-w-0">
            <motion.div
              className="w-8 h-8 flex-shrink-0 rounded-lg overflow-hidden"
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
              <Image
                src={LOGO_IMAGE}
                alt="Chain of Events Logo"
                width={32}
                height={32}
                className="w-full h-full object-cover"
                unoptimized
              />
            </motion.div>
            <div className="min-w-0">
              <h1
                className={`text-xl font-bold whitespace-nowrap transition-colors duration-300 font-display ${
                  isCrimeline ? "text-white" : "text-[color:var(--ink)]"
                }`}
              >
                Chain of Events
              </h1>
              <p
                className={`text-xs whitespace-nowrap transition-colors duration-300 ${
                  isCrimeline ? "text-purple-400" : "text-[color:var(--sage)]"
                }`}
              >
                {isCrimeline
                  ? "The dark history of cryptocurrency"
                  : "The history of cryptocurrency"}
              </p>
            </div>
          </div>

          {/* CT Lore Button + Mode Toggle */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* CT Lore Button */}
            <button
              onClick={() => toggleCategory("CT Lore")}
              aria-pressed={isCtLoreActive}
              aria-label="Filter by CT Lore (Crypto Twitter history)"
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap hover:scale-[1.02] ${
                isCtLoreActive
                  ? "bg-[color:var(--ink)] text-[color:var(--white)] border border-[color:var(--ink)] shadow-sm"
                  : "bg-transparent text-[color:var(--ink)] border border-[color:var(--clay)] hover:bg-[color:var(--white)]"
              }`}
            >
              <TwitterBirdIcon className="w-4 h-4" />
              <span>CT</span>
            </button>

            {/* Mode Toggle */}
            <ModeToggle />
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden max-w-5xl mx-auto px-4 py-3">
        <div className="flex flex-col items-center gap-3">
          {/* Row 1: Logo + Title */}
          <div className="flex items-center gap-2">
            <motion.div
              className="w-7 h-7 flex-shrink-0 rounded-lg overflow-hidden"
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
              <Image
                src={LOGO_IMAGE}
                alt="Chain of Events Logo"
                width={28}
                height={28}
                className="w-full h-full object-cover"
                unoptimized
              />
            </motion.div>
            <h1
              className={`text-lg font-bold whitespace-nowrap transition-colors duration-300 font-display ${
                isCrimeline ? "text-white" : "text-[color:var(--ink)]"
              }`}
            >
              Chain of Events
            </h1>
          </div>

          {/* Row 2: Tagline */}
          <p
            className={`text-xs whitespace-nowrap transition-colors duration-300 -mt-1 ${
              isCrimeline ? "text-purple-400" : "text-[color:var(--sage)]"
            }`}
          >
            {isCrimeline
              ? "The dark history of cryptocurrency"
              : "The history of cryptocurrency"}
          </p>

          {/* Row 3: CT Lore + Mode Toggle */}
          <div className="flex items-center gap-2">
            {/* CT Lore Button - Compact */}
            <button
              onClick={() => toggleCategory("CT Lore")}
              aria-pressed={isCtLoreActive}
              aria-label="Filter by CT Lore"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 hover:scale-[1.02] ${
                isCtLoreActive
                  ? "bg-[color:var(--ink)] text-[color:var(--white)] border border-[color:var(--ink)] shadow-sm"
                  : "bg-transparent text-[color:var(--ink)] border border-[color:var(--clay)] hover:bg-[color:var(--white)]"
              }`}
            >
              <TwitterBirdIcon className="w-3.5 h-3.5" />
              <span>CT</span>
            </button>

            {/* Mode Toggle - Compact */}
            <ModeToggle compact />
          </div>
        </div>
      </div>

      {/* Glitch line effect for crimeline mode */}
      {isCrimeline && !prefersReducedMotion && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"
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
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-70" />
      )}
    </header>
  );
}
