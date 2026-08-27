import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Seed/demo images only — swap for the real media CDN host once
      // MEDIA_CDN_BASE_URL (see .env.example) is configured.
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

export default nextConfig;
