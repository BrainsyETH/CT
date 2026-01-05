"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Timeline } from "@/components/Timeline";
import { EventDetailModal } from "@/components/EventDetailModal";
import { useModeStore } from "@/store/mode-store";
import type { Event } from "@/lib/types";

interface HomeContentProps {
  events: Event[];
}

export function HomeContent({ events }: HomeContentProps) {
  const searchParams = useSearchParams();
  const { setSelectedEventId } = useModeStore();

  // Open modal if event ID is in URL
  useEffect(() => {
    const eventId = searchParams.get("event");
    if (eventId) {
      const event = events.find((e) => e.id === eventId);
      if (event) {
        setSelectedEventId(eventId);
      }
    }
  }, [searchParams, events, setSelectedEventId]);

  return (
    <ThemeProvider>
      <Header />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Timeline events={events} />
        </div>
      </main>
      <EventDetailModal events={events} />
    </ThemeProvider>
  );
}
