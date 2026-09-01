# Security

Phase 12's security posture: what was audited, what got fixed, what's
deliberately deferred (and why), and what a future contributor needs to
know before changing anything auth- or input-adjacent. See
[`architecture.md`](./architecture.md) for the underlying design this
audit checked, not re-explained here.

## Audit method

Three independent passes covered this phase: security, performance, and
accessibility/SEO, each producing a written findings list before any fix
was made — matching this phase's own instruction to "produce an internal
audit summary before making large changes." Every finding below was
re-verified against the actual code (not taken on faith) before being
counted as fixed; a few claimed findings turned out to already be handled
correctly and were dropped rather than "fixed" a second time (see
"False positives" below).

## Authentication & authorization

- **Sessions**: Auth.js v5, database strategy (`session: { strategy:
  "database" }` in `src/lib/auth/config.ts`) — a session is a real
  `Session` row keyed by an opaque token, not a signed JWT the server has
  to trust blindly. Revoking access means deleting the row.
- **Admin gate is defense-in-depth, not one check**: `src/proxy.ts`
  (route-level, redirects unauthenticated/non-admin traffic away from
  `/admin/*`) → `src/app/admin/layout.tsx` (render-level session check) →
  `requireAdmin(session)` as the literal first line of all 34 admin
  service functions (`src/features/*/admin-service.ts`). Any one of these
  being wrong or bypassed still leaves the other two standing — this
  was deliberate from Phase 10 onward, re-confirmed intact by this audit.
- **Server Actions re-derive identity themselves.** Every `"use server"`
  action calls `await auth()` and passes the result into a service
  function that independently asserts on it — never trusts a client-passed
  role/id. Per Next.js 16's own Server Actions guidance (consulted before
  writing any Phase 10 code, per this repo's `AGENTS.md`): "render-time
  gating is not a security boundary."
- **Guest data never touches the server until sign-in.** Guest saves/trips
  live in `localStorage` only; the merge into a real account
  (`src/lib/analytics/merge-identity.ts` + `POST /api/guest/merge`) is the
  only path guest data takes into the database, and it's keyed off the
  now-authenticated session, not anything the client claims about itself.

## Input validation

Every Server Action and every API route that accepts a request body or
non-trivial query params validates with Zod (`src/lib/validation/`) before
it reaches a service function or the database. Phase 12 closed the
remaining gaps:

- **15 Server Actions** took a bare scalar argument (`id: string`,
  `status: "DRAFT" | "PUBLISHED" | "ARCHIVED"`, `domain`, `archived:
  boolean`) with no runtime check — TypeScript's type only holds at compile
  time for the *caller's own code*; a Server Action is still a callable
  network endpoint, so a request that doesn't originate from the app's own
  compiled client bundle can send anything JSON-serializable. Fixed by
  adding `idSchema`, `contentStatusSchema`, `categoryDomainSchema`,
  `tagNameSchema` (`src/lib/validation/admin.ts`) and a `safeParse` guard
  at the top of each affected action, across
  `destinations|experiences|festivals|food|locations|media|tags|categories|analytics`'s
  `actions.ts` files.
- **2 API routes** (`/api/map/state/[slug]`, `/api/admin/search`) parsed
  query params by hand (`Number(...)` with an ad hoc `NaN` check; an
  unbounded string) instead of through a schema. Given a matching schema
  (`stateSummaryQuerySchema`, `adminSearchQuerySchema`) and the same
  `safeParse` → 400-on-failure pattern every other query-param route
  already used (e.g. `/api/map/viewport`).

## XSS

Two pages embed JSON-LD structured data via `dangerouslySetInnerHTML`
(`festivals/[slug]/page.tsx`, `destinations/[slug]/page.tsx`) — the one
place in the app that pattern appears. Both already escape `<` to
`<` after `JSON.stringify()` before embedding, which is what actually
matters: `JSON.stringify` alone does *not* escape a `</script>`-breakout
sequence, so without this a festival/destination name or description
containing literal `</script>` text could terminate the script block early
and inject arbitrary markup. Verified present on both, not just one — this
was a security-audit finding that turned out to already be fixed.

## Dependency audit

`npm audit --omit=dev` as of this phase: **2 known, accepted, high-severity
advisories**, both several layers deep in dependencies this app doesn't
control:

