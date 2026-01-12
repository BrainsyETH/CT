"use client";

import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Timeline } from "@/components/Timeline";
import { EventDetailModal } from "@/components/EventDetailModal";
import { Footer } from "@/components/Footer";
import { FeedbackModal } from "@/components/FeedbackModal";
import { useUrlSync } from "@/hooks/useUrlSync";
import { useModeStore } from "@/store/mode-store";
import type { Event } from "@/lib/types";

interface HomeContentProps {
  events: Event[];
}

export function HomeContent({ events }: HomeContentProps) {
  // Synchronize URL params with store state
  useUrlSync();

  const { feedbackModal, closeFeedbackModal } = useModeStore();

  // Find the event for editing if an eventId is provided
  const feedbackEvent = feedbackModal.eventId
    ? events.find((e) => e.id === feedbackModal.eventId) || null
    : null;

  return (
    <ThemeProvider>
      <Header />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Timeline events={events} />
        </div>
      </main>
      <Footer />
      <EventDetailModal events={events} />
      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        onClose={closeFeedbackModal}
        initialType={feedbackModal.type}
        event={feedbackEvent}
      />
    </ThemeProvider>
  );
}
