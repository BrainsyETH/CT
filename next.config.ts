import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
      // Stable CDN domains used by major crypto news sites
      {
        protocol: "https",
        hostname: "images.ctfassets.net",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "static.coindesk.com",
      },
      {
        protocol: "https",
        hostname: "www.tbstat.com",
      },
      {
        protocol: "https",
        hostname: "cdn.decrypt.co",
      },
      {
        protocol: "https",
        hostname: "s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "blockworks-res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "www.coindesk.com",
      },
      {
        protocol: "https",
        hostname: "img.decrypt.co",
      },
    ],
  },
};

export default nextConfig;
