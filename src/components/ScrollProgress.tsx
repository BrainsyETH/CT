"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useModeStore } from "@/store/mode-store";

interface ScrollProgressProps {
  years: number[];
  currentVisibleYear?: number | null;
}

export function ScrollProgress({ years, currentVisibleYear }: ScrollProgressProps) {
  const { mode } = useModeStore();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const isCrimeline = mode === "crimeline";
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      // Calculate scroll progress
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);

      // Show indicator while scrolling
      setIsVisible(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => setIsVisible(false), 2000);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [years]);

  const animationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 },
        transition: { duration: 0.2 },
      };

  return (
    <>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-[60]">
        <div
          className={`h-full transition-colors duration-300 ${
            isCrimeline
              ? "bg-red-500"
              : "bg-[#2fb7a0]"
          }`}
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Current Year Indicator */}
      <AnimatePresence>
        {isVisible && currentVisibleYear && (
          <motion.div
            {...animationProps}
            className={`fixed right-4 top-20 z-50 px-4 py-2 rounded-2xl shadow-[4px_4px_0_rgba(0,0,0,0.2)] backdrop-blur-sm border-2 ${
              isCrimeline
                ? "bg-gray-900/90 border-red-900/60 text-red-400"
                : "bg-[#fffaf2]/90 border-[#1f1f1f] text-[#1f1f1f]"
            }`}
          >
            <span className="text-2xl font-bold">{currentVisibleYear}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
