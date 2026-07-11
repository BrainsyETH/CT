import { MetadataRoute } from "next";
import { getAllEvents } from "@/lib/events-db";
import { generateEventSlug } from "@/lib/formatters";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
  || "https://chainofevents.xyz";

// Regenerate hourly instead of querying the DB on every crawl
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Degrade to a homepage-only sitemap if the DB is unreachable (e.g. builds
  // without Supabase credentials) instead of failing the whole build.
  let events: Awaited<ReturnType<typeof getAllEvents>>["events"] = [];
  try {
    ({ events } = await getAllEvents({
      limit: 500,
      orderBy: "date",
      orderDirection: "desc",
    }));
  } catch (error) {
    console.error("sitemap: failed to load events, emitting homepage only", error);
  }

  const eventEntries: MetadataRoute.Sitemap = events.map((event) => {
    // Use the event's own date as a stable lastModified signal instead of
    // stamping every URL with crawl time (a noisy freshness signal).
    const eventDate = new Date(event.date);
    return {
      url: `${siteUrl}/event/${generateEventSlug(event.title, event.date)}`,
      lastModified: Number.isNaN(eventDate.getTime()) ? undefined : eventDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    };
  });

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...eventEntries,
  ];
}
