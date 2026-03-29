"use client";

export function SkeletonTimeline() {
  return (
    <div className="pt-40 md:pt-32 pb-20 lg:pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Random event button skeleton */}
        <div className="flex items-center justify-center mb-4">
          <div className="h-10 w-40 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </div>

        {/* On This Day skeleton */}
        <div className="mb-8 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/3 aspect-[16/9] md:aspect-auto bg-gray-200 dark:bg-gray-800" />
            <div className="p-4 flex-1 space-y-3">
              <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>
        </div>

        {/* Timeline skeleton cards */}
        <div className="relative">
          {/* Center line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800" />

          <div className="space-y-8">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`relative flex ${
                  i % 2 === 0 ? "md:justify-start" : "md:justify-end"
                } justify-start`}
              >
                {/* Timeline dot */}
                <div className="absolute left-0 md:left-1/2 w-4 h-4 rounded-full -translate-x-1/2 z-10 bg-gray-300 dark:bg-gray-700 animate-pulse" />

                {/* Card */}
                <div
                  className={`ml-6 md:ml-0 w-full md:w-[calc(50%-2rem)] ${
                    i % 2 === 0 ? "md:mr-8" : "md:ml-8"
                  }`}
                >
                  <div className="rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
                    {/* Image placeholder */}
                    <div className="w-full aspect-[16/9] bg-gray-200 dark:bg-gray-800" />

                    <div className="p-4 space-y-3">
                      {/* Date badge */}
                      <div className="h-5 w-20 rounded bg-gray-200 dark:bg-gray-800" />
                      {/* Title */}
                      <div className="h-5 w-4/5 rounded bg-gray-200 dark:bg-gray-800" />
                      {/* Summary lines */}
                      <div className="space-y-2">
                        <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-800" />
                        <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
