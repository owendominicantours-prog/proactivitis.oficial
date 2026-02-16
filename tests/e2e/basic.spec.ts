import { test, expect } from "@playwright/test";

test("home renders", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveTitle(/Proactivitis/i);
});

test("tours page renders hero", async ({ page }) => {
  await page.goto("/tours", { waitUntil: "domcontentloaded" });
  await expect(page.locator("h1").first()).toBeVisible();
});
