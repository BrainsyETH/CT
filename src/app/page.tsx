import { Metadata } from "next";
import { Suspense } from "react";
import { HomeContent } from "@/components/HomeContent";
import eventsData from "@/data/events.json";
import type { Event } from "@/lib/types";

const events = eventsData as Event[];

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://chainofevents.xyz/";

type Props = {
  searchParams: Promise<{ event?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const eventId = params.event;
  const baseUrl = new URL(siteUrl);
  const toAbsoluteUrl = (path: string) => new URL(path, baseUrl).toString();

  if (eventId) {
    const event = events.find((e) => e.id === eventId);
    if (event) {
      const title = `${event.title} | Chain of Events`;
      const description = event.summary;
      const twitterTitle =
        title.length > 70 ? `${title.slice(0, 67).trimEnd()}...` : title;

      // Format date for OG image
      const date = new Date(event.date);
      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const ogImageUrl = toAbsoluteUrl(
        `api/og?title=${encodeURIComponent(event.title)}&date=${encodeURIComponent(formattedDate)}`
      );
      const twitterImageUrl = toAbsoluteUrl(
        `api/twitter?title=${encodeURIComponent(event.title)}&date=${encodeURIComponent(formattedDate)}`
      );

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: `${siteUrl}?event=${eventId}`,
          siteName: "Chain of Events",
          images: [
            {
              url: ogImageUrl,
              width: 1200,
              height: 630,
              alt: event.title,
            },
          ],
          type: "article",
        },
        twitter: {
          card: "summary_large_image",
          title: twitterTitle,
          description,
          images: [
            {
              url: twitterImageUrl,
              width: 1200,
              height: 600,
              alt: event.title,
            },
          ],
        },
      };
    }
  }

  // Default metadata
  return {
    title: "Chain of Events | History of Cryptocurrency",
    description:
      "Explore the complete history of cryptocurrency - from Bitcoin genesis to major hacks, milestones, and cultural moments.",
  };
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent events={events} />
    </Suspense>
  );
}
