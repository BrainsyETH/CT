import { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import { HomeContent } from "@/components/HomeContent";
import eventsData from "@/data/events.json";
import type { Event } from "@/lib/types";
import { formatDate } from "@/lib/formatters";

const events = eventsData as Event[];

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/`
    : "https://chainofevents.xyz/";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ event?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const eventId = params.event;
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "https";
  const resolvedSiteUrl = host ? `${protocol}://${host}/` : siteUrl;
  const toAbsoluteUrl = (path: string) => new URL(path, resolvedSiteUrl).toString();
  const truncate = (value: string, maxLength: number) =>
    value.length > maxLength ? `${value.slice(0, maxLength - 3).trimEnd()}...` : value;

  if (eventId) {
    const event = events.find((e) => e.id === eventId);
    if (event) {
      const title = `${event.title} | Chain of Events`;
      const description = event.summary;
      const twitterTitle = truncate(title, 60);
      const twitterDescription = truncate(description, 200);

      // Format date for OG image
      const formattedDate = formatDate(event.date);

      // Determine mode for styling
      const eventMode = event.mode.includes("crimeline") ? "crimeline" : "timeline";

      // Build image URL with all parameters
      // Use video poster as image source if available, fallback to event image
      const imageForOg = event.video?.poster_url || event.image;

      const imageParams = new URLSearchParams({
        title: event.title,
        date: formattedDate,
        summary: event.summary,
        mode: eventMode,
      });
      if (imageForOg) {
        imageParams.set("image", imageForOg);
      }
      // Add hasVideo flag so OG image can show play icon
      if (event.video) {
        imageParams.set("hasVideo", "true");
      }

      const ogImageUrl = toAbsoluteUrl(`api/og?${imageParams.toString()}`);
      const twitterImageUrl = toAbsoluteUrl(`api/twitter?${imageParams.toString()}`);

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: `${resolvedSiteUrl}?event=${eventId}`,
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
          description: twitterDescription,
          images: [twitterImageUrl],
        },
        other: {
          "twitter:image": twitterImageUrl,
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
