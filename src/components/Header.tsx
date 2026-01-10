"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useModeStore } from "@/store/mode-store";
import { ModeToggle } from "./ModeToggle";

const LOGO_IMAGE = "https://xcxqku1c8gojqt7x.public.blob.vercel-storage.com/CoE%20Logo.png";

export function Header() {
  const { mode } = useModeStore();
  const isCrimeline = mode === "crimeline";
  const prefersReducedMotion = useReducedMotion();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isCrimeline
          ? "bg-gray-950/95 border-b-2 border-red-900/60"
          : "bg-[#fffaf2]/95 border-b-2 border-[#1f1f1f]"
      } backdrop-blur-sm`}
    >
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo / Title */}
        <div className="flex items-center gap-3">
          <motion.div
            className="w-8 h-8 rounded-lg overflow-hidden"
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
          <div>
            <h1
              className={`text-xl font-bold transition-colors duration-300 ${
                isCrimeline ? "text-white" : "text-gray-900"
              }`}
            >
              Chain of Events
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
          className="absolute bottom-0 left-0 right-0 h-px bg-red-500/70"
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
        <div className="absolute bottom-0 left-0 right-0 h-px bg-red-500/70" />
      )}
    </header>
  );
}
