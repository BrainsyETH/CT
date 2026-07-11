import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/`
    : "https://chainofevents.xyz/";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID; // e.g. "G-WY98R2W0KK"

// Self-hosted via next/font: no render-blocking Google Fonts request chain,
// and only the weights actually used instead of the full 100..900 axis.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Pinch-zoom intentionally left enabled (accessibility); accidental zoom is
  // prevented via `touch-action` in globals.css instead.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#14b8a6" },
    { media: "(prefers-color-scheme: dark)", color: "#dc2626" },
  ],
};

// Favicons are cached very aggressively on desktop browsers.
// A versioned URL forces a refresh without changing the underlying file.
const faviconHref = "/coe_minimalisticv2.png?v=2";

export const metadata: Metadata = {
  title: "Chain of Events | History of Cryptocurrency",
  description:
    "Explore the complete history of cryptocurrency - from Bitcoin genesis to major hacks, milestones, and cultural moments. Switch to Crimeline mode to explore hacks, exploits, and frauds.",
  icons: {
    // Manifest icons don't control browser tab favicons; declare it explicitly.
    icon: [{ url: faviconHref, type: "image/png" }],
    shortcut: [{ url: faviconHref, type: "image/png" }],
    apple: [{ url: faviconHref, type: "image/png" }],
  },
  keywords: [
    "cryptocurrency",
    "bitcoin",
    "ethereum",
    "blockchain",
    "crypto history",
    "crypto hacks",
    "defi",
    "chain of events",
    "Mt. Gox",
    "FTX",
    "crypto crimes",
  ],
  authors: [{ name: "Chain of Events" }],
  creator: "Chain of Events",
  publisher: "Chain of Events",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [{ url: "/api/feed", title: "Chain of Events RSS" }],
      "application/atom+xml": [
        { url: "/api/feed?format=atom", title: "Chain of Events Atom" },
      ],
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Chain of Events",
    title: "Chain of Events | History of Cryptocurrency",
    description:
      "Explore the complete history of cryptocurrency - from Bitcoin genesis to major hacks, milestones, and cultural moments.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Chain of Events - The History of Cryptocurrency",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chain of Events | History of Cryptocurrency",
    description:
      "Explore the complete history of cryptocurrency - from Bitcoin genesis to major hacks, milestones, and cultural moments.",
    images: ["/twitter-image"],
    site: "@chainofevents",
    creator: "@chainofevents",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="timeline"
      className={inter.variable}
      suppressHydrationWarning
    >
      <head>
        {/* Explicit favicon links to avoid browser heuristics picking /favicon.ico */}
        <link rel="icon" href="/coe_minimalisticv2.png?v=2" type="image/png" />
        <link rel="shortcut icon" href="/coe_minimalisticv2.png?v=2" type="image/png" />
      </head>

      <body className="antialiased">
        {children}

        {/* Google Analytics (GA4) - only render if env var exists */}
        {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
      </body>
    </html>
  );
}
