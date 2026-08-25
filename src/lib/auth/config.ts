import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

/**
 * Auth.js (NextAuth v5) configuration.
 *
 * - Google: standard OAuth, no custom crypto.
 * - Email: passwordless magic link via the built-in Nodemailer provider —
 *   Auth.js generates/verifies the token itself, we never touch a password
 *   hash. Requires EMAIL_SERVER_* + EMAIL_FROM to actually send mail; in
 *   local dev without those set, the provider is still wired up but sending
 *   will no-op/fail loudly rather than silently — see docs/development.md.
 *
 * Authentication is optional everywhere: routes are public by default, and
 * only src/app/admin is gated (see middleware.ts).
 */
export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(db),
  session: { strategy: "database" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Nodemailer({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  pages: {
    signIn: "/auth/sign-in",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = (user as { role?: "USER" | "ADMIN" }).role ?? "USER";
      }
      return session;
    },
  },
};
