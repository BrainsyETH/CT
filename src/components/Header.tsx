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
  prefersReducedMotion: boolean;
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

  // Trigger glitch effect periodically in crimeline mode
  useEffect(() => {
    if (!isCrimeline || prefersReducedMotion) return;

    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 150);
    }, 5000);

    return () => clearInterval(interval);
  }, [isCrimeline, prefersReducedMotion]);

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
            className="flex items-center gap-3 min-w-0 cursor-pointer group relative"
            aria-label="Scroll to top"
          >
            {/* Enhanced Logo Container */}
            <motion.div
              className={`relative w-8 h-8 flex-shrink-0 rounded-lg overflow-hidden ${
                isCrimeline
                  ? "border border-purple-500/50 shadow-[0_0_12px_rgba(124,58,237,0.4)]"
                  : "border border-teal-500/30 shadow-[0_0_12px_rgba(20,184,166,0.3)]"
              }`}
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      rotate: isCrimeline ? [0, -5, 5, -5, 0] : 0,
                      scale: isHovered ? 1.1 : isCrimeline ? [1, 1.05, 1] : 1,
                    }
              }
              transition={
                prefersReducedMotion
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
              whileHover={prefersReducedMotion ? {} : { rotate: 15, scale: 1.1 }}
            >
              <Image
                src={LOGO_IMAGE}
                alt="Chain of Events Logo"
                width={32}
                height={32}
                className="w-full h-full object-cover"
                unoptimized
              />
              {/* Rotating border ring for crimeline */}
              {isCrimeline && !prefersReducedMotion && (
                <motion.div
                  className="absolute inset-0 rounded-lg border-2 border-purple-400/30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
              )}
            </motion.div>

            {/* Title Section */}
            <motion.div 
              className="min-w-0 text-left relative"
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      x: isHovered ? 2 : 0,
                    }
              }
              transition={{ duration: 0.3 }}
            >
              {/* Title with gradient and animations */}
              <motion.h1
                className={`text-xl font-extrabold whitespace-nowrap tracking-tight relative ${
                  isCrimeline
                    ? "bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]"
                    : "bg-gradient-to-r from-teal-600 via-teal-500 to-teal-700 bg-clip-text text-transparent"
                } transition-all duration-300`}
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        letterSpacing: isHovered ? "0.05em" : "0em",
                      }
                }
                transition={{ duration: 0.3 }}
              >
                {prefersReducedMotion ? (
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
                            prefersReducedMotion={prefersReducedMotion}
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

              {/* Tagline with enhanced styling */}
              <motion.p
                className={`text-xs whitespace-nowrap transition-colors duration-300 mt-0.5 ${
                  isCrimeline ? "text-purple-400" : "text-teal-600"
                }`}
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        opacity: isHovered ? 0.8 : 1,
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
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                isCtLoreActive
                  ? "bg-sky-100 text-sky-900 border-2 border-emerald-400 shadow-[0_0_0_1px_rgb(20,184,166),0_0_12px_rgba(16,185,129,0.6)] hover:shadow-[0_0_0_1px_rgb(5,150,105),0_0_16px_rgba(16,185,129,0.8)]"
                  : "bg-sky-100 text-sky-700 border border-sky-200 hover:bg-sky-200"
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
          {/* Row 1: Logo + Title */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="flex items-center gap-2 cursor-pointer group relative"
            aria-label="Scroll to top"
          >
            {/* Enhanced Logo Container */}
            <motion.div
              className={`relative w-7 h-7 flex-shrink-0 rounded-lg overflow-hidden ${
                isCrimeline
                  ? "border border-purple-500/50 shadow-[0_0_8px_rgba(124,58,237,0.4)]"
                  : "border border-teal-500/30 shadow-[0_0_8px_rgba(20,184,166,0.3)]"
              }`}
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      rotate: isCrimeline ? [0, -5, 5, -5, 0] : 0,
                      scale: isCrimeline ? [1, 1.05, 1] : 1,
                    }
              }
              transition={
                prefersReducedMotion
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
              whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
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

            {/* Title with gradient */}
            <motion.h1
              className={`text-lg font-extrabold whitespace-nowrap tracking-tight ${
                isCrimeline
                  ? "bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500 bg-clip-text text-transparent"
                  : "bg-gradient-to-r from-teal-600 via-teal-500 to-teal-700 bg-clip-text text-transparent"
              } transition-all duration-300`}
            >
              {titleText}
            </motion.h1>
          </button>

          {/* Row 2: Tagline */}
          <motion.p
            className={`text-xs whitespace-nowrap transition-colors duration-300 -mt-1 ${
              isCrimeline ? "text-purple-400" : "text-teal-600"
            }`}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: -5 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {isCrimeline
              ? "The dark history of cryptocurrency"
              : "The history of cryptocurrency"}
          </motion.p>

          {/* Row 3: CT Lore + Mode Toggle */}
          <div className="flex items-center gap-2">
            {/* CT Lore Button - Compact */}
            <button
              onClick={() => toggleCategory("CT Lore")}
              aria-pressed={isCtLoreActive}
              aria-label="Filter by CT Lore"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                isCtLoreActive
                  ? "bg-sky-100 text-sky-900 border-2 border-emerald-400 shadow-[0_0_0_1px_rgb(20,184,166),0_0_12px_rgba(16,185,129,0.6)]"
                  : "bg-sky-100 text-sky-700 border border-sky-200 hover:bg-sky-200"
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
