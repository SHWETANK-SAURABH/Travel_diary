import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Seed/demo images only — swap for the real media CDN host once
      // MEDIA_CDN_BASE_URL (see .env.example) is configured.
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
  // A Content-Security-Policy is deliberately not set here yet — this app
  // loads MapLibre GL's worker (self), external map tile/OAuth/analytics
  // hosts that vary per environment (MAP_PROVIDER_KEY, ANALYTICS_*, Google
  // OAuth — see .env.example), and Next's own inline hydration script.
  // Getting a CSP wrong fails closed (breaks the map or sign-in silently),
  // so it needs to be authored and tested against the real production
  // provider hosts, not guessed here — see docs/security.md.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // MIME-sniffing protection — never let a browser guess its way
          // into treating a user-uploaded/CDN-served file as HTML/JS.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // No embedding anywhere — this app has no legitimate iframe
          // embed use case, so deny outright rather than allow-listing.
          { key: "X-Frame-Options", value: "DENY" },
          // Send the referring URL to same-origin navigations only; strip
          // it (down to just the origin) on cross-origin ones — trip/share
          // URLs and search queries shouldn't leak into a third party's
          // referer logs via outbound links.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Opt out of browser features this app never uses — reduces the
          // attack surface for any third-party script that ever ends up
          // running here (analytics, map tiles).
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
