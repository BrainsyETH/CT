"use client";

import Image from "next/image";
import { formatDate } from "@/lib/formatters";
import type { Event } from "@/lib/types";

const FALLBACK_IMAGE_TIMELINE = "https://xcxqku1c8gojqt7x.public.blob.vercel-storage.com/chain_of_events_small.png";
const FALLBACK_IMAGE_CRIMELINE = "https://xcxqku1c8gojqt7x.public.blob.vercel-storage.com/CoE_Crimeline.png";
const LOGO_URL = "https://xcxqku1c8gojqt7x.public.blob.vercel-storage.com/chain_of_events_small.png";

// Extract first sentence from summary
const getFirstSentence = (text: string): string => {
  const match = text.match(/^[^.!?]+[.!?]/);
  return match ? match[0].trim() : text.split(' ').slice(0, 15).join(' ') + '...';
};

interface SocialSharePreviewProps {
  event: Event;
  mode?: "timeline" | "crimeline";
}

export function SocialSharePreview({ event, mode = "timeline" }: SocialSharePreviewProps) {
  const isCrimeline = mode === "crimeline";
  const firstSentence = getFirstSentence(event.summary);

  return (
    <div className="w-[1200px] h-[630px] relative overflow-hidden">
      {/* Neo-Brutalist Card with thick border and bold shadow */}
      <div
        className={`w-full h-full relative border-8 border-black ${
          isCrimeline ? "bg-red-500" : "bg-yellow-300"
        }`}
        style={{
          boxShadow: '16px 16px 0px 0px rgba(0,0,0,1)',
        }}
      >
        {/* Image Container - Full Display */}
        <div className="relative w-full h-full bg-black">
          <div className="relative w-full h-full">
            <Image
              src={event.image || (isCrimeline ? FALLBACK_IMAGE_CRIMELINE : FALLBACK_IMAGE_TIMELINE)}
              alt={event.title}
              fill
              unoptimized
              className="object-contain"
            />
          </div>

          {/* Chain of Events Logo - Top Left */}
          <div className="absolute top-8 left-8 w-32 h-32 bg-white border-8 border-black p-3 rotate-[-5deg] z-20">
            <Image
              src={LOGO_URL}
              alt="Chain of Events"
              fill
              unoptimized
              className="object-contain"
            />
          </div>

          {/* First Sentence Overlay - Creative Positioning */}
          <div
            className="absolute bottom-16 right-12 max-w-[75%] bg-white border-8 border-black px-8 py-6 rotate-[2deg] z-20"
            style={{
              boxShadow: '12px 12px 0px 0px rgba(0,0,0,1)',
            }}
          >
            <p className="text-2xl font-bold text-black leading-tight">
              {firstSentence}
            </p>
          </div>

          {/* Date - Large and Prominent - Top Right */}
          <div
            className={`absolute top-8 right-8 border-8 border-black px-8 py-4 rotate-[3deg] z-20 ${
              isCrimeline ? "bg-red-500" : "bg-yellow-300"
            }`}
            style={{
              boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
            }}
          >
            <time className="text-4xl font-black text-black uppercase tracking-tight">
              {formatDate(event.date)}
            </time>
          </div>

          {/* Site branding - Bottom Left */}
          <div
            className="absolute bottom-8 left-8 bg-white border-4 border-black px-6 py-3 rotate-[-2deg] z-20"
            style={{
              boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)',
            }}
          >
            <p className="text-xl font-black text-black uppercase">
              chainofevents.xyz
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
