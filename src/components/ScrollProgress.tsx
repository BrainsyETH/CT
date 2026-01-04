"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModeStore } from "@/store/mode-store";

interface ScrollProgressProps {
  years: number[];
}

export function ScrollProgress({ years }: ScrollProgressProps) {
  const { mode } = useModeStore();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const isCrimeline = mode === "crimeline";

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

      // Find current year based on scroll position
      for (let i = years.length - 1; i >= 0; i--) {
        const yearElement = document.getElementById(`year-${years[i]}`);
        if (yearElement) {
          const rect = yearElement.getBoundingClientRect();
          if (rect.top <= 150) {
            setCurrentYear(years[i]);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [years]);

  return (
    <>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-[60]">
        <motion.div
          className={`h-full transition-colors duration-300 ${
            isCrimeline
              ? "bg-gradient-to-r from-red-600 to-red-400"
              : "bg-gradient-to-r from-teal-500 to-teal-300"
          }`}
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Current Year Indicator */}
      <AnimatePresence>
        {isVisible && currentYear && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className={`fixed right-4 top-20 z-50 px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm ${
              isCrimeline
                ? "bg-gray-900/90 border border-red-900/50 text-red-400"
                : "bg-white/90 border border-gray-200 text-teal-600"
            }`}
          >
            <span className="text-2xl font-bold">{currentYear}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
