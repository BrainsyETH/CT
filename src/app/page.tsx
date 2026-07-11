import { Metadata } from "next";
import { headers } from "next/headers";
import { unstable_cache } from "next/cache";
import { Suspense } from "react";
import { HomeContent } from "@/components/HomeContent";
import { SkeletonTimeline } from "@/components/SkeletonTimeline";
import { getAllEvents, getEventById } from "@/lib/events-db";
import { formatDate, generateEventSlug } from "@/lib/formatters";

// The homepage dataset only changes via daily crons, so cache the Supabase
// query instead of hitting the DB on every request (page itself stays dynamic
// because generateMetadata reads searchParams for ?event= deep links).
const getHomepageEvents = unstable_cache(
  () =>
    getAllEvents({
      // Homepage timeline should include the full dataset (year list derives from this).
      // `getAllEvents` enforces a MAX_LIMIT of 500.
      limit: 500,
      orderBy: "date",
      orderDirection: "desc",
    }),
  ["home-events"],
  { revalidate: 300 }
);

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/`
    : "https://chainofevents.xyz/";

// Dynamic rendering required: generateMetadata reads searchParams and headers
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
    const event = await getEventById(eventId);
    if (event) {
      const title = `${event.title} | Chain of Events`;
      const description = event.summary;
      const twitterTitle = truncate(title, 60);
      const twitterDescription = truncate(description, 197);

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

      const ogImageUrl = toAbsoluteUrl(`api/og?${imageParams.toString()}`);
      const twitterImageUrl = toAbsoluteUrl(`api/twitter?${imageParams.toString()}`);

      return {
        title,
        description,
        // Modal deep-links (/?event=id) are duplicates of the real event page;
        // consolidate ranking signals onto the canonical slug URL.
        alternates: {
          canonical: `/event/${generateEventSlug(event.title, event.date)}`,
        },
        openGraph: {
          title,
          description,
          url: `${resolvedSiteUrl}event/${generateEventSlug(event.title, event.date)}`,
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
          images: [
            {
              url: twitterImageUrl,
              width: 1200,
              height: 630,
              alt: event.title,
            },
          ],
        },
        other: {
          "twitter:image": twitterImageUrl,
          "twitter:image:width": "1200",
          "twitter:image:height": "630",
          "twitter:image:alt": event.title,
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

export default async function Home() {
  const { events } = await getHomepageEvents();

  return (
    <Suspense fallback={<SkeletonTimeline />}>
      <HomeContent events={events} />
    </Suspense>
  );
}
