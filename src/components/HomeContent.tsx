"use client";

import { useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Timeline } from "@/components/Timeline";
import { EventDetailModal } from "@/components/EventDetailModal";
import { Footer } from "@/components/Footer";
import { FeedbackModal } from "@/components/FeedbackModal";
import { OnThisDayCard } from "@/components/OnThisDayCard";
import { DamageCounter } from "@/components/DamageCounter";
import { RandomEventButton } from "@/components/RandomEventButton";
import { HeroSection } from "@/components/HeroSection";
import { SkeletonTimeline } from "@/components/SkeletonTimeline";
import { OnboardingTooltip } from "@/components/OnboardingTooltip";
import { useUrlSync } from "@/hooks/useUrlSync";
import { useModeStore } from "@/store/mode-store";
import { getLocalEvents } from "@/lib/local-events";
import type { Event } from "@/lib/types";

interface HomeContentProps {
  events: Event[];
}

export function HomeContent({ events }: HomeContentProps) {
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
    return (
      <ThemeProvider>
        <Header />
        <SkeletonTimeline />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Header />
      <OnboardingTooltip />
      <main className="pt-40 md:pt-32 pb-20 lg:pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <HeroSection events={combinedEvents} />
          {/* Random event button — always accessible below header */}
          <div className="flex items-center justify-center mb-4">
            <RandomEventButton events={combinedEvents} />
          </div>
          <OnThisDayCard events={combinedEvents} />
          <div id="timeline-section">
            <Timeline events={combinedEvents} />
          </div>
        </div>
      </main>
      <Footer />
      <DamageCounter events={combinedEvents} />
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
