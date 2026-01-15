"use client";

import { useEffect, useState, useRef } from "react";
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
  const [isHydrated, setIsHydrated] = useState(false);
  // #region agent log
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  fetch('http://127.0.0.1:7242/ingest/08e3f140-63dc-44a7-84db-5d9804078e97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HomeContent.tsx:render',message:'HomeContent render',data:{renderCount:renderCountRef.current,isHydrated},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  // Rehydrate Zustand store after mount to prevent hydration mismatches
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/08e3f140-63dc-44a7-84db-5d9804078e97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HomeContent.tsx:rehydrateEffect',message:'HomeContent rehydrate effect running',data:{isHydrated},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const rehydrateResult = useModeStore.persist.rehydrate();
    if (rehydrateResult instanceof Promise) {
      rehydrateResult.then(() => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/08e3f140-63dc-44a7-84db-5d9804078e97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HomeContent.tsx:rehydrateComplete',message:'HomeContent rehydrate complete (async)',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        setIsHydrated(true);
      });
    } else {
      // If rehydrate is synchronous, set hydrated immediately
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/08e3f140-63dc-44a7-84db-5d9804078e97',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HomeContent.tsx:rehydrateSync',message:'HomeContent rehydrate complete (sync)',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      setIsHydrated(true);
    }
  }, []);

  // Synchronize URL params with store state (only after hydration)
  useUrlSync();

  const { feedbackModal, closeFeedbackModal } = useModeStore();

  // Find the event for editing if an eventId is provided
  const feedbackEvent = feedbackModal.eventId
    ? events.find((e) => e.id === feedbackModal.eventId) || null
    : null;

  // Don't render until store is hydrated to prevent hydration mismatches
  if (!isHydrated) {
    return null;
  }

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
