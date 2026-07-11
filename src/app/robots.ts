import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
  || "https://chainofevents.xyz";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // Keep social-card images and the RSS feed crawlable; block the rest of /api.
        allow: ["/", "/api/og", "/api/twitter", "/api/feed"],
        disallow: ["/admin/", "/api/", "/test-preview", "/farcaster-preview"],
      },
    ],
    sitemap: `${siteUrl.replace(/\/$/, "")}/sitemap.xml`,
  };
}
