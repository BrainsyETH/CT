import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "imgs.search.brave.com",
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
        hostname: "public.bnbstatic.com",
      },
    ],
  },
};

export default nextConfig;
