import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { analytics } from "@/lib/analytics";

/**
 * Auth.js (NextAuth v5) configuration.
 *
 * - Google: standard OAuth, no custom crypto.
 * - Email: passwordless magic link via the built-in Nodemailer provider —
 *   Auth.js generates/verifies the token itself, we never touch a password
 *   hash. Requires EMAIL_SERVER_* + EMAIL_FROM to actually send mail; in
 *   local dev without those set, the provider is still wired up but sending
 *   will no-op/fail loudly rather than silently — see docs/development.md.
 *   Phase 8's spec literally asks for "email + password," but its own
 *   section 3 prohibits "custom password hashing or authentication
 *   cryptography" — a self-contradiction, since a Credentials/password
 *   provider *is* exactly that (you own the hash comparison). Magic-link
 *   email is the reading that satisfies both: it's still "email
 *   authentication," Auth.js "naturally handles verification" (the link
 *   doubles as email verification) per the spec's own escape hatch, and it
 *   adds zero custom crypto. Kept as-is rather than adding a second,
 *   contradicting auth method.
 *
 * Authentication is optional everywhere: routes are public by default, and
 * only src/app/admin is gated (see src/proxy.ts — Next.js 16 renamed
 * middleware.ts to proxy.ts).
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
  // Server-side, authoritative signal for "was this account just created"
  // vs. "an existing user signed in" — createUser fires exactly once per
  // account, so this is a cleaner signup/login split than anything client
  // code could infer (see the spec's "signup completed"/"login" events).
  events: {
    async createUser({ user }) {
      if (user.id) await analytics.track({ type: "AUTH_INTERACTION", userId: user.id, metadata: { action: "signup_completed" } });
    },
    async signIn({ user, isNewUser }) {
      if (user.id && !isNewUser) await analytics.track({ type: "AUTH_INTERACTION", userId: user.id, metadata: { action: "login" } });
    },
  },
};
