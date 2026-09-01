import { test, expect } from "@playwright/test";

/** Spec §64's second named journey: Search → Result → Content. */
test("search for a known festival and open its detail page", async ({ page }) => {
  await page.goto("/search?q=Hornbill");
  await expect(page.getByText(/result.*for/i).first()).toBeVisible();

  const result = page.getByRole("link", { name: /Hornbill Festival/i }).first();
  await expect(result).toBeVisible();
  await result.click();

  await expect(page).toHaveURL(/\/festivals\/hornbill-festival$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Hornbill Festival");
});

test("a query with no matches shows the empty state, not an error", async ({ page }) => {
  await page.goto("/search?q=zzzzznonexistentquery9999");
  await expect(page.getByText("No results").first()).toBeVisible();
});
