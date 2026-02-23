"use client";

import { useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Timeline } from "@/components/Timeline";
import { EventDetailModal } from "@/components/EventDetailModal";
import { Footer } from "@/components/Footer";
import { WeeklyEvents } from "@/components/WeeklyEvents";
import { FeedbackModal } from "@/components/FeedbackModal";
import { useUrlSync } from "@/hooks/useUrlSync";
import { useModeStore } from "@/store/mode-store";
import { getLocalEvents } from "@/lib/local-events";
import type { Event } from "@/lib/types";

interface HomeContentProps {
  events: Event[];
  weeklyEvents?: Event[];
}

export function HomeContent({ events, weeklyEvents = [] }: HomeContentProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [localEvents, setLocalEvents] = useState<Event[]>([]);

  // Rehydrate Zustand store after mount to prevent hydration mismatches
  useEffect(() => {
    const rehydrateResult = useModeStore.persist.rehydrate();
    if (rehydrateResult instanceof Promise) {
      rehydrateResult.then(() => {
        setIsHydrated(true);
      });
    } else {
      // If rehydrate is synchronous, set hydrated immediately
      setIsHydrated(true);
    }
  }, []);

  // Synchronize URL params with store state (only after hydration)
  useUrlSync();

  useEffect(() => {
    setLocalEvents(getLocalEvents());
  }, []);

  const combinedEvents = useMemo(() => {
    if (localEvents.length === 0) {
      return events;
    }

    return [...localEvents, ...events];
  }, [events, localEvents]);

  const { feedbackModal, closeFeedbackModal } = useModeStore();

  // Find the event for editing if an eventId is provided
  const feedbackEvent = feedbackModal.eventId
    ? combinedEvents.find((e) => e.id === feedbackModal.eventId) || null
    : null;

  // Don't render until store is hydrated to prevent hydration mismatches
  if (!isHydrated) {
    return null;
  }

  return (
    <ThemeProvider>
      <Header />
      <main className="pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {weeklyEvents.length > 0 && (
            <WeeklyEvents events={weeklyEvents} />
          )}
          <Timeline events={combinedEvents} />
        </div>
      </main>
      <Footer />
      <EventDetailModal events={combinedEvents} />
      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        onClose={closeFeedbackModal}
        initialType={feedbackModal.type}
        event={feedbackEvent}
      />
    </ThemeProvider>
  );
}
