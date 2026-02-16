import { expect, test } from "@playwright/test";

test("hotel landing renders quote widget", async ({ page }) => {
  await page.goto("/hoteles/bahia-principe-grand-bavaro", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#hotel-quote-widget")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("sosua party boat landing is reachable", async ({ page }) => {
  await page.goto("/sosua/party-boat/sosua-party-boat", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveTitle(/Sosua|Party Boat|Proactivitis/i);
  await expect(page.getByRole("main")).toContainText(/Sosua|Party Boat/i);
});
