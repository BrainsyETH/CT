import { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getEventBySlug, getEventById } from "@/lib/events-db";
import { formatDate, formatFundsLost, generateEventSlug } from "@/lib/formatters";
import type { Event } from "@/lib/types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/`
    : "https://chainofevents.xyz/";

// ISR: event content only changes via daily crons, so an hourly revalidate is
// plenty. This lets the CDN serve the page statically instead of re-rendering
// per request.
export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
};

function toAbsoluteUrl(path: string): string {
  return new URL(path, siteUrl).toString();
}

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 3).trimEnd()}...` : value;
}

function buildOgParams(event: Event): URLSearchParams {
  const eventMode = event.mode.includes("crimeline") ? "crimeline" : "timeline";
  const imageForOg = event.video?.poster_url || event.image;
  const imageParams = new URLSearchParams({
    title: event.title,
    date: formatDate(event.date),
    summary: event.summary,
    mode: eventMode,
  });
  if (imageForOg) {
    imageParams.set("image", imageForOg);
  }
  return imageParams;
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
  const imageParams = buildOgParams(event);

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
      publishedTime: event.date,
    },
    twitter: {
      card: "summary_large_image",
      title: twitterTitle,
      description: twitterDescription,
      site: "@chainofevents",
      creator: "@chainofevents",
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

  // Consolidate alternate slugs onto the canonical URL.
  const canonicalSlug = generateEventSlug(event.title, event.date);
  if (slug !== canonicalSlug) {
    permanentRedirect(`/event/${canonicalSlug}`);
  }

  const isCrimeline = event.mode.includes("crimeline");
  const canonicalUrl = toAbsoluteUrl(`event/${canonicalSlug}`);
  const ogImageUrl = toAbsoluteUrl(`api/og?${buildOgParams(event).toString()}`);

  // Resolve related events server-side so they render as real crawlable links.
  const relatedEvents = (
    await Promise.all(
      (event.related_events ?? []).map(async (rel) => {
        const related = await getEventById(rel.event_id);
        return related ? { ...rel, event: related } : null;
      })
    )
  ).filter((rel): rel is NonNullable<typeof rel> => rel !== null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: event.title,
    description: event.summary,
    datePublished: event.date,
    image: [ogImageUrl],
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
    author: {
      "@type": "Organization",
      name: "Chain of Events",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Chain of Events",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: toAbsoluteUrl("icon-512.png"),
      },
    },
  };

  const accentText = isCrimeline ? "text-purple-400" : "text-teal-600";
  const badgeStyle = isCrimeline
    ? "bg-purple-950 text-purple-200 border-purple-700"
    : "bg-teal-50 text-teal-800 border-teal-200";

  return (
    <div
      className={`min-h-screen ${
        isCrimeline ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm">
          <Link href="/" className={`font-semibold hover:underline ${accentText}`}>
            Chain of Events
          </Link>
          <span className={isCrimeline ? "text-gray-500" : "text-gray-400"}> / </span>
          <span className={isCrimeline ? "text-gray-400" : "text-gray-500"}>
            {formatDate(event.date)}
          </span>
        </nav>

        <article>
          <p
            className={`text-sm font-semibold uppercase tracking-wide ${accentText}`}
          >
            <time dateTime={event.date}>{formatDate(event.date)}</time>
          </p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
            {event.title}
          </h1>

          {(event.category?.length ?? 0) > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Categories">
              {event.category.map((cat) => (
                <li
                  key={cat}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeStyle}`}
                >
                  {cat}
                </li>
              ))}
            </ul>
          )}

          {event.image && (
            // Plain <img>: event images come from many hosts; next/image throws
            // on hosts missing from remotePatterns, which would 500 the page.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.image}
              alt={event.title}
              className="mt-6 w-full rounded-xl border border-gray-300 object-cover"
            />
          )}

          <p className="mt-6 text-lg leading-relaxed">{event.summary}</p>

          {event.crimeline && (
            <section
              className={`mt-6 rounded-xl border p-4 ${
                isCrimeline
                  ? "border-purple-800 bg-purple-950/40"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <h2 className="text-sm font-bold uppercase tracking-wide">
                Incident Details
              </h2>
              <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className={isCrimeline ? "text-gray-400" : "text-gray-500"}>Type</dt>
                  <dd className="font-semibold">{event.crimeline.type}</dd>
                </div>
                {event.crimeline.funds_lost_usd !== undefined && (
                  <div>
                    <dt className={isCrimeline ? "text-gray-400" : "text-gray-500"}>
                      Funds Lost
                    </dt>
                    <dd className="font-semibold">
                      {formatFundsLost(event.crimeline.funds_lost_usd)}
                    </dd>
                  </div>
                )}
                {event.crimeline.status && (
                  <div>
                    <dt className={isCrimeline ? "text-gray-400" : "text-gray-500"}>
                      Status
                    </dt>
                    <dd className="font-semibold">{event.crimeline.status}</dd>
                  </div>
                )}
              </dl>
              {event.crimeline.aftermath && (
                <p className="mt-3 text-sm leading-relaxed">
                  {event.crimeline.aftermath}
                </p>
              )}
            </section>
          )}

          <div className="mt-8">
            <Link
              href={`/?event=${encodeURIComponent(event.id)}`}
              className={`inline-block rounded-lg border-2 px-5 py-3 font-bold transition-transform hover:-translate-y-0.5 ${
                isCrimeline
                  ? "border-purple-500 bg-purple-700 text-white"
                  : "border-teal-600 bg-teal-500 text-white"
              }`}
            >
              View on the interactive timeline &rarr;
            </Link>
          </div>

          {(event.links?.length ?? 0) > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-bold">Sources & further reading</h2>
              <ul className="mt-3 list-inside list-disc space-y-2 text-sm">
                {event.links!.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`hover:underline ${accentText}`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {relatedEvents.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-bold">Related events</h2>
              <ul className="mt-3 space-y-3">
                {relatedEvents.map((rel) => (
                  <li key={rel.event.id}>
                    <Link
                      href={`/event/${generateEventSlug(rel.event.title, rel.event.date)}`}
                      className={`block rounded-lg border p-4 transition-colors ${
                        isCrimeline
                          ? "border-gray-800 bg-gray-900 hover:border-purple-600"
                          : "border-gray-200 bg-white hover:border-teal-400"
                      }`}
                    >
                      <span className={`text-xs font-semibold uppercase ${accentText}`}>
                        {formatDate(rel.event.date)}
                        {rel.label ? ` · ${rel.label}` : ""}
                      </span>
                      <span className="mt-1 block font-semibold">{rel.event.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>

        <footer className="mt-12 border-t border-gray-300/50 pt-6 text-sm">
          <Link href="/" className={`font-semibold hover:underline ${accentText}`}>
            &larr; Explore the full history of crypto on Chain of Events
          </Link>
        </footer>
      </main>
    </div>
  );
}
