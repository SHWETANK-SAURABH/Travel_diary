# Release Checklist

Written at the end of Phase 13 ("Final Product QA, Visual Polish & Launch
Readiness"). This is the concrete, actionable checklist referenced by
`docs/report.md`'s Phase 13 entry — check every box against the real
production environment before flipping the switch. Cross-references
`docs/production.md` and `docs/security.md` rather than repeating their
detail.

## Environment

- [ ] `DATABASE_URL` set to the real production Postgres+PostGIS instance
      (not a local/staging one).
- [ ] `AUTH_SECRET` freshly generated (`npx auth secret`) — never the
      value committed in this repo's local-dev `.env`.
- [ ] `AUTH_URL` matches the real production domain exactly (scheme +
      host, no trailing slash).
- [ ] Google OAuth `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` configured,
      and the OAuth consent screen's authorized redirect URI updated to
      the production `AUTH_URL` — a mismatch here fails sign-in silently
      for every user until fixed.
- [ ] Email sign-in `EMAIL_SERVER_*`/`EMAIL_FROM` configured with a real
      SMTP sender (not a local dev/test one).
- [ ] `MEDIA_STORAGE_*` configured — without it, `getUploadUrl` throws
      loudly on any admin media upload (see `docs/production.md`).
- [ ] `MAP_PROVIDER_KEY` — **not required**; the map uses a free, keyless
      basemap provider. Leave blank unless intentionally switching
      providers (see `docs/production.md`'s correction on this point).
- [ ] `ANALYTICS_*` configured if a provider beyond the built-in DB
      adapter is wanted (optional — the app fully functions without it).

## Database

- [ ] All migrations applied via `npx prisma migrate deploy` (never
      `migrate dev` or `db push` in production — see `docs/production.md`).
- [ ] Every migration since the last deploy hand-reviewed for destructive
      operations (column drops, renames, new `NOT NULL` on a populated
      table) before applying.
- [ ] Backups: automated daily, 7+ day retention, confirmed actually
      enabled on the chosen provider's dashboard (not just "available on
      the plan").
- [ ] One test restore performed and verified before real user data
      exists in the database.
- [ ] Seed data (`prisma/seed.ts`) **not** run against production unless
      genuinely wanted — it creates demo content flagged `isSeed: true`,
      appropriate for a demo/staging environment, not a real launch.

## SEO

- [ ] `/sitemap.xml` resolves and lists the real production domain (not
      `localhost`) — driven by `siteConfig.url`/`metadataBase`, which
      needs the production `NEXT_PUBLIC_SITE_URL`-equivalent env value
      set correctly.
- [ ] `/robots.txt` disallows `/admin`, `/api`, `/trips`, `/profile` —
      verified already correct in this codebase; re-check after any
      routing change.
- [ ] Canonical URLs verified on `/festivals`, `/destinations`, and a
      sample of detail pages (`festivals/[slug]`, `destinations/[slug]`)
      — confirmed present and correct in this phase's audit.
- [ ] Structured data (`Festival`/`Destination` + `BreadcrumbList`
      JSON-LD) validates — spot-checked in this phase against a real
      rendered page; re-validate with Google's Rich Results Test against
      the live production URL once deployed.
- [ ] Open Graph / Twitter Card metadata renders correctly when a content
      URL is shared — confirmed present in this phase's audit.

## Security

- [ ] No secrets committed — confirmed clean in Phase 12's audit; the
      committed `.env` holds only local-dev docker-compose credentials.
- [ ] Security headers present (`X-Content-Type-Options`,
      `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) —
      verified in Phase 12, re-confirm against the deployed environment
      (some hosts/CDNs strip or override headers).
- [ ] **No Content-Security-Policy yet** — author and test one against the
      real production provider hosts before launch (see
      `docs/security.md`).
- [ ] **No rate limiting yet** — add it to sign-in, search, and admin
      mutation endpoints before public launch (see `docs/security.md`).
- [ ] `npm audit --omit=dev` re-run against the exact deployed commit —
      revisit the two currently-accepted vulnerabilities
      (`nodemailer`, `deepmerge-ts`) in case an upstream fix has shipped.
- [ ] Admin authorization spot-checked against the live environment: a
      signed-out request to `/admin` redirects to sign-in; a non-admin
      signed-in user is denied.
- [ ] Private trip sharing spot-checked: a `PRIVATE` trip's `/share` URL
      is inaccessible to an unauthenticated visitor; an `UNLISTED` one
      is accessible and shows only the itinerary, no owner PII.

## Monitoring

- [ ] `GET /api/health` reachable from outside the deployment and wired
      to an uptime monitor (UptimeRobot, Better Uptime, or the host's own
      health-check config).
- [ ] Alerting configured for `/api/health` failures — **does not exist
      yet**, nothing pages anyone today (see `docs/production.md`).
- [ ] A plan (even informal) for periodically checking `ErrorLog`/
      `PerformanceLog` via `/admin/analytics` until real alerting exists.

## Product

- [ ] Primary journey walked manually, in a real browser, against the
      **deployed** environment (not local): Homepage → Explore → Map →
      Festival/Destination → Save → Recommendation → Trip → Share.
- [ ] Search journey walked: Search → Result → Content.
- [ ] Admin journey walked: Admin sign-in → Edit content → Publish →
      confirm the public page updated.
- [ ] Guest → Account merge walked once against the deployed environment:
      save as guest, sign in, confirm the save carried over.
- [ ] Mobile QA: the primary journey above repeated on an actual phone
      (not just a resized desktop browser window) — at minimum Safari on
      iOS and Chrome on Android, the two browsers most of this app's
      likely traffic will use.
- [ ] Content quality: no demo/placeholder-named content is published
      (Phase 13 found and removed 5 leftover "Test..." admin-testing
      artifacts from Phase 10 — re-check before every future launch that
      admin testing against production doesn't leave more).
- [ ] Seed/demo photography (`picsum.photos` placeholder images,
      thematically random per content slug) swapped for real, curated
      photography before this is a real public-facing product — flagged
      as a known content-quality gap in Phase 13's report, not something
      code can fix.

---

See `docs/report.md`'s Phase 13 entry for what was actually tested,
found, and fixed to produce this checklist, and its final
READY-FOR-DEPLOYMENT / NOT-READY verdict.
