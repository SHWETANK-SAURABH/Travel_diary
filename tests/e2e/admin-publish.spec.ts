import { test, expect } from "@playwright/test";
import { ensureUser, signInAs, closeSessionDb, db } from "./helpers/session";

/**
 * Spec §64's third named journey: Admin → Edit content → Publish → Public
 * page updated. The fixture festival is written directly via Prisma (not
 * through the admin create form) so this test exercises the thing it's
 * actually meant to check — the publish action and its effect on the public
 * page — without coupling to the create form's RelationPicker autocomplete,
 * which belongs to its own, separate CMS-form test.
 */
const ADMIN_EMAIL = "e2e-admin@example.com";
const FIXTURE_SLUG = "e2e-admin-publish-fixture";

test.describe.configure({ mode: "serial" });

let festivalId: string;

test.beforeAll(async () => {
  await ensureUser(ADMIN_EMAIL, "ADMIN");

  const category = await db.festivalCategory.findFirstOrThrow({ select: { id: true } });
  const location = await db.location.findFirstOrThrow({ select: { id: true } });

  const festival = await db.festival.upsert({
    where: { slug: FIXTURE_SLUG },
    create: {
      slug: FIXTURE_SLUG,
      name: "E2E Admin Publish Fixture",
      description: "Created by tests/e2e/admin-publish.spec.ts — safe to delete.",
      status: "DRAFT",
      categoryId: category.id,
      locationId: location.id,
    },
    update: { status: "DRAFT" },
    select: { id: true },
  });
  festivalId = festival.id;
});

test.afterAll(async () => {
  await db.festival.delete({ where: { id: festivalId } }).catch(() => {});
  await closeSessionDb();
});

test("a draft festival is not visible on its public page", async ({ page }) => {
  const res = await page.goto(`/festivals/${FIXTURE_SLUG}`);
  // Next 16 streams a static shell before notFound() can flip the status
  // (see node_modules/next/dist/docs — same behavior confirmed on the trip
  // share page), so the reliable signal here is the auto-injected noindex
  // meta tag, not the raw HTTP status.
  const robots = await page.locator('meta[name="robots"]').first().getAttribute("content");
  expect(robots).toContain("noindex");
  void res;
});

test("admin can publish the festival from the CMS list, and the public page updates", async ({ page, context }) => {
  await signInAs(context, ADMIN_EMAIL);

  await page.goto("/admin/festivals");
  await page.waitForLoadState("networkidle");
  const row = page.getByRole("row", { name: /E2E Admin Publish Fixture/ });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Publish" }).click();
  await expect(row.getByRole("button", { name: "Unpublish" })).toBeVisible();

  await page.goto(`/festivals/${FIXTURE_SLUG}`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("E2E Admin Publish Fixture");
});
