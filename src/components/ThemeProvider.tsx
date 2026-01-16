"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModeStore } from "@/store/mode-store";
import { isDebugEnabled } from "@/lib/debug";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { mode } = useModeStore();
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevMode, setPrevMode] = useState(mode);

  // #region agent log
  if (isDebugEnabled()) {
    const themeRenderCount = useRef(0);
    themeRenderCount.current += 1;
    fetch('http://127.0.0.1:7242/ingest/08e3f140-63dc-44a7-84db-5d9804078e97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ThemeProvider.tsx:render',message:'ThemeProvider render',data:{renderCount:themeRenderCount.current,mode,mounted,isTransitioning,prevMode},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
  }
  // #endregion

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
    // #region agent log
    if (isDebugEnabled()) {
      fetch('http://127.0.0.1:7242/ingest/08e3f140-63dc-44a7-84db-5d9804078e97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ThemeProvider.tsx:transitionEffect',message:'ThemeProvider transition effect',data:{mounted,prevMode,mode,isTransitioning},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
    }
    // #endregion
    if (mounted && prevMode !== mode) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setPrevMode(mode);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [mode, mounted, prevMode]);

  // Prevent flash of wrong theme
  if (!mounted) {
    return null;
  }

  const isCrimeline = mode === "crimeline";

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isCrimeline ? "bg-gray-950" : "bg-gray-50"
      }`}
    >
      {/* Mode transition overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className={`fixed inset-0 z-[100] pointer-events-none ${
              isCrimeline ? "bg-purple-900" : "bg-teal-500"
            }`}
          />
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}
