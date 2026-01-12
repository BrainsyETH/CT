import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://chainofevents.xyz/";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID; // e.g. "G-WY98R2W0KK"

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#14b8a6" },
    { media: "(prefers-color-scheme: dark)", color: "#dc2626" },
  ],
};

export const metadata: Metadata = {
  title: "Chain of Events | History of Cryptocurrency",
  description:
    "Explore the complete history of cryptocurrency - from Bitcoin genesis to major hacks, milestones, and cultural moments. Switch to Crimeline mode to explore hacks, exploits, and frauds.",
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
  alternates: { canonical: "/" },
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
        url: new URL("/opengraph-image", siteUrl).toString(),
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
    images: [new URL("/twitter-image", siteUrl).toString()],
    creator: "@chainofevents",
  },
  other: {
    "twitter:image": new URL("/twitter-image", siteUrl).toString(),
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="timeline" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>

      <body className="antialiased">
        {children}

        {/* Google Analytics (GA4) - only render if env var exists */}
        {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
      </body>
    </html>
  );
}
