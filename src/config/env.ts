import { z } from "zod";

/**
 * Validates process.env once at startup so a missing/misconfigured variable
 * fails fast and loudly instead of surfacing as a confusing runtime error
 * three layers deep. Only variables the app actually reads are listed here —
 * keep this in sync with .env.example.
 */
const envSchema = z.object({
  DATABASE_URL: z.url(),

  AUTH_SECRET: z.string().min(1),
  AUTH_URL: z.url().optional(),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  EMAIL_SERVER_HOST: z.string().optional(),
  EMAIL_SERVER_PORT: z.string().optional(),
  EMAIL_SERVER_USER: z.string().optional(),
  EMAIL_SERVER_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  MEDIA_STORAGE_ENDPOINT: z.string().optional(),
  MEDIA_STORAGE_REGION: z.string().optional(),
  MEDIA_STORAGE_BUCKET: z.string().optional(),
  MEDIA_STORAGE_ACCESS_KEY_ID: z.string().optional(),
  MEDIA_STORAGE_SECRET_ACCESS_KEY: z.string().optional(),
  MEDIA_CDN_BASE_URL: z.string().optional(),

  MAP_PROVIDER_KEY: z.string().optional(),

  ANALYTICS_PROVIDER: z.enum(["console", "posthog", "plausible"]).default("console"),
  ANALYTICS_KEY: z.string().optional(),

  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment configuration:", z.treeifyError(parsed.error));
    throw new Error("Invalid environment configuration — see .env.example");
  }
  return parsed.data;
}

export const env = loadEnv();
