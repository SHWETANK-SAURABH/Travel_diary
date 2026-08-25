export const siteConfig = {
  name: "TravelDiary",
  tagline: "The living map of India",
  description:
    "Discover India's festivals, destinations, hidden gems, food and experiences — and plan a trip around them.",
  url: process.env.AUTH_URL ?? "http://localhost:3000",
  defaultLocale: "en-IN",
  ogImage: "/og-default.png",
} as const;
