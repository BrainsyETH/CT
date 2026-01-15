"use client";

import { useModeStore } from "@/store/mode-store";

interface CategoryPillsProps {
  categories: string[];
}

export function CategoryPills({ categories }: CategoryPillsProps) {
  const { mode } = useModeStore();
  const isCrimeline = mode === "crimeline" || mode === "both";

  return (
    <div className="flex flex-wrap gap-1.5">
      {categories.map((category) => (
        <span
          key={category}
          className={`px-2 py-0.5 text-xs font-medium rounded-full transition-colors duration-300 ${
            isCrimeline
              ? "bg-purple-900/60 text-purple-200 border border-purple-800"
              : "bg-teal-100 text-teal-800 border border-teal-200"
          }`}
        >
          {category}
        </span>
      ))}
    </div>
  );
}
