"use client";

import { useModeStore } from "@/store/mode-store";
import type { EventTag } from "@/lib/types";

interface TagPillsProps {
  tags: EventTag[];
}

// Map tags to neo-brutalist pill color classes
const tagPillColors: Record<EventTag, string> = {
  TECH: "neo-brutalist-pill-blue",
  ECONOMIC: "neo-brutalist-pill-green",
  REGULATORY: "neo-brutalist-pill-purple",
  CULTURAL: "neo-brutalist-pill-pink",
  SECURITY: "neo-brutalist-pill-orange",
  FAILURE: "neo-brutalist-pill-red",
  MILESTONE: "neo-brutalist-pill-teal",
  ATH: "neo-brutalist-pill-yellow",
};

export function TagPills({ tags }: TagPillsProps) {
  const { mode } = useModeStore();
  const isDarkMode = mode === "crimeline";

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className={`neo-brutalist-pill px-2.5 py-1 text-xs ${tagPillColors[tag]} ${
            isDarkMode ? "neo-brutalist-pill-dark" : ""
          }`}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
