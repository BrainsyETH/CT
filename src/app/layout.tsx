import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://crypto-timeline.vercel.app";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#14b8a6" },
    { media: "(prefers-color-scheme: dark)", color: "#dc2626" },
  ],
};

export const metadata: Metadata = {
  title: "Crypto Timeline | History of Cryptocurrency",
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
    "crypto timeline",
    "Mt. Gox",
    "FTX",
    "crypto crimes",
  ],
  authors: [{ name: "Crypto Timeline" }],
  creator: "Crypto Timeline",
  publisher: "Crypto Timeline",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Crypto Timeline",
    title: "Crypto Timeline | History of Cryptocurrency",
    description:
      "Explore the complete history of cryptocurrency - from Bitcoin genesis to major hacks, milestones, and cultural moments.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Crypto Timeline - The History of Cryptocurrency",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Crypto Timeline | History of Cryptocurrency",
    description:
      "Explore the complete history of cryptocurrency - from Bitcoin genesis to major hacks, milestones, and cultural moments.",
    images: ["/og-image.png"],
    creator: "@cryptotimeline",
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="timeline" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
