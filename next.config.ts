import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deployed on Vercel. URLs keep the trailing slash they had as a static export (/section/).
  trailingSlash: true,
  images: {
    // The art in /public is already sized for the web, and album art is shown small.
    unoptimized: true,
    // Album art and artist photos from Spotify, Deezer and Apple.
    remotePatterns: [
      { protocol: "https", hostname: "i.scdn.co" },
      { protocol: "https", hostname: "*.dzcdn.net" },
      { protocol: "https", hostname: "*.mzstatic.com" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