| Package | Advisory | Why it's accepted, not fixed |
|---|---|---|
| `nodemailer` (via `@auth/core` → `next-auth`) | [GHSA-p6gq-j5cr-w38f](https://github.com/advisories/GHSA-p6gq-j5cr-w38f) — a message-level `raw` option can bypass file/URL access restrictions | **No fix available upstream.** This app never sets that `raw` option (email sign-in goes through Auth.js's own template, not raw MIME) — the vulnerable code path is unreachable here, but the advisory can't be silenced until `next-auth`/`nodemailer` ship a fix. |
| `deepmerge-ts` (via `@prisma/config` → `prisma`) | [GHSA-ggr8-5vv4-36mx](https://github.com/advisories/GHSA-ggr8-5vv4-36mx) — stack exhaustion merging deeply recursive object graphs | Fix requires downgrading `prisma` 6.19.3 → 6.12.0 (`npm audit fix --force`'s own suggestion) — a real downgrade across many patch versions, not a safe patch bump, and this app never merges attacker-controlled deeply-recursive config objects (the vulnerable path is Prisma's own config loading, not app code). Rejected as a worse trade than the advisory itself. |

Re-run `npm audit --omit=dev` before every deploy and revisit this table —
an upstream fix for either would make it worth taking.

## Security headers

`next.config.ts` sets four headers on every response: `X-Content-Type-
Options: nosniff` (blocks MIME-sniffing), `X-Frame-Options: DENY` (no
legitimate iframe-embed use case exists, so deny outright), `Referrer-
Policy: strict-origin-when-cross-origin` (trip/share URLs and search
queries shouldn't leak into a third party's referer logs), `Permissions-
Policy` opting out of camera/microphone/geolocation/FLoC.

**No Content-Security-Policy yet — deliberately.** This app loads MapLibre
GL's own worker, external map-tile/OAuth/analytics hosts that vary by
environment (`MAP_PROVIDER_KEY`, `ANALYTICS_*`, Google OAuth — see
`.env.example`), and Next's inline hydration script. A CSP fails *closed*:
get one directive wrong and the map or sign-in breaks silently in
production, not loudly in dev. Authoring one needs the real provider hosts
for whichever environment ships first, plus a manual pass clicking through
every page with the browser console open — not something to guess at
during a hardening pass. Tracked here as the one deferred item in this
section.

## Rate limiting

**None exists yet, anywhere** — not on sign-in, not on search, not on any
mutation endpoint. Acceptable for this phase because there's no deployed,
publicly-reachable instance yet to abuse; **this is the first thing to add
before a real production launch**, specifically on: email sign-in (a magic
-link spam vector), `/api/search/suggest` and `/api/map/search` (unbounded
DB query cost per keystroke), and the admin CMS mutation actions (already
behind auth, but auth alone doesn't stop a compromised admin session from
being hammered). See `docs/production.md`'s pre-launch checklist.

## Draft content never leaks publicly

Every public-facing query (`src/features/*/service.ts`, as opposed to the
`admin-service.ts` siblings that intentionally include drafts) filters on
`status: "PUBLISHED"` explicitly — there's no shared "all content"
function that a public page could accidentally call. Re-verified during
this audit by grep across every public `service.ts`: no query without an
explicit status filter reaches a public route.

## Error handling never leaks internals

`friendlyDbError()` (`src/features/admin/service.ts`) translates Prisma's
`P2003` FK-violation code into an actionable message and collapses every
other database error into a generic one — never a raw stack trace or SQL
fragment. This phase found **12 admin mutation functions** that skipped
this wrapper entirely (bare `await db.x.update(...)` with nothing catching
a thrown Prisma error), which would have let an unhandled Prisma error
propagate up to the Server Action's own generic catch-all instead — not a
leak of internals, but an inconsistency worth closing so every admin
mutation fails the same, predictable way. Fixed across
`destinations|experiences|festivals|food|media|taxonomy`'s
`admin-service.ts` files.

## False positives (audit claimed, verification found otherwise)

- **JSON-LD XSS escaping** (above) — already present on both pages.
- **`/trips/[id]/share` returning HTTP 200 for a nonexistent trip** —
  not a caching bug; see `docs/testing.md`'s note on Next 16's `notFound()`
  streaming behavior. Verified via `node_modules/next/dist/docs`, not
  assumed.

## Known, accepted limitations (not security bugs, noted for completeness)

- **Map markers have no keyboard-accessible click target** — a
  WebGL-canvas architectural limitation of MapLibre GL, not something a
  targeted fix resolves. Mitigated: `/festivals`, `/destinations`, and
  search already provide full non-map access to every piece of content the
  map surfaces, so nothing is map-exclusive.
- **`Dropdown` (`src/components/ui/Dropdown.tsx`) has Escape-to-close but
  no full roving-tabindex focus trap.** It's reused across the header
  Explore menu, the account menu, and every admin table row's actions
  menu — widely enough that adding full keyboard containment this late
  carries real regression risk for a benefit (list-menu keyboard nav is
  already functional, just not textbook-complete) judged not worth it in
  this pass.
