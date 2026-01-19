"use client";

import { useModeStore } from "@/store/mode-store";

interface ChainOfEventsLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ChainOfEventsLogo({
  className = "",
  size = "md"
}: ChainOfEventsLogoProps) {
  const mode = useModeStore((state) => state.mode);
  const isCrimeline = mode === "crimeline";

  // Size variants
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  // Color schemes based on mode
  const mainTextColor = isCrimeline
    ? "text-purple-500" // Crimeline purple for main text in crimeline mode
    : "text-gray-900 dark:text-gray-100"; // Dark text in timeline mode

  const ofTextColor = isCrimeline
    ? "text-gray-100" // Light color for "of" in crimeline mode
    : "text-purple-500"; // Crimeline purple for "of" in timeline mode

  return (
    <div className={`font-bold ${sizeClasses[size]} ${className}`}>
      <span
        className={`${mainTextColor} transition-colors duration-350`}
        style={{ letterSpacing: '-0.05em' }}
      >
        chain
      </span>
      <span
        className={`${ofTextColor} transition-colors duration-350`}
        style={{ letterSpacing: '-0.05em' }}
      >
        of
      </span>
      <span
        className={`${mainTextColor} transition-colors duration-350`}
        style={{ letterSpacing: '-0.05em' }}
      >
        events
      </span>
    </div>
  );
}
