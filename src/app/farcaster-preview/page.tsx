"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

function PreviewContent() {
  const searchParams = useSearchParams();
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const slot = searchParams.get("slot") || "0";

  const [previewData, setPreviewData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/cron/farcaster-test?date=${date}&slot=${slot}`)
      .then((res) => res.json())
      .then((data) => {
        setPreviewData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [date, slot]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Loading preview...</h1>
        </div>
      </div>
    );
  }

  if (!previewData?.event) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Farcaster Post Preview</h1>
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
            <p className="text-red-300">No event found for {date} slot {slot}</p>
          </div>
          <div className="mt-6">
            <a href="/farcaster-preview?date=2009-01-03&slot=0" className="text-blue-400 hover:underline">
              Try Bitcoin Genesis Day (2009-01-03)
            </a>
          </div>
        </div>
      </div>
    );
  }

  const { event, post, slot: slotInfo } = previewData;
  const eventUrl = post.embeds[0].url;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Farcaster Post Preview</h1>
          <p className="text-gray-400">
            {date} • Slot {slotInfo.index} ({slotInfo.label})
          </p>
        </div>

        {/* Mock Farcaster Cast */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center font-bold text-lg">
              C
            </div>
            <div className="flex-1">
              <div className="font-semibold">Chain of Events</div>
              <div className="text-sm text-gray-400">@chainofevents</div>
            </div>
          </div>

          {/* Cast text */}
          <div className="mb-4 text-base leading-relaxed">{post.text}</div>

          {/* OG Image Embed */}
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <div className="aspect-[1200/630] relative bg-gray-900">
              <iframe
                src={eventUrl}
                className="w-full h-full border-0"
                title="Event preview"
                sandbox="allow-same-origin"
              />
            </div>
            <div className="bg-gray-850 p-3 border-t border-gray-700">
              <div className="text-sm text-gray-400 truncate">{eventUrl}</div>
            </div>
          </div>

          {/* Mock engagement */}
          <div className="flex gap-6 mt-4 pt-4 border-t border-gray-700 text-gray-400 text-sm">
            <button className="hover:text-white">💬 Reply</button>
            <button className="hover:text-white">🔁 Recast</button>
            <button className="hover:text-white">❤️ Like</button>
          </div>
        </div>

        {/* Event Details */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Event Details</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-400">ID:</span>{" "}
              <span className="font-mono">{event.id}</span>
            </div>
            <div>
              <span className="text-gray-400">Title:</span> {event.title}
            </div>
            <div>
              <span className="text-gray-400">Date:</span> {event.date}
            </div>
            <div>
              <span className="text-gray-400">Summary:</span> {event.summary}
            </div>
          </div>
        </div>

        {/* Direct Links */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-bold mb-4">Direct Links</h2>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-gray-400 mb-1">Event Page:</div>
              <a
                href={eventUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline break-all"
              >
                {eventUrl}
              </a>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Farcaster OG Image (right-click → open in new tab):</div>
              <a
                href={`/api/fc-og?title=${encodeURIComponent(event.title)}&date=${encodeURIComponent(
                  event.date
                )}&summary=${encodeURIComponent(event.summary)}&mode=timeline`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline break-all"
              >
                View Farcaster OG Image (title at bottom)
              </a>
            </div>
          </div>
        </div>

        {/* Try other dates */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-4">Try other dates:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <a
              href="?date=2009-01-03&slot=0"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700"
            >
              BTC Genesis (2009-01-03)
            </a>
            <a
              href="?date=2010-05-22&slot=0"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700"
            >
              Pizza Day (2010-05-22)
            </a>
            <a
              href="?date=2023-01-19&slot=0"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700"
            >
              Genesis Bankruptcy (2023-01-19)
            </a>
            <a
              href="?date=2023-01-19&slot=1"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700"
            >
              Slot 1 (Jan 19)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FarcasterPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-900 text-white p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Loading...</h1>
          </div>
        </div>
      }
    >
      <PreviewContent />
    </Suspense>
  );
}
