"use client";

import { useModeStore } from "@/store/mode-store";
import type { EventTag } from "@/lib/types";

interface TagPillsProps {
  tags: EventTag[];
}

// Improved contrast for all modes
const tagColors: Record<EventTag, { timeline: string; crimeline: string; both: string }> = {
  TECH: {
    timeline: "bg-blue-100 text-blue-800 border border-blue-200",
    crimeline: "bg-blue-900/60 text-blue-200 border border-blue-800",
    both: "bg-blue-900/60 text-blue-200 border border-blue-800",
  },
  ECONOMIC: {
    timeline: "bg-green-100 text-green-800 border border-green-200",
    crimeline: "bg-green-900/60 text-green-200 border border-green-800",
    both: "bg-green-900/60 text-green-200 border border-green-800",
  },
  REGULATORY: {
    timeline: "bg-purple-100 text-purple-800 border border-purple-200",
    crimeline: "bg-purple-900/60 text-purple-200 border border-purple-800",
    both: "bg-purple-900/60 text-purple-200 border border-purple-800",
  },
  CULTURAL: {
    timeline: "bg-pink-100 text-pink-800 border border-pink-200",
    crimeline: "bg-pink-900/60 text-pink-200 border border-pink-800",
    both: "bg-pink-900/60 text-pink-200 border border-pink-800",
  },
  SECURITY: {
    timeline: "bg-orange-100 text-orange-800 border border-orange-200",
    crimeline: "bg-orange-900/60 text-orange-200 border border-orange-800",
    both: "bg-orange-900/60 text-orange-200 border border-orange-800",
  },
  FAILURE: {
    timeline: "bg-red-100 text-red-800 border border-red-200",
    crimeline: "bg-purple-900/60 text-purple-200 border border-purple-800",
    both: "bg-purple-900/60 text-purple-200 border border-purple-800",
  },
  MILESTONE: {
    timeline: "bg-teal-100 text-teal-800 border border-teal-200",
    crimeline: "bg-teal-900/60 text-teal-200 border border-teal-800",
    both: "bg-teal-900/60 text-teal-200 border border-teal-800",
  },
  ATH: {
    timeline: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    crimeline: "bg-yellow-900/60 text-yellow-200 border border-yellow-800",
    both: "bg-yellow-900/60 text-yellow-200 border border-yellow-800",
  },
};

export function TagPills({ tags }: TagPillsProps) {
  const { mode } = useModeStore();

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className={`px-2 py-0.5 text-xs font-medium rounded-full transition-colors duration-300 ${
            tagColors[tag][mode]
          }`}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
