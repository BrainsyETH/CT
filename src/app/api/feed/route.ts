import { NextRequest, NextResponse } from "next/server";
import { getAllEvents, getEventsOnThisDay } from "@/lib/events-db";
import { rateLimit } from "@/lib/rate-limit";
import type { Event } from "@/lib/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://chainofevents.xyz";
const SITE_TITLE = "Chain of Events";
const SITE_DESCRIPTION = "The complete history of cryptocurrency and blockchain, documented.";

/**
 * Generate RSS/Atom feed for events
 *
 * Query parameters:
 *   - format: "rss" | "atom" (default: "rss")
 *   - type: "latest" | "on-this-day" (default: "latest")
 *   - mode: "timeline" | "crimeline" (optional)
 *   - limit: number (default: 20, max: 50)
 */
export async function GET(request: NextRequest) {
  // Rate limiting
  const limited = rateLimit(request, {
    keyPrefix: "api:feed",
    limit: 60,
    windowMs: 60_000,
  });

  if (!limited.ok) {
    return new NextResponse("Rate limit exceeded", {
      status: 429,
      headers: {
        "Retry-After": String(limited.retryAfterSeconds),
        "Content-Type": "text/plain",
      },
    });
  }

  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get("format") || "rss";
  const type = searchParams.get("type") || "latest";
  const mode = searchParams.get("mode");
  const limitParam = searchParams.get("limit");
  const limit = Math.min(parseInt(limitParam || "20", 10), 50);

  try {
    let events: Event[];
    let feedTitle = SITE_TITLE;
    let feedDescription = SITE_DESCRIPTION;

    if (type === "on-this-day") {
      events = await getEventsOnThisDay(new Date(), {
        limit,
        mode: mode ? [mode] : undefined,
      });
      const today = new Date();
      const monthDay = today.toLocaleDateString("en-US", { month: "long", day: "numeric" });
      feedTitle = `${SITE_TITLE} - On This Day (${monthDay})`;
      feedDescription = `Historical crypto events that happened on ${monthDay}`;
    } else {
      const result = await getAllEvents({
        limit,
        mode: mode ? [mode] : undefined,
        orderBy: "date",
        orderDirection: "desc",
      });
      events = result.events;

      if (mode === "crimeline") {
        feedTitle = `${SITE_TITLE} - Crimeline`;
        feedDescription = "Security incidents, hacks, and exploits in cryptocurrency history";
      }
    }

    const feedContent =
      format === "atom"
        ? generateAtomFeed(events, feedTitle, feedDescription)
        : generateRssFeed(events, feedTitle, feedDescription);

    const contentType = format === "atom" ? "application/atom+xml" : "application/rss+xml";

    return new NextResponse(feedContent, {
      headers: {
        "Content-Type": `${contentType}; charset=utf-8`,
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error generating feed:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateRssFeed(events: Event[], title: string, description: string): string {
  const lastBuildDate = new Date().toUTCString();

  const items = events
    .map((event) => {
      const pubDate = new Date(event.date).toUTCString();
      const link = `${SITE_URL}/?event=${encodeURIComponent(event.id)}`;
      const categories = event.category?.map((c) => `<category>${escapeXml(c)}</category>`).join("") || "";

      return `
    <item>
      <title>${escapeXml(event.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${event.summary}]]></description>
      ${categories}
      ${event.image ? `<enclosure url="${escapeXml(event.image)}" type="image/jpeg" />` : ""}
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(description)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/api/feed" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;
}

function generateAtomFeed(events: Event[], title: string, description: string): string {
  const updated = new Date().toISOString();

  const entries = events
    .map((event) => {
      const eventDate = new Date(event.date).toISOString();
      const link = `${SITE_URL}/?event=${encodeURIComponent(event.id)}`;
      const categories = event.category
        ?.map((c) => `<category term="${escapeXml(c)}" />`)
        .join("")
        || "";

      return `
  <entry>
    <title>${escapeXml(event.title)}</title>
    <link href="${link}" />
    <id>${link}</id>
    <updated>${eventDate}</updated>
    <published>${eventDate}</published>
    <summary type="html"><![CDATA[${event.summary}]]></summary>
    ${categories}
  </entry>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(title)}</title>
  <link href="${SITE_URL}" />
  <link href="${SITE_URL}/api/feed?format=atom" rel="self" />
  <id>${SITE_URL}/</id>
  <updated>${updated}</updated>
  <subtitle>${escapeXml(description)}</subtitle>
  ${entries}
</feed>`;
}
