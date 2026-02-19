import { MetadataRoute } from "next";
import { getAllEvents } from "@/lib/events-db";
import { generateEventSlug } from "@/lib/formatters";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
  || "https://chainofevents.xyz";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { events } = await getAllEvents({
    limit: 500,
    orderBy: "date",
    orderDirection: "desc",
  });

  const eventEntries: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${siteUrl}/event/${generateEventSlug(event.title, event.date)}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

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
