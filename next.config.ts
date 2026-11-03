import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deployed as static files to GitHub Pages (.github/workflows/deploy.yml).
  output: "export",
  // Pages serves /about/index.html at /about/ without extra config.
  trailingSlash: true,
  // There's no server to resize images; the art in /public is already sized for the web.
  images: { unoptimized: true },
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
