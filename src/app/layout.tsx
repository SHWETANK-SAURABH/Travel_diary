import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { siteConfig } from "@/config/site";
import { Header, Footer, MobileNav } from "@/components/layout";
import { Providers } from "./providers";
import "./globals.css";

const fontDisplay = Fraunces({
  variable: "--font-display-raw",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const fontSans = Inter({
  variable: "--font-sans-raw",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s — ${siteConfig.name}` },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <Providers>
          <Header />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <Footer />
          <MobileNav />
        </Providers>
      </body>
    </html>
  );
}
