import { NextRequest, NextResponse } from "next/server";
import { getEventBySlug } from "@/lib/events-db";
import { generateEventSlug, formatDate } from "@/lib/formatters";

/**
 * Zora Metadata Endpoint
 *
 * Returns EIP-7572 compliant metadata JSON for an event, used as the `uri`
 * when creating a Zora Content Coin. This avoids needing IPFS pinning —
 * the metadata is served directly from the site.
 *
 * GET /api/zora-metadata/[slug]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Missing slug parameter" },
        { status: 400 }
      );
    }

    const event = await getEventBySlug(slug);

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      "https://chainofevents.xyz";

    const eventSlug = generateEventSlug(event.title, event.date);
    const eventUrl = `${siteUrl}/event/${eventSlug}`;

    // Build OG image URL
    const ogParams = new URLSearchParams({
      title: event.title,
      date: formatDate(event.date),
    });
    if (event.summary) {
      ogParams.set("summary", event.summary);
    }
    if (event.image) {
      ogParams.set("image", event.image);
    }
    if (event.mode && event.mode.length > 0) {
      ogParams.set("mode", event.mode[0]);
    }
    const imageUrl = `${siteUrl}/api/og?${ogParams.toString()}`;

    // First sentence for description
    const sentences = event.summary.split(". ");
    let description = sentences[0]?.trim() || event.summary;
    if (!description.endsWith(".")) {
      description += ".";
    }

    // EIP-7572 compliant metadata
    const metadata = {
      name: event.title,
      description,
      image: imageUrl,
      external_url: eventUrl,
      content: {
        mime: "image/png",
        uri: imageUrl,
      },
      properties: {
        category: "historical-event",
        date: event.date,
        formatted_date: formatDate(event.date),
        ...(event.category && event.category.length > 0
          ? { event_categories: event.category }
          : {}),
        ...(event.tags && event.tags.length > 0
          ? { event_tags: event.tags }
          : {}),
        ...(event.mode && event.mode.length > 0
          ? { event_mode: event.mode }
          : {}),
      },
    };

    return NextResponse.json(metadata, {
      headers: {
        // Cache for 24 hours
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Error serving Zora metadata:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
