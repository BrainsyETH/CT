"use client";

import { SocialSharePreview } from "@/components/SocialSharePreview";
import eventsData from "@/data/events.json";
import type { Event } from "@/lib/types";

const events = eventsData as Event[];

export default function TestPreviewPage() {
  // Find an event with a long title for testing
  const testEvent = events.find(
    (e) =>
      e.title.length > 60 ||
      e.title.includes("There has been a security breach") ||
      e.id === "bitfinex-hack-2016-08-02"
  ) || events[0];

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center gap-8">
      <h1 className="text-2xl font-bold">Social Share Preview Test</h1>
      <div className="border-4 border-gray-400 rounded-lg p-4 bg-white">
        <SocialSharePreview event={testEvent} mode="timeline" />
      </div>
      <div className="text-sm text-gray-600">
        <p>Event: {testEvent.title}</p>
        <p>Title length: {testEvent.title.length} characters</p>
      </div>
      {/* Test with crimeline mode too */}
      <div className="border-4 border-gray-400 rounded-lg p-4 bg-white">
        <SocialSharePreview event={testEvent} mode="crimeline" />
      </div>
    </div>
  );
}
