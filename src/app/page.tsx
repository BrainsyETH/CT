"use client";

import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Timeline } from "@/components/Timeline";
import { EventDetailModal } from "@/components/EventDetailModal";
import eventsData from "@/data/events.json";
import type { Event } from "@/lib/types";

const events = eventsData as Event[];

export default function Home() {
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
