"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModeStore } from "@/store/mode-store";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { mode } = useModeStore();
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevMode, setPrevMode] = useState(mode);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync theme with DOM
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-theme", mode);
    }
  }, [mode, mounted]);

  // Handle mode transition animation
  useEffect(() => {
    if (mounted && prevMode !== mode) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setPrevMode(mode);
      }, 220);
      return () => clearTimeout(timer);
    }
  }, [mode, mounted, prevMode]);

  // Prevent flash of wrong theme
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen transition-colors duration-500 bg-[color:var(--oatmeal)]">
      {/* Mode transition overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] pointer-events-none bg-[color:var(--sage)]"
          />
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}
