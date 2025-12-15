import { test, expect } from "@playwright/test";

const PAGES = ["/", "/recipes", "/blog", "/about", "/contact"];

for (const path of PAGES) {
  test(`page ${path} loads without console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto(path);

    // At least some visible content on the page (body text)
    await expect(page.locator("body")).toBeVisible();
    expect(errors).toEqual([]);
  });
}
