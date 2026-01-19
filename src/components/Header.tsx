"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useModeStore } from "@/store/mode-store";
import { ModeToggle } from "./ModeToggle";
import { ChainOfEventsLogo } from "./ChainOfEventsLogo";
import { isDebugEnabled } from "@/lib/debug";

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
  const headerRef = useRef<HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  // Detect mobile device for performance optimization
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle scroll-based header visibility on mobile
  useEffect(() => {
    if (!isMobile) {
      setIsHeaderVisible(true);
      return;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const lastScrollY = lastScrollYRef.current;

      // Show header if at the top or scrolling up
      if (scrollY < 100) {
        setIsHeaderVisible(true);
      } else if (scrollY < lastScrollY) {
        // Scrolling up - show header
        setIsHeaderVisible(true);
      } else if (scrollY > lastScrollY + 10) {
        // Scrolling down (with threshold) - hide header
        setIsHeaderVisible(false);
      }

      lastScrollYRef.current = scrollY;
    };

    // Initial check
    handleScroll();
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  // Use reduced motion on mobile for better performance
  const shouldReduceMotion: boolean = prefersReducedMotion === true || isMobile;
  // #region agent log
  useEffect(() => {
    if (!isDebugEnabled()) return;
    const logHeaderPosition = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        const visualViewport = typeof window !== 'undefined' && (window as any).visualViewport;
        fetch('http://127.0.0.1:7242/ingest/08e3f140-63dc-44a7-84db-5d9804078e97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Header.tsx:render',message:'Header fixed position check',data:{rectTop:rect.top,rectLeft:rect.left,rectRight:rect.right,rectBottom:rect.bottom,innerHeight:window.innerHeight,innerWidth:window.innerWidth,visualViewportHeight:visualViewport?.height,visualViewportWidth:visualViewport?.width,visualViewportScale:visualViewport?.scale,devicePixelRatio:window.devicePixelRatio},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      }
    };
    logHeaderPosition();
    window.addEventListener('resize', logHeaderPosition);
    const visualViewport = typeof window !== 'undefined' && (window as any).visualViewport;
    if (visualViewport) {
      visualViewport.addEventListener('resize', logHeaderPosition);
      visualViewport.addEventListener('scroll', logHeaderPosition);
    }
    return () => {
      window.removeEventListener('resize', logHeaderPosition);
      if (visualViewport) {
        visualViewport.removeEventListener('resize', logHeaderPosition);
        visualViewport.removeEventListener('scroll', logHeaderPosition);
      }
    };
  }, []);
  // #endregion

  return (
    <motion.header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isCrimeline
          ? "bg-gray-950/95 border-b-2 border-purple-900/40 shadow-[0_4px_0_rgba(124,58,237,0.25)]"
          : "bg-white/95 border-b-2 border-gray-200 shadow-[0_4px_0_rgba(15,23,42,0.08)]"
      } backdrop-blur-sm`}
      animate={
        isMobile
          ? {
              y: isHeaderVisible ? 0 : -200,
            }
          : {}
      }
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
    >
      {/* Desktop Layout */}
      <div className="hidden md:block max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo and Subtitle Section */}
          <div className="flex flex-row items-center gap-8 min-w-0">
            {/* Logo */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="cursor-pointer group relative"
              aria-label="Scroll to top"
            >
              <motion.div
                className="relative flex-shrink-0 flex items-center justify-center gap-3"
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        scale: isHovered ? 1.05 : isCrimeline ? [1, 1.02, 1] : 1,
                      }
                }
                transition={
                  shouldReduceMotion
                    ? {}
                    : {
                        scale: {
                          duration: 0.3,
                          repeat: isCrimeline && !isHovered ? Infinity : 0,
                          repeatDelay: 2,
                        },
                      }
                }
                whileHover={shouldReduceMotion ? {} : { scale: 1.08 }}
              >
                <Image
                  src="/coe_minimalisticv2.png"
                  alt="Chain of Events Logo"
                  width={48}
                  height={48}
                  className="flex-shrink-0"
                  priority
                />
                <ChainOfEventsLogo size="lg" />
              </motion.div>
            </button>

            {/* Subtitle */}
            <motion.p
              className={`neo-brutalist-subtitle whitespace-nowrap text-xs ${
                isCrimeline
                  ? "neo-brutalist-subtitle-crimeline"
                  : "neo-brutalist-subtitle-timeline"
              }`}
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      opacity: isHovered ? 0.9 : 1,
                      transform: isHovered ? "rotate(-0.5deg) scale(1.02)" : "rotate(-1deg) scale(1)",
                    }
              }
              transition={{ duration: 0.3 }}
            >
              {isCrimeline
                ? "The dark history of cryptocurrency"
                : "The history of cryptocurrency"}
            </motion.p>
          </div>

          {/* CT Lore Button + Mode Toggle */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* CT Lore Button */}
            <button
              onClick={() => toggleCategory("CT Lore")}
              aria-pressed={isCtLoreActive}
              aria-label="Filter by CT Lore (Crypto Twitter history)"
              className={`neo-brutalist-btn flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                isCtLoreActive
                  ? "bg-sky-200 text-sky-900 border-sky-400 neo-brutalist-btn-premium-active"
                  : "bg-sky-100 text-sky-700 border-sky-300 hover:bg-sky-200"
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
      <div className="md:hidden max-w-6xl mx-auto px-4 py-3">
        <div className="flex flex-col items-center gap-3">
          {/* Row 1: Logo + Title + Subtitle */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="flex flex-col items-center cursor-pointer group relative w-full"
            aria-label="Scroll to top"
          >
            <div className="flex items-center gap-2">
              {/* Enhanced Logo Container */}
              <motion.div
                className="relative flex-shrink-0 flex items-center justify-center gap-2"
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        scale: isCrimeline ? [1, 1.02, 1] : 1,
                      }
                }
                transition={
                  shouldReduceMotion
                    ? {}
                    : {
                        scale: {
                          duration: 0.3,
                          repeat: isCrimeline ? Infinity : 0,
                          repeatDelay: 2,
                        },
                      }
                }
                whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
              >
                <Image
                  src="/coe_minimalisticv2.png"
                  alt="Chain of Events Logo"
                  width={36}
                  height={36}
                  className="flex-shrink-0"
                  priority
                />
                <ChainOfEventsLogo size="md" />
              </motion.div>
            </div>

            {/* Subtitle/Tagline with neo-brutalist styling */}
            <motion.p
              className={`neo-brutalist-subtitle mt-3 ${
                isCrimeline
                  ? "neo-brutalist-subtitle-crimeline"
                  : "neo-brutalist-subtitle-timeline"
              }`}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'block', visibility: 'visible', opacity: 1 }}
            >
              {isCrimeline
                ? "The dark history of cryptocurrency"
                : "The history of cryptocurrency"}
            </motion.p>
          </button>

          {/* Row 3: CT Lore + Mode Toggle */}
          <div className="flex items-center gap-2">
            {/* CT Lore Button - Compact */}
            <button
              onClick={() => toggleCategory("CT Lore")}
              aria-pressed={isCtLoreActive}
              aria-label="Filter by CT Lore"
              className={`neo-brutalist-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs ${
                isCtLoreActive
                  ? "bg-sky-200 text-sky-900 border-sky-400 neo-brutalist-btn-premium-active"
                  : "bg-sky-100 text-sky-700 border-sky-300 hover:bg-sky-200"
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

      {/* Glitch line effect for crimeline mode (desktop only) */}
      {isCrimeline && !shouldReduceMotion && (
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

      {/* Static glitch line for reduced motion or mobile */}
      {isCrimeline && shouldReduceMotion && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-70" />
      )}
    </motion.header>
  );
}
