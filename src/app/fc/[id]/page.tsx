import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getEventById } from "@/lib/events-db";
import type { Event } from "@/lib/types";
import { formatDate } from "@/lib/formatters";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/`
    : "https://chainofevents.xyz/";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    return {
      title: "Event Not Found | Chain of Events",
    };
  }

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "https";
  const resolvedSiteUrl = host ? `${protocol}://${host}/` : siteUrl;
  const toAbsoluteUrl = (path: string) => new URL(path, resolvedSiteUrl).toString();
  const truncate = (value: string, maxLength: number) =>
    value.length > maxLength ? `${value.slice(0, maxLength - 3).trimEnd()}...` : value;

  const title = `${event.title} | Chain of Events`;
  const description = event.summary;
  const twitterTitle = truncate(title, 60);
  const twitterDescription = truncate(description, 197);

  // Format date for OG image
  const formattedDate = formatDate(event.date);

  // Determine mode for styling
  const eventMode = event.mode.includes("crimeline") ? "crimeline" : "timeline";

  // Use video poster as image source if available, fallback to event image
  const imageForOg = event.video?.poster_url || event.image;

  // Common image params
  const imageParams = new URLSearchParams({
    title: event.title,
    date: formattedDate,
    summary: event.summary,
    mode: eventMode,
  });
  if (imageForOg) {
    imageParams.set("image", imageForOg);
  }

  // Farcaster OG image (title at bottom)
  const fcOgImageUrl = toAbsoluteUrl(`api/fc-og?${imageParams.toString()}`);
  // Twitter image (title at top)
  const twitterImageUrl = toAbsoluteUrl(`api/twitter?${imageParams.toString()}`);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${resolvedSiteUrl}fc/${id}`,
      siteName: "Chain of Events",
      images: [
        {
          url: fcOgImageUrl,
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
      "fc:frame": "vNext",
      "og:image": fcOgImageUrl,
    },
  };
}

export default async function FarcasterEventPage({ params }: Props) {
  const { id } = await params;
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";

  // List of known bot/crawler user agents that need OG meta tags
  const botPatterns = [
    "Twitterbot",
    "facebookexternalhit",
    "LinkedInBot",
    "Slackbot",
    "Discordbot",
    "TelegramBot",
    "WhatsApp",
    "Googlebot",
    "bingbot",
    "Embedly",
    "Quora Link Preview",
    "Showyoubot",
    "outbrain",
    "pinterest",
    "vkShare",
    "W3C_Validator",
  ];

  const isBot = botPatterns.some((bot) =>
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );

  // For bots: render a minimal page so they can read the OG meta tags
  // The metadata is already set via generateMetadata()
  if (isBot) {
    const event = await getEventById(id);
    return (
      <html>
        <head />
        <body>
          <h1>{event?.title || "Event"}</h1>
          <p>{event?.summary || ""}</p>
          <a href={`/?event=${id}`}>View event</a>
        </body>
      </html>
    );
  }

  // For regular users: redirect to main event page with query param
  // This ensures users see the actual interactive page
  redirect(`/?event=${id}`);
}
