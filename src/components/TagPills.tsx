"use client";

import { useModeStore } from "@/store/mode-store";
import type { EventTag } from "@/lib/types";

interface TagPillsProps {
  tags: EventTag[];
}

const tagColors: Record<EventTag, { timeline: string; crimeline: string }> = {
  TECH: {
    timeline: "bg-blue-100 text-blue-700",
    crimeline: "bg-blue-900/50 text-blue-300",
  },
  ECONOMIC: {
    timeline: "bg-green-100 text-green-700",
    crimeline: "bg-green-900/50 text-green-300",
  },
  REGULATORY: {
    timeline: "bg-purple-100 text-purple-700",
    crimeline: "bg-purple-900/50 text-purple-300",
  },
  CULTURAL: {
    timeline: "bg-pink-100 text-pink-700",
    crimeline: "bg-pink-900/50 text-pink-300",
  },
  SECURITY: {
    timeline: "bg-orange-100 text-orange-700",
    crimeline: "bg-orange-900/50 text-orange-300",
  },
  FAILURE: {
    timeline: "bg-red-100 text-red-700",
    crimeline: "bg-red-900/50 text-red-300",
  },
  MILESTONE: {
    timeline: "bg-teal-100 text-teal-700",
    crimeline: "bg-teal-900/50 text-teal-300",
  },
  ATH: {
    timeline: "bg-yellow-100 text-yellow-700",
    crimeline: "bg-yellow-900/50 text-yellow-300",
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
