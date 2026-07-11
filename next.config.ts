import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
    ];
    return [
      {
        // Everything except /embed is frame-denied.
        source: "/((?!embed).*)",
        headers: [{ key: "X-Frame-Options", value: "DENY" }, ...securityHeaders],
      },
      {
        // /embed/[id] widgets must be embeddable in third-party iframes.
        source: "/embed/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors *" },
          ...securityHeaders,
        ],
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },
      {
        protocol: "https",
        hostname: "99bitcoins.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // NOTE: imgs.search.brave.com removed — URLs expire within hours, causing broken images
      {
        protocol: "https",
        hostname: "img.paragraph.com",
      },
      {
        protocol: "https",
        hostname: "asset-metadata-service-production.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "placeholder.co",
      },
      {
        protocol: "https",
        hostname: "preview.redd.it",
      },
      {
        protocol: "https",
        hostname: "public.bnbstatic.com",
      },
    ],
  },
};

export default nextConfig;
