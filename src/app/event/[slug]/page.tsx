import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getEventBySlug } from "@/lib/events-db";
import { formatDate, generateEventSlug } from "@/lib/formatters";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/`
    : "https://chainofevents.xyz/";

type Props = {
  params: Promise<{ slug: string }>;
};

function toAbsoluteUrl(path: string): string {
  return new URL(path, siteUrl).toString();
}

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 3).trimEnd()}...` : value;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return { title: "Event Not Found | Chain of Events" };
  }

  const canonicalSlug = generateEventSlug(event.title, event.date);
  const title = `${event.title} | Chain of Events`;
  const description = event.summary;
  const twitterTitle = truncate(title, 60);
  const twitterDescription = truncate(description, 197);
  const formattedDate = formatDate(event.date);
  const eventMode = event.mode.includes("crimeline") ? "crimeline" : "timeline";
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
    alternates: {
      canonical: `/event/${canonicalSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}event/${canonicalSlug}`,
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

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return notFound();
  }

  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";

  // Known bot/crawler user agents that need OG meta tags
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

  // For bots: render minimal HTML so they can read OG meta tags
  if (isBot) {
    return (
      <div>
        <h1>{event.title}</h1>
        <p>{event.summary}</p>
        <a href={`/?event=${event.id}`}>View event</a>
      </div>
    );
  }

  // For regular users: redirect to homepage with event modal open
  redirect(`/?event=${event.id}`);
}
