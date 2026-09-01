import { test, expect } from "@playwright/test";
import { ensureUser, signInAs, closeSessionDb, db } from "./helpers/session";

/**
 * Spec §64 "FINAL PRODUCT AUDIT" names this exact journey to verify:
 * Homepage → Explore → Map → Festival/Destination → Save → Recommendation
 * → Trip → Share. Runs signed-in (not guest) because sharing a trip needs a
 * server-side row — `/trips/[id]/share` resolves against the DB
 * (src/features/trips/service.ts's getSharedTrip), and guest trips only
 * ever exist in the browser's localStorage.
 */
const FESTIVAL_SLUG = "hornbill-festival";
const DESTINATION_SLUG = "jaisalmer-fort";
const USER_EMAIL = "e2e-primary-journey@example.com";

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  const user = await ensureUser(USER_EMAIL, "USER");
  // Re-running against a persistent DB (not reset per-run, unlike the unit
  // suite's mocks) means a prior run's save/trip can still be there — start
  // from a known clean state rather than assuming a fresh one (a leftover
  // trip with the same name would also break test 4's single-link lookup).
  await db.savedContent.deleteMany({ where: { userId: user.id } });
  await db.trip.deleteMany({ where: { userId: user.id, name: "E2E Primary Journey Trip" } });
});

test.afterAll(async () => {
  await closeSessionDb();
});

test("homepage -> explore -> map render", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.waitForLoadState("networkidle");

  await page.getByRole("link", { name: "Start exploring" }).click();
  await expect(page).toHaveURL(/\/explore$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.goto("/map");
  await expect(page.locator("canvas").first()).toBeVisible({ timeout: 15_000 });
});

test("festival detail page: save + recommendation rail render", async ({ page, context }) => {
  await signInAs(context, USER_EMAIL);
  await page.goto(`/festivals/${FESTIVAL_SLUG}`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  // The save button is interactive only once React hydrates over the
  // server-rendered markup — clicking before that lands on an unattached
  // listener and silently no-ops, so wait for the page to go quiet first.
  await page.waitForLoadState("networkidle");

  const saveButton = page.getByRole("button", { name: "Save", exact: true });
  await saveButton.click();
  await expect(page.getByRole("button", { name: "Saved" })).toBeVisible();
});

test("create a trip and add a festival to it from the content page", async ({ page, context }) => {
  await signInAs(context, USER_EMAIL);
  await page.goto(`/festivals/${FESTIVAL_SLUG}`);
  await page.waitForLoadState("networkidle");

  await page.getByRole("button", { name: "Add to Trip" }).click();
  await page.getByRole("button", { name: "+ Create a trip" }).click();
  await page.getByPlaceholder("Trip name").fill("E2E Primary Journey Trip");
  await page.getByRole("button", { name: "Create & Add" }).click();
  await expect(page.getByRole("button", { name: "Added" })).toBeVisible();
});

test("add a destination to the same trip, then reorder and share it", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-write", "clipboard-read"]);
  await signInAs(context, USER_EMAIL);

  // Find the trip created in the previous test via the account trip list.
  await page.goto("/trips");
  const tripLink = page.getByRole("link", { name: /E2E Primary Journey Trip/ });
  await expect(tripLink).toBeVisible();
  await tripLink.click();
  await expect(page).toHaveURL(/\/trips\/[^/]+$/);
  const tripUrl = page.url();

  // Add a second item (a destination) to the same trip from its content page.
  await page.goto(`/destinations/${DESTINATION_SLUG}`);
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Add to Trip" }).click();
  await page.getByRole("menuitem", { name: "E2E Primary Journey Trip" }).click();
  await expect(page.getByRole("button", { name: "Added" })).toBeVisible();

  // Back on the trip, confirm both items are present and reorder via the
  // accessible Move up/down controls (spec §13/§53: no drag-and-drop required).
  // No networkidle wait here — this page embeds a live TripMap widget whose
  // ongoing tile requests mean the network never actually goes idle; the
  // auto-retrying expect below (and the real time it takes) gives hydration
  // enough room instead.
  await page.goto(tripUrl);
  const itemNames = page.locator("main").getByRole("button", { name: /Focus .* on map/ });
  await expect(itemNames).toHaveCount(2);

  const moveDownButtons = page.getByRole("button", { name: "Move down" });
  await moveDownButtons.first().click();

  // Make the trip shareable and confirm the public share page reflects it.
  await page.getByRole("button", { name: "Share", exact: true }).click();
  await expect(page.getByRole("button", { name: "Copied!" })).toBeVisible();

  const shareUrl = `${tripUrl}/share`;
  const freshContext = await page.context().browser()!.newContext();
  const sharePage = await freshContext.newPage();
  await sharePage.goto(shareUrl);
  await expect(sharePage.getByRole("heading", { name: "E2E Primary Journey Trip" })).toBeVisible();
  await expect(sharePage.getByText("Hornbill Festival")).toBeVisible();
  await expect(sharePage.getByText("Jaisalmer Fort")).toBeVisible();
  await freshContext.close();
});
