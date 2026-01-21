"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { ScheduledPostsResponse, ScheduledDay, ScheduledSlot } from "@/app/api/admin/scheduled-posts/route";

export default function AdminPostsPage() {
  const [data, setData] = useState<ScheduledPostsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/scheduled-posts?days=4");
      const result: ScheduledPostsResponse = await response.json();

      if (!result.success) {
        setError(result.error || "Failed to fetch scheduled posts");
        return;
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="px-6 pt-10 pb-6 border-b border-white/10">
        <div className="max-w-6xl mx-auto space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Admin / Dev</p>
          <h1 className="text-3xl font-semibold">Bot Posts Dashboard</h1>
          <p className="text-white/70">
            View scheduled posts for Twitter and Farcaster bots for today and the next 3 days.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <Link
              className="inline-flex items-center text-sm text-blue-300 hover:text-blue-200"
              href="/"
            >
              &larr; Back to timeline
            </Link>
            <button
              onClick={fetchPosts}
              disabled={loading}
              className="inline-flex items-center text-sm text-white/60 hover:text-white disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      <main className="px-6 py-10">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Loading State */}
          {loading && !data && (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3 text-white/60">
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Loading scheduled posts...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-md border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          {/* Posts Data */}
          {data && (
            <>
              {/* Current Time Info */}
              <div className="text-sm text-white/50">
                Current time in Chicago:{" "}
                <span className="text-white/80">
                  {new Date(data.currentChicagoTime).toLocaleString("en-US", {
                    timeZone: "America/Chicago",
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>

              {/* Days Grid */}
              <div className="space-y-6">
                {data.days.map((day) => (
                  <DayCard key={day.date} day={day} />
                ))}
              </div>

              {/* Legend */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <h3 className="text-sm font-semibold text-white/80 mb-3">How it works</h3>
                <ul className="text-sm text-white/60 space-y-1">
                  <li>
                    <span className="text-white/80">Posting times:</span> 10 AM, 1 PM, 4 PM, 7 PM, 10 PM (Chicago time)
                  </li>
                  <li>
                    <span className="text-white/80">Event selection:</span> Events are matched by month/day (ignoring year) - posting historical events on their anniversaries
                  </li>
                  <li>
                    <span className="text-white/80">Both platforms:</span> The same events are posted to both Twitter and Farcaster
                  </li>
                  <li>
                    <span className="text-white/80">Empty slots:</span> If no events exist for a particular month/day slot, that slot is skipped
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function DayCard({ day }: { day: ScheduledDay }) {
  const filledSlots = day.slots.filter((s) => s.event !== null).length;
  const totalSlots = day.slots.length;

  return (
    <div
      className={`rounded-xl border bg-white/5 overflow-hidden ${
        day.isToday ? "border-blue-500/50" : "border-white/10"
      }`}
    >
      {/* Day Header */}
      <div
        className={`px-6 py-4 border-b ${
          day.isToday
            ? "bg-blue-500/10 border-blue-500/30"
            : "bg-white/5 border-white/10"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {day.isToday && (
                <span className="text-blue-400 mr-2">Today -</span>
              )}
              {day.dayOfWeek}, {day.displayDate}
            </h2>
            <p className="text-sm text-white/50">{day.date}</p>
          </div>
          <div className="text-right">
            <p className="text-sm">
              <span className="text-white/80">{filledSlots}</span>
              <span className="text-white/40">/{totalSlots} posts</span>
            </p>
          </div>
        </div>
      </div>

      {/* Slots */}
      <div className="divide-y divide-white/10">
        {day.slots.map((slot) => (
          <SlotRow key={slot.slot.index} slot={slot} />
        ))}
      </div>
    </div>
  );
}

function SlotRow({ slot }: { slot: ScheduledSlot }) {
  const { slot: slotInfo, event } = slot;

  return (
    <div
      className={`px-6 py-4 ${
        event ? "bg-transparent" : "bg-white/[0.02]"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Time */}
        <div className="w-24 shrink-0">
          <p className="text-sm font-mono text-white/80">{slotInfo.label}</p>
          <p className="text-xs text-white/40">Slot {slotInfo.index + 1}</p>
        </div>

        {/* Event Info */}
        {event ? (
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-4">
              {/* Event Image */}
              {event.image && (
                <div className="w-16 h-16 shrink-0 rounded-md overflow-hidden bg-white/10">
                  <img
                    src={event.image}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* Event Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {event.title}
                </p>
                <p className="text-xs text-white/50 mt-0.5">
                  {event.date} &middot;{" "}
                  {event.category?.join(", ")}
                </p>
                <p className="text-sm text-white/60 mt-1 line-clamp-2">
                  {getFirstSentence(event.summary)}
                </p>

                {/* Tags and Mode */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {event.mode?.map((m) => (
                    <span
                      key={m}
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        m === "crimeline"
                          ? "bg-red-500/20 text-red-300"
                          : m === "timeline"
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-purple-500/20 text-purple-300"
                      }`}
                    >
                      {m}
                    </span>
                  ))}
                  {event.tags?.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-white/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Event Link */}
                <div className="mt-2">
                  <a
                    href={`/fc/${event.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    View event &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1">
            <p className="text-sm text-white/30 italic">
              No event scheduled for this slot
            </p>
            <p className="text-xs text-white/20 mt-0.5">
              No historical events match this date
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Extracts the first sentence from a summary for preview
 */
function getFirstSentence(text: string): string {
  if (!text) return "";

  // Find the first sentence-ending punctuation followed by a space or end
  const match = text.match(/^.*?[.!?](?:\s|$)/);
  if (match) {
    return match[0].trim();
  }

  // If no sentence ending found, truncate at 150 chars
  if (text.length > 150) {
    return text.substring(0, 147) + "...";
  }

  return text;
}
