import { test, expect } from "@playwright/test";

test("homepage shows brand name", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("text=Dish Shuffle").first()).toBeVisible();
});
