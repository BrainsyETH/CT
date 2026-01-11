"use client";

import { useState, useEffect } from "react";
import { useModeStore } from "@/store/mode-store";

interface ScrollProgressProps {
  years: number[];
  currentVisibleYear?: number | null;
}

export function ScrollProgress({ years, currentVisibleYear }: ScrollProgressProps) {
  const { mode } = useModeStore();
  const [scrollProgress, setScrollProgress] = useState(0);
  const isCrimeline = mode === "crimeline";

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-[60]">
      <div
        className={`h-full transition-colors duration-300 ${
          isCrimeline
            ? "bg-gradient-to-r from-red-600 to-red-400"
            : "bg-gradient-to-r from-teal-500 to-teal-300"
        }`}
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}
