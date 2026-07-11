"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const STORAGE_KEY = "coe-onboarded";

export function OnboardingTooltip() {
  const [show, setShow] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      // Small delay so the page feels settled before showing
      const timer = setTimeout(() => setShow(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => dismiss(), 10000);
    return () => clearTimeout(timer);
  }, [show]);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, "1");
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.95 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed top-28 md:top-20 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[calc(100%-2rem)]"
        >
          <div className="relative bg-white dark:bg-gray-900 border-2 border-teal-500 dark:border-purple-500 rounded-lg shadow-[4px_4px_0px_0px_rgba(20,184,166,0.3)] dark:shadow-[4px_4px_0px_0px_rgba(124,58,237,0.3)] p-4">
            {/* Arrow pointing up - desktop only, where it reliably aligns with the header toggle */}
            <div className="hidden md:block absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-900 border-l-2 border-t-2 border-teal-500 dark:border-purple-500 rotate-45" />

            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              <span className="font-bold text-teal-600 dark:text-purple-400">
                Tip:
              </span>{" "}
              Use the toggle above to switch between{" "}
              <span className="font-semibold">Timeline</span> (crypto milestones),{" "}
              <span className="font-semibold">Crimeline</span> (hacks &amp; scams),
              or <span className="font-semibold">All</span> for the full story.
            </p>

            <button
              onClick={dismiss}
              className="mt-2 text-xs font-bold text-teal-600 dark:text-purple-400 hover:underline"
            >
              Got it
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
