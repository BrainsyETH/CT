"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatFn?: (n: number) => string;
  className?: string;
}

export function AnimatedNumber({
  value,
  duration = 1500,
  formatFn,
  className,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (prefersReducedMotion || value === 0) {
      setDisplay(value);
      return;
    }

    startTimeRef.current = performance.now();
    const startVal = 0;

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (value - startVal) * eased);
      setDisplay(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration, prefersReducedMotion]);

  const formatted = formatFn ? formatFn(display) : display.toLocaleString();

  return <span className={className}>{formatted}</span>;
}
