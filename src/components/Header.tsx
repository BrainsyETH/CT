"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useModeStore } from "@/store/mode-store";
import { ModeToggle } from "./ModeToggle";

const LOGO_IMAGE = "https://xcxqku1c8gojqt7x.public.blob.vercel-storage.com/CoE%20Logo";

// Glitch effect component for crimeline mode
function GlitchText({ 
  children, 
  isActive, 
  prefersReducedMotion 
}: { 
  children: string; 
  isActive: boolean; 
  prefersReducedMotion: boolean | null;
}) {
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isActive || prefersReducedMotion) {
      setGlitchOffset({ x: 0, y: 0 });
      return;
    }

    const interval = setInterval(() => {
      setGlitchOffset({
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
      });
    }, 50);

    const timeout = setTimeout(() => {
      setGlitchOffset({ x: 0, y: 0 });
    }, 150);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isActive, prefersReducedMotion]);

  if (!isActive || prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <span
      className="inline-block"
      style={{
        transform: `translate(${glitchOffset.x}px, ${glitchOffset.y}px)`,
        transition: "transform 0.05s ease-out",
      }}
    >
      {children}
    </span>
  );
}

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
  const [glitchActive, setGlitchActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device for performance optimization
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Use reduced motion on mobile for better performance
  const shouldReduceMotion: boolean = prefersReducedMotion === true || isMobile;
  // #region agent log
  useEffect(() => {
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

  // Trigger glitch effect periodically in crimeline mode (desktop only)
  useEffect(() => {
    if (!isCrimeline || shouldReduceMotion) return;

    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 150);
    }, 5000);

    return () => clearInterval(interval);
  }, [isCrimeline, shouldReduceMotion]);

  // Split title into letters for animation
  const titleText = "Chain of Events";
  const titleLetters = titleText.split("");

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isCrimeline
          ? "bg-gray-950/95 border-b-2 border-purple-900/40 shadow-[0_4px_0_rgba(124,58,237,0.25)]"
          : "bg-white/95 border-b-2 border-gray-200 shadow-[0_4px_0_rgba(15,23,42,0.08)]"
      } backdrop-blur-sm`}
    >
      {/* Desktop Layout */}
      <div className="hidden md:block max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo / Title */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="flex items-center gap-4 min-w-0 cursor-pointer group relative"
            aria-label="Scroll to top"
          >
            {/* Enhanced Logo Container */}
            <motion.div
              className="relative w-12 h-12 flex-shrink-0 overflow-hidden flex items-center justify-center"
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      rotate: isCrimeline ? [0, -5, 5, -5, 0] : 0,
                      scale: isHovered ? 1.1 : isCrimeline ? [1, 1.05, 1] : 1,
                    }
              }
              transition={
                shouldReduceMotion
                  ? {}
                  : {
                      rotate: {
                        duration: 0.5,
                        repeat: isCrimeline ? Infinity : 0,
                        repeatDelay: 3,
                      },
                      scale: {
                        duration: 0.3,
                        repeat: isCrimeline && !isHovered ? Infinity : 0,
                        repeatDelay: 2,
                      },
                    }
              }
              whileHover={shouldReduceMotion ? {} : { rotate: 15, scale: 1.1 }}
            >
              <Image
                src={LOGO_IMAGE}
                alt="Chain of Events Logo"
                width={48}
                height={48}
                className="w-full h-full object-cover"
                unoptimized
              />
            </motion.div>

            {/* Title Section */}
            <motion.div 
              className="min-w-0 text-left relative flex flex-col lg:flex-row lg:items-center lg:gap-8"
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      x: isHovered ? 2 : 0,
                    }
              }
              transition={{ duration: 0.3 }}
            >
              {/* Title with neo-brutalist styling */}
              <motion.h1
                className={`text-2xl md:text-3xl neo-brutalist-title whitespace-nowrap relative ${
                  isCrimeline
                    ? "neo-brutalist-title-crimeline"
                    : "neo-brutalist-title-timeline"
                }`}
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        letterSpacing: isHovered ? "-0.01em" : "-0.02em",
                      }
                }
                transition={{ duration: 0.3 }}
              >
                {shouldReduceMotion ? (
                  titleText
                ) : (
                  <span className="inline-block">
                    {titleLetters.map((letter, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.03,
                        }}
                        className="inline-block"
                      >
                        {letter === " " ? (
                          "\u00A0"
                        ) : isCrimeline && glitchActive && index < 5 ? (
                          <GlitchText
                            isActive={true}
                            prefersReducedMotion={shouldReduceMotion}
                          >
                            {letter}
                          </GlitchText>
                        ) : (
                          letter
                        )}
                      </motion.span>
                    ))}
                  </span>
                )}
              </motion.h1>

              {/* Tagline with neo-brutalist styling */}
              <motion.p
                className={`neo-brutalist-subtitle mt-3 lg:mt-0 lg:whitespace-nowrap ${
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
            </motion.div>
          </button>

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
                className={`relative w-7 h-7 flex-shrink-0 rounded-lg overflow-hidden ${
                  isCrimeline
                    ? "border border-purple-500/50 shadow-[0_0_8px_rgba(124,58,237,0.4)]"
                    : "border border-teal-500/30 shadow-[0_0_8px_rgba(20,184,166,0.3)]"
                }`}
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        rotate: isCrimeline ? [0, -5, 5, -5, 0] : 0,
                        scale: isCrimeline ? [1, 1.05, 1] : 1,
                      }
                }
                transition={
                  shouldReduceMotion
                    ? {}
                    : {
                        rotate: {
                          duration: 0.5,
                          repeat: isCrimeline ? Infinity : 0,
                          repeatDelay: 3,
                        },
                        scale: {
                          duration: 0.3,
                          repeat: isCrimeline ? Infinity : 0,
                          repeatDelay: 2,
                        },
                      }
                }
                whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
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

              {/* Title with neo-brutalist styling */}
              <motion.h1
                className={`text-xl neo-brutalist-title whitespace-nowrap ${
                  isCrimeline
                    ? "neo-brutalist-title-crimeline"
                    : "neo-brutalist-title-timeline"
                }`}
              >
                {titleText}
              </motion.h1>
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
    </header>
  );
}
